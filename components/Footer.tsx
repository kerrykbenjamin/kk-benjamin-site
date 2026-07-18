import Image from "next/image";
import Link from "next/link";
import Container from "./Container";
import { navLinks } from "@/data/nav";
import { site } from "@/data/site";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-cream/10 bg-forest-deep text-cream/60">
      <Container className="flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:justify-between">
        {/* self-start: in the mobile flex-col, default align-items:stretch was
            stretching this image to full container width while h-9 pinned its
            height — distorting the logo. Opting the item out of cross-axis
            stretch preserves the intrinsic ratio at every breakpoint. */}
        <Image
          src="/images/kb-logo.png"
          alt="KK Benjamin"
          width={439}
          height={400}
          className="h-9 w-auto self-start invert"
        />
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[0.7rem] uppercase tracking-[0.16em]">
          {navLinks.map((l) => (
            <Link key={l.label} href={l.href} className="transition-colors hover:text-blush">
              {l.label}
            </Link>
          ))}
        </nav>
        <span className="text-xs">
          © {year} {site.name}
        </span>
      </Container>
    </footer>
  );
}
