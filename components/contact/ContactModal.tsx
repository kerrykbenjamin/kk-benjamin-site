"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useEdit } from "@/components/edit/EditProvider";
import ContactForm from "./ContactForm";

/**
 * "Get in touch" launcher + contact-form modal. The modal reuses the site's
 * established overlay mechanics (same as the Lightbox): role="dialog" +
 * aria-modal, Esc / backdrop / × close, focus moved in on open and returned
 * to the launcher on close, Tab trapped inside, body scroll locked, z-[90]
 * (above header 50 / mobile nav 60 / edit toolbar 70 / toasts 80 — and the
 * lightbox never co-occurs with it).
 *
 * `children` is the server-rendered (editable) button label. While "Edit
 * site" is ON, clicking the label must open the TEXT EDITOR, not the modal —
 * so the launcher ignores clicks in edit mode.
 */
export default function ContactModal({ children }: { children: ReactNode }) {
  const { editMode } = useEdit();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    launcherRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusables = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'button, input:not([type="checkbox"][aria-hidden]), textarea, select, a[href]',
          ),
        ).filter((el) => el.tabIndex !== -1);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && (active === first || !dialog.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !dialog.contains(active))) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    // Focus the first form field on open (fall back to the × button).
    const dialog = dialogRef.current;
    (
      dialog?.querySelector<HTMLElement>("input:not([aria-hidden])") ??
      dialog?.querySelector<HTMLElement>("button")
    )?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={() => {
          if (!editMode) setOpen(true);
        }}
        className="group inline-flex items-center justify-center gap-2 rounded-[6px] bg-cream px-6 py-3.5 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-forest transition-colors duration-200 hover:bg-ivory"
      >
        {children}
        <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
          →
        </span>
      </button>

      {open && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Contact form"
          className="fixed inset-0 z-[90] flex items-center justify-center bg-forest-deep/80 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[16px] bg-cream p-6 text-forest shadow-xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-sage">Get in touch</p>
                <h2 className="mt-2 font-display text-h3 font-semibold text-forest">
                  Send Kerry a message
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close contact form"
                onClick={close}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-forest/60 transition-colors hover:bg-forest/5 hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
              >
                <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
