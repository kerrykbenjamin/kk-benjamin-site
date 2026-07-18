"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import { useRouter } from "next/navigation";
import { useEdit } from "./EditProvider";
import { getField } from "@/lib/content/registry";

export default function EditableText({
  fieldKey,
  value: initial,
  as = "span",
  className = "",
}: {
  fieldKey: string;
  value: string;
  as?: ElementType;
  className?: string;
}) {
  const { editMode, toast } = useEdit();
  const router = useRouter();
  const field = getField(fieldKey);
  const max = field?.maxLength ?? 300;

  const [value, setValue] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(initial);
    if (!editing) setDraft(initial);
  }, [initial, editing]);

  useEffect(() => {
    const el = taRef.current;
    if (editing && el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [editing, draft]);

  const Tag = as;

  if (!editMode) {
    return <Tag className={className}>{value}</Tag>;
  }

  if (!editing) {
    return (
      <Tag
        className={`${className} cursor-text rounded-[4px] px-0.5 outline-dashed outline-1 outline-sage/50 transition-colors hover:bg-sage/5 hover:outline-sage`}
        role="button"
        tabIndex={0}
        title="Click to edit"
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setDraft(value);
            setEditing(true);
          }
        }}
      >
        {value}
        <span aria-hidden className="ml-1 select-none align-middle text-[0.7em] text-sage">
          ✎
        </span>
      </Tag>
    );
  }

  const len = draft.trim().length;

  async function save() {
    const clean = draft.replace(/\r\n/g, "\n").trim();
    if (!clean) {
      toast("This can't be empty.", "error");
      return;
    }
    if (clean.length > max) {
      toast(`Too long — max ${max} characters.`, "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/content/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: fieldKey, value: clean }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Save failed.", "error");
        setSaving(false);
        return;
      }
      setValue(data.value);
      setEditing(false);
      setSaving(false);
      toast("Saved");
      router.refresh();
    } catch {
      toast("Save failed. Check your connection.", "error");
      setSaving(false);
    }
  }

  return (
    <span className="block">
      <textarea
        ref={taRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        autoFocus
        rows={1}
        className={`${className} block w-full resize-none rounded-[6px] border border-sage bg-white/70 p-2 outline-none`}
      />
      <span className="mt-1.5 flex items-center gap-2 font-sans text-xs normal-case tracking-normal">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-[5px] bg-forest px-3 py-1 font-medium text-cream disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(false);
            setDraft(value);
          }}
          className="rounded-[5px] px-3 py-1 font-medium text-forest/60 hover:text-forest"
        >
          Cancel
        </button>
        <span className={`ml-auto ${len > max ? "text-[#8a2d2d]" : "text-forest/40"}`}>
          {len}/{max}
        </span>
      </span>
    </span>
  );
}
