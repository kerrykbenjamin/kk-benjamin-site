"use client";

import { useState, type FormEvent } from "react";

/**
 * The contact form — ONE component, four visual variants sharing all field
 * and submission logic (per-variant presentation only, no duplicated form
 * code). Switch the live style by changing ACTIVE_CONTACT_FORM_VARIANT:
 *
 *  "stack"     — 1. simple stack: name, email, message
 *  "darkPanel" — 2. same fields on a forest-deep card, blush submit
 *  "twoColumn" — 3. (ACTIVE) first+last name side by side (stacked <640px),
 *                 email, subject (optional), message
 *  "underline" — 4. borderless underlined fields, outlined submit
 *
 * Delivery: Web3Forms (no backend; works on Netlify). The public access key
 * lives in NEXT_PUBLIC_WEB3FORMS_KEY — the destination inbox is bound to the
 * key on Web3Forms' side, so the email address never appears in this code.
 * Until the key is set, submissions fail with a clear message (never a fake
 * success). A hidden `botcheck` honeypot feeds Web3Forms' spam filtering.
 */

export type ContactFormVariant = "stack" | "darkPanel" | "twoColumn" | "underline";
export const ACTIVE_CONTACT_FORM_VARIANT: ContactFormVariant = "twoColumn";

const ENDPOINT = "https://api.web3forms.com/submit";

type FieldId = "firstName" | "lastName" | "name" | "email" | "subject" | "message";
type Values = Record<FieldId, string>;

const EMPTY: Values = { firstName: "", lastName: "", name: "", email: "", subject: "", message: "" };

/** Which fields each variant shows, in order ("nameRow" = first+last pair). */
const VARIANT_FIELDS: Record<ContactFormVariant, ("nameRow" | FieldId)[]> = {
  stack: ["name", "email", "message"],
  darkPanel: ["name", "email", "message"],
  twoColumn: ["nameRow", "email", "subject", "message"],
  underline: ["name", "email", "message"],
};

const LABELS: Record<FieldId, string> = {
  firstName: "First name",
  lastName: "Last name",
  name: "Name",
  email: "Email",
  subject: "Subject (optional)",
  message: "Message",
};

/** Per-variant presentation: wrapper, input, label, submit-button classes. */
const STYLES: Record<
  ContactFormVariant,
  { wrap: string; label: string; input: string; submit: string; error: string }
> = {
  stack: {
    wrap: "",
    label: "text-[0.68rem] font-medium uppercase tracking-[0.16em] text-forest/60",
    input:
      "mt-1.5 w-full rounded-[8px] border border-forest/20 bg-ivory px-4 py-3 text-[0.95rem] text-forest placeholder:text-forest/35 focus:outline-2 focus:outline-offset-1 focus:outline-sage",
    submit:
      "inline-flex items-center justify-center gap-2 rounded-[6px] bg-forest px-6 py-3.5 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-cream transition-colors hover:bg-forest-deep disabled:opacity-60",
    error: "text-[#8a2d2d]",
  },
  darkPanel: {
    wrap: "rounded-[16px] bg-forest-deep p-6 text-cream sm:p-8",
    label: "text-[0.68rem] font-medium uppercase tracking-[0.16em] text-cream/60",
    input:
      "mt-1.5 w-full rounded-[8px] border border-cream/15 bg-forest-surface px-4 py-3 text-[0.95rem] text-cream placeholder:text-cream/35 focus:outline-2 focus:outline-offset-1 focus:outline-blush",
    submit:
      "inline-flex items-center justify-center gap-2 rounded-[6px] bg-blush px-6 py-3.5 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-forest-deep transition-colors hover:bg-blush/85 disabled:opacity-60",
    error: "text-blush",
  },
  twoColumn: {
    wrap: "",
    label: "text-[0.68rem] font-medium uppercase tracking-[0.16em] text-forest/60",
    input:
      "mt-1.5 w-full rounded-[8px] border border-forest/20 bg-ivory px-4 py-3 text-[0.95rem] text-forest placeholder:text-forest/35 focus:outline-2 focus:outline-offset-1 focus:outline-sage",
    submit:
      "inline-flex items-center justify-center gap-2 rounded-[6px] bg-forest px-6 py-3.5 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-cream transition-colors hover:bg-forest-deep disabled:opacity-60",
    error: "text-[#8a2d2d]",
  },
  underline: {
    wrap: "",
    label: "text-[0.68rem] font-medium uppercase tracking-[0.16em] text-forest/60",
    input:
      "mt-1 w-full rounded-none border-0 border-b border-forest/25 bg-transparent px-1 py-2.5 text-[0.95rem] text-forest placeholder:text-forest/35 focus:border-sage focus:outline-none",
    submit:
      "inline-flex items-center justify-center gap-2 rounded-[6px] border border-forest/30 px-6 py-3.5 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-forest transition-colors hover:bg-forest hover:text-cream disabled:opacity-60",
    error: "text-[#8a2d2d]",
  },
};

