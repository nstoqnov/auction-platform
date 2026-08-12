import { useEffect, useRef } from "react";

/**
 * Adds an `is-visible` class to the element (and any descendants marked with
 * `data-reveal`) when it scrolls into view. Pairs with the `.reveal` CSS in
 * index.css. Respects prefers-reduced-motion via that stylesheet.
 *
 * Usage:
 *   const ref = useReveal();
 *   <section ref={ref} className="reveal"> ... </section>
 */
export function useReveal({ threshold = 0.15, once = true } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If IntersectionObserver is unavailable, just show content.
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove("is-visible");
          }
        });
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return ref;
}

/**
 * Observes every element inside a container that has the `.reveal` class and
 * reveals them individually as they enter the viewport. Optional stagger via
 * a `--reveal-delay` CSS var set per element by the caller.
 */
export function useRevealGroup({ threshold = 0.12 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll(".reveal"));
    if (items.length === 0) return;

    if (typeof IntersectionObserver === "undefined") {
      items.forEach((i) => i.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -6% 0px" }
    );

    items.forEach((i) => observer.observe(i));
    return () => observer.disconnect();
  });

  return ref;
}
