import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "solid" | "outline" | "outlineLight" | "light" | "link";

type Props = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  arrow?: boolean;
  className?: string;
};

const shell =
  "inline-flex items-center justify-center gap-2 rounded-[6px] px-6 py-3.5 text-[0.72rem] font-medium uppercase tracking-[0.16em] transition-colors duration-200";

const variants: Record<Variant, string> = {
  solid: `${shell} bg-forest text-cream hover:bg-forest-deep`,
  outline: `${shell} border border-forest/25 text-forest hover:bg-forest hover:text-cream`,
  // For dark surfaces (e.g. the hero's forest-deep scrim) — cream instead of forest.
  outlineLight: `${shell} border border-cream/40 text-cream hover:bg-cream hover:text-forest`,
  light: `${shell} bg-cream text-forest hover:bg-ivory`,
  link: "inline-flex items-center gap-1.5 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-forest transition-colors hover:text-sage",
};

export default function ButtonLink({
  href,
  children,
  variant = "solid",
  arrow = false,
  className = "",
}: Props) {
  const cls = `group ${variants[variant]} ${className}`;
  const content = (
    <>
      {children}
      {arrow && (
        <span
          aria-hidden
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        >
          →
        </span>
      )}
    </>
  );

  const isExternal = /^(mailto:|tel:|https?:)/.test(href);
  if (isExternal) {
    const external = href.startsWith("http")
      ? { target: "_blank", rel: "noopener noreferrer" }
      : {};
    return (
      <a href={href} className={cls} {...external}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={cls}>
      {content}
    </Link>
  );
}
