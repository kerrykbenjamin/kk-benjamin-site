"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Campaign-spotlight video player. Behavior contract (see lib/media.ts):
 *  - Autoplays muted + looping + inline (`muted` + `playsInline` are what let
 *    iOS Safari autoplay at all) — but ONLY once the slot nears the viewport
 *    (IntersectionObserver; the spotlight is below the fold, so the video
 *    never competes with page load) and NEVER for prefers-reduced-motion
 *    users, who get the poster frame + a visible play control instead.
 *  - `preload="none"` + poster ⇒ no blank/black box and no eager download.
 *  - Overlay controls: play/pause + mute/unmute, 44×44 minimum tap targets,
 *    aria-labels that track state, keyboard focusable. Styled on the
 *    spotlight's dark surface (`--cs-dark`/`--cs-on-dark` roles).
 *  - Fills its aspect-ratio wrapper exactly like a photo slot (absolute
 *    inset-0 + object-cover) ⇒ a mixed photo/GIF/video row stays even.
 *  - Excluded from the lightbox by design — it already plays in place.
 */
export default function SpotlightVideo({
  src,
  poster,
  alt,
}: {
  src: string;
  poster?: string;
  alt?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  // Set once the USER pauses — in-view autoplay must not fight that choice.
  const userPaused = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap || !video) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!reduced && !userPaused.current) video.play().catch(() => {});
        } else {
          video.pause(); // off-screen: stop spending battery/bandwidth
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, [reduced]);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPaused.current = false;
      video.play().catch(() => {});
    } else {
      userPaused.current = true;
      video.pause();
    }
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  const btn =
    "pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full " +
    "bg-[var(--cs-dark,#182312)]/75 text-[var(--cs-on-dark,#FBF7F1)] backdrop-blur-sm " +
    "transition-colors hover:bg-[var(--cs-dark,#182312)] " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cs-on-dark,#FBF7F1)]";

  return (
    <div ref={wrapRef} className="absolute inset-0">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- decorative
          campaign clips have no dialogue track; they upload without captions */}
      <video
        ref={videoRef}
        src={src}
        poster={poster || undefined}
        muted
        loop
        playsInline
        preload="none"
        aria-label={alt}
        className="absolute inset-0 h-full w-full object-cover"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Reduced-motion (or not-yet-started) state: prominent centered play */}
      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play video"
          className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--cs-dark,#182312)]/75 text-[var(--cs-on-dark,#FBF7F1)] backdrop-blur-sm transition-colors hover:bg-[var(--cs-dark,#182312)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cs-on-dark,#FBF7F1)]"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="ml-0.5 h-6 w-6 fill-current">
            <path d="M8 5.5v13l11-6.5-11-6.5Z" />
          </svg>
        </button>
      )}

      {/* Persistent corner controls (pause + unmute) */}
      <div className="pointer-events-none absolute bottom-2.5 right-2.5 flex gap-2">
        {playing && (
          <button
            type="button"
            onClick={togglePlay}
            aria-label="Pause video"
            className={btn}
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M7 5h4v14H7V5Zm6 0h4v14h-4V5Z" />
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Unmute video" : "Mute video"}
          className={btn}
        >
          {muted ? (
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M4 9v6h4l5 4V5L8 9H4Zm12.6 3 2.7-2.7-1.4-1.4-2.7 2.7-2.7-2.7-1.4 1.4 2.7 2.7-2.7 2.7 1.4 1.4 2.7-2.7 2.7 2.7 1.4-1.4-2.7-2.7Z" />
            </svg>
          ) : (
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M4 9v6h4l5 4V5L8 9H4Zm11.5 3a3.5 3.5 0 0 0-2-3.15v6.3a3.5 3.5 0 0 0 2-3.15Zm-2-7.36v2.09A5.5 5.5 0 0 1 17.5 12a5.5 5.5 0 0 1-4 5.27v2.09A7.5 7.5 0 0 0 19.5 12a7.5 7.5 0 0 0-6-7.36Z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