const AUTOCOMPLETE: Partial<Record<FieldId, string>> = {
  firstName: "given-name",
  lastName: "family-name",
  name: "name",
  email: "email",
};

export default function ContactForm({
  variant = ACTIVE_CONTACT_FORM_VARIANT,
}: {
  variant?: ContactFormVariant;
}) {
  const s = STYLES[variant];
  const fields = VARIANT_FIELDS[variant];
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<FieldId, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const flat: FieldId[] = fields.flatMap((f) => (f === "nameRow" ? ["firstName", "lastName"] as FieldId[] : [f]));

  function set(id: FieldId, v: string) {
    setValues((prev) => ({ ...prev, [id]: v }));
    setErrors((prev) => ({ ...prev, [id]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<FieldId, string>> = {};
    for (const id of flat) {
      const v = values[id].trim();
      if (id === "subject") continue; // optional
      if (!v) {
        next[id] = `Please add your ${LABELS[id].toLowerCase().replace(" (optional)", "")}.`;
      } else if (id === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        next[id] = "That email address doesn't look right — please double-check it.";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    // Honeypot: real visitors never see or tick this box. NB: a checkbox's
    // `.value` is "on" even when unchecked — `.checked` is the real signal.
    const botcheck = (e.currentTarget.elements.namedItem("botcheck") as HTMLInputElement)?.checked;
    if (botcheck) {
      setStatus("success"); // swallow bot submissions silently
      return;
    }
    const key = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
    if (!key) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    const name =
      variant === "twoColumn"
        ? `${values.firstName.trim()} ${values.lastName.trim()}`.trim()
        : values.name.trim();
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: key,
          name,
          email: values.email.trim(),
          subject: values.subject.trim() || `Website message from ${name}`,
          message: values.message.trim(),
          from_name: "KK Benjamin website",
          botcheck: "",
        }),
      });
      const data = await res.json();
      setStatus(res.ok && data.success ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className={`${s.wrap} py-6 text-center`} role="status">
        <p className="font-display text-h3 font-semibold">Thanks — your message has been sent.</p>
        <p className={`mt-2 text-sm ${variant === "darkPanel" ? "text-cream/70" : "text-forest/60"}`}>
          Kerry will get back to you at the email you provided.
        </p>
      </div>
    );
  }

  const input = (id: FieldId, type = "text", rows?: number) => {
    const err = errors[id];
    const common = {
      id: `contact-${id}`,
      name: id,
      value: values[id],
      required: id !== "subject",
      "aria-invalid": err ? true : undefined,
      "aria-describedby": err ? `contact-${id}-error` : undefined,
      autoComplete: AUTOCOMPLETE[id],
      onChange: (e: { target: { value: string } }) => set(id, e.target.value),
    };
    return (
      <div className={id === "firstName" || id === "lastName" ? "" : "mt-4 first:mt-0"}>
        <label htmlFor={`contact-${id}`} className={s.label}>
          {LABELS[id]}
        </label>
        {rows ? (
          <textarea {...common} rows={rows} className={`${s.input} resize-y`} />
        ) : (
          <input {...common} type={type} className={s.input} />
        )}
        {err && (
          <p id={`contact-${id}-error`} role="alert" className={`mt-1 text-xs font-medium ${s.error}`}>
            {err}
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={onSubmit} noValidate className={s.wrap}>
      {/* Honeypot — hidden from real visitors and screen readers */}
      <input
        type="checkbox"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      {fields.map((f) =>
        f === "nameRow" ? (
          /* Side by side ≥640px, stacked single-column below (375px comfort) */
          <div key="nameRow" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {input("firstName")}
            {input("lastName")}
          </div>
        ) : (
          <div key={f}>{input(f, f === "email" ? "email" : "text", f === "message" ? 5 : undefined)}</div>
        ),
      )}
      {status === "error" && (
        <p role="alert" className={`mt-4 text-sm font-medium ${s.error}`}>
          Sorry — your message couldn&apos;t be sent. Please try again, or email
          directly using the address on this page.
        </p>
      )}
      <div className="mt-6">
        <button type="submit" disabled={status === "sending"} className={s.submit}>
          {status === "sending" ? "Sending…" : status === "error" ? "Try again" : "Send message"}
        </button>
      </div>
    </form>
  );
}
