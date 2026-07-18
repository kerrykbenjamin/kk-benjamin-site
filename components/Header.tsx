"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { navLinks } from "@/data/nav";
import MobileNav from "./MobileNav";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* MobileNav must be a SIBLING of <header>, not a child: the header's
          backdrop-blur creates a containing block that would trap the overlay's
          `fixed inset-0` inside the ~64px header instead of the full viewport. */}
      <header className="sticky top-0 z-50 border-b border-forest/10 bg-cream/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 sm:px-8">
          <Link href="/" className="flex items-center" aria-label="KK Benjamin — home">
            <Image
              src="/images/kb-logo.png"
              alt="KK Benjamin"
              width={439}
              height={400}
              priority
              className="h-10 w-auto sm:h-11"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => {
              const active =
                l.href === pathname || (l.href !== "/" && pathname.startsWith(l.href));
              return (
                <Link
                  key={l.label}
                  href={l.href}
                  className={`text-[0.72rem] font-medium uppercase tracking-[0.16em] transition-colors hover:text-sage ${
                    active ? "text-forest" : "text-forest/70"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile hamburger — 44x44 tap target */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center text-forest md:hidden"
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
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
        </div>
      </header>

      <MobileNav open={open} onClose={() => setOpen(false)} pathname={pathname} />
    </>
  );
}
