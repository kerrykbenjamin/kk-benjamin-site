/**
 * The "no photo yet" visual for an image slot — a framed panel with a small
 * picture glyph and an optional label. Deliberately looks INTENTIONAL (a clean
 * placeholder), never like a broken/empty box, so a page with unfilled campaign
 * photos still reads as finished.
 *
 * Pure presentational (no hooks, no server-only imports) so it can render in
 * both the server ImageSlot and the client EditableImageSlot. Colors derive from
 * the active case-study theme tokens via `color-mix` — never a new hex.
 */
export default function SlotPlaceholder({
  label,
  tone = "light",
}: {
  label?: string;
  tone?: "light" | "dark";
}) {
  const color = tone === "dark" ? "var(--cs-on-dark,#FBF7F1)" : "var(--cs-text,#1F2A19)";
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center"
      style={{ color }}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
        style={{ opacity: 0.5 }}
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
      {label && (
        <span
          className="text-[0.62rem] font-medium uppercase tracking-[0.14em]"
          style={{ opacity: 0.55 }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
