"use client";

/**
 * Static full-screen overlay layer shared by every page: page-transition
 * curtain, film grain, custom cursor and ambient glow.
 * (The first-visit loader lives on the home page only — see Loader.tsx —
 * matching the original markup where case/cv pages had no loader.)
 */
export function Overlays() {
  return (
    <>
      <div className="curtain" aria-hidden="true">
        <span className="curtain__mark">
          YA<i />
        </span>
      </div>

      <div className="grain" aria-hidden="true" />
      <div className="cursor" aria-hidden="true">
        <span className="cursor__label" />
      </div>
      <div className="glow" aria-hidden="true" />
    </>
  );
}
