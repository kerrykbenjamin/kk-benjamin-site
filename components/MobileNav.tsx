"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { navLinks } from "@/data/nav";
import { site } from "@/data/site";

function titleCase(label: string) {
  return label.charAt(0) + label.slice(1).toLowerCase();
}

/**
 * Full-screen mobile menu — FAIL-SAFE by construction:
 * - Closed state unmounts immediately (`return null`); nothing is ever left
 *   covering the page. (A previous framer-motion AnimatePresence exit could
 *   stall and leave an invisible full-screen layer blocking all taps.)
 * - No entrance/exit animation at all: nothing can strand the menu hidden,
 *   half-open, or invisibly covering the page. Do not add opacity/transform
 *   animations here without a fail-visible guarantee.
 */
export default function MobileNav({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  // Lock body scroll + close on Escape while the overlay is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      id="mobile-nav"
      className="fixed inset-0 z-[60] md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
    >
      <div className="flex h-full flex-col bg-forest-deep text-cream">
        <div className="flex h-16 items-center justify-between px-6">
          <Image
            src="/images/kb-logo.png"
            alt="KK Benjamin"
            width={439}
            height={400}
            className="h-10 w-auto invert"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center text-cream"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-1 flex-col justify-center gap-1 px-6 pb-24">
          {navLinks.map((l) => {
            const active =
              l.href === pathname ||
              (l.href !== "/" && l.href !== "#contact" && pathname.startsWith(l.href));
            return (
              <div key={l.label}>
                <Link
                  href={l.href}
                  onClick={onClose}
                  className={`block border-b border-cream/10 py-4 font-display text-4xl font-semibold transition-colors hover:text-blush ${
                    active ? "text-blush" : "text-cream"
                  }`}
                >
                  {titleCase(l.label)}
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="space-y-1 px-6 pb-12 text-sm text-cream/70">
          <a href={site.mailto} className="block hover:text-blush">
            {site.email}
          </a>
          <span className="block">{site.location}</span>
        </div>
      </div>
    </div>
  );
}
