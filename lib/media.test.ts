import { describe, it, expect } from "vitest";
import { mediaKindFromUrl, posterKeyFor } from "./media";

describe("mediaKindFromUrl", () => {
  it("detects video from .mp4 and .webm extensions", () => {
    expect(mediaKindFromUrl("https://cdn.example.com/spotlight/clip.mp4")).toBe("video");
    expect(mediaKindFromUrl("https://cdn.example.com/spotlight/clip.webm")).toBe("video");
  });

  it("detects gif from .gif extension", () => {
    expect(mediaKindFromUrl("https://cdn.example.com/spotlight/loop.gif")).toBe("gif");
  });

  it("falls back to image for anything else, including no extension", () => {
    expect(mediaKindFromUrl("https://cdn.example.com/spotlight/photo.jpg")).toBe("image");
    expect(mediaKindFromUrl("https://cdn.example.com/spotlight/photo")).toBe("image");
  });

  it("ignores query strings and hash fragments after the extension", () => {
    expect(mediaKindFromUrl("https://cdn.example.com/clip.mp4?t=123")).toBe("video");
    expect(mediaKindFromUrl("https://cdn.example.com/loop.gif#frame2")).toBe("gif");
    expect(mediaKindFromUrl("https://cdn.example.com/clip.mp4?width=400#preview")).toBe("video");
  });

  it("is case-insensitive on the extension", () => {
    expect(mediaKindFromUrl("https://cdn.example.com/CLIP.MP4")).toBe("video");
    expect(mediaKindFromUrl("https://cdn.example.com/LOOP.GIF")).toBe("gif");
  });
});

describe("posterKeyFor", () => {
  it("swaps a trailing .image key for .poster", () => {
    expect(posterKeyFor("caseStudy.natural-beauty.spotlight.1.image")).toBe(
      "caseStudy.natural-beauty.spotlight.1.poster",
    );
  });

  it("leaves keys that don't end in .image unchanged", () => {
    expect(posterKeyFor("caseStudy.natural-beauty.spotlight.1.poster")).toBe(
      "caseStudy.natural-beauty.spotlight.1.poster",
    );
    expect(posterKeyFor("caseStudy.natural-beauty.title")).toBe(
      "caseStudy.natural-beauty.title",
    );
  });

  it("only strips the final .image occurrence, not one mid-key", () => {
    expect(posterKeyFor("caseStudy.image.spotlight.1.image")).toBe(
      "caseStudy.image.spotlight.1.poster",
    );
  });
});
