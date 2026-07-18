export type ValueProp = {
  id: string;
  /** Content-key number — fixed to this id regardless of display order. */
  n: 1 | 2 | 3 | 4;
  title: string;
  description: string;
};

export const valueProps: ValueProp[] = [
  {
    id: "strategic-thinker",
    n: 1,
    title: "Strategic Thinker",
    description:
      "I start with research and data to uncover insights that inform smart, effective marketing strategies.",
  },
  {
    id: "creative-designer",
    n: 2,
    title: "Creative Designer",
    description:
      "I bring ideas to life with clean, intentional design that captures attention and communicates clearly.",
  },
  {
    id: "results-driven",
    n: 3,
    title: "Results Driven",
    description:
      "I focus on outcomes that matter—engagement, growth, and measurable impact.",
  },
  {
    id: "people-first",
    n: 4,
    title: "People First",
    description:
      "I create with the audience in mind, building connections that turn followers into loyal customers.",
  },
];
