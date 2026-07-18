/**
 * The designed "no photo yet" tile for a portfolio gallery slot. Publicly
 * visible until a real photo is uploaded, so it reads as an intentional design
 * element — photo-frame icon + short label — never a broken image or gray box.
 *
 * Unlike ProcessStepPlaceholder (which uses the case-study `--cs-*` scope),
 * this uses the SITE tokens directly (`bg-cream`, `text-forest`) because the
 * portfolio page isn't case-study-accented — and site tokens are runtime
 * themable via the layout's CSS-var override, so a custom site theme recolors
 * these placeholders too. Pure presentational: safe in server + client trees.
 */
export default function GalleryPlaceholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-[inherit] bg-cream ring-1 ring-inset ring-forest/10">
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-7 text-forest/50"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
      <span className="text-[0.62rem] font-medium uppercase tracking-[0.14em] text-forest/55">
        Gallery photo
      </span>
    </div>
  );
}
