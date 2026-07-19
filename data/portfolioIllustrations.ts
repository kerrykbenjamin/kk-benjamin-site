export type PortfolioIllustration = {
  id: string;
  /** Content-key number — fixed to this id regardless of display order, so
   * reordering only changes visual sequence, never which content a slot reads. */
  n: number;
  defaultImage: string;
  /** Default caption copy (registry defaults). Empty = no caption until edited. */
  defaultTitle: string;
  defaultTagline: string;
};

/**
 * Total tiles in the portfolio "Illustrations and Projects" gallery. Raise this
 * to add more slots — the extra tiles, their editable image/caption fields
 * (lib/content/registry.ts), and their reorder ids (app/api/content/order) all
 * derive from the list below, so no other change is needed.
 */
export const GALLERY_SLOT_COUNT = 16;

const named: PortfolioIllustration[] = [
  {
    id: "natural-beauty-illus",
    n: 1,
    defaultImage: "/images/natural-beauty.jpg",
    defaultTitle: "Natural Beauty",
    defaultTagline: "Brand identity, content direction, campaign system",
  },
  {
    id: "editorial-strategy-illus",
    n: 2,
    defaultImage: "/images/hero.png",
    defaultTitle: "Editorial Strategy",
    defaultTagline: "Marketing positioning, visuals, storytelling rhythm",
  },
];

/**
 * The 2 named real tiles + generated empty slots up to GALLERY_SLOT_COUNT.
 * Generated slots default to no image (the styled gallery placeholder renders
 * until a photo is uploaded) and no caption.
 */
export const portfolioIllustrations: PortfolioIllustration[] = [
  ...named,
  ...Array.from({ length: Math.max(0, GALLERY_SLOT_COUNT - named.length) }, (_, i) => ({
    id: `gallery-slot-${named.length + i + 1}`,
    n: named.length + i + 1,
    defaultImage: "",
    defaultTitle: "",
    defaultTagline: "",
  })),
];
