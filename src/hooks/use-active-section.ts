"use client";

import { useEffect, useState } from "react";

const ROOT_MARGIN = "-30% 0px -69% 0px";

/**
 * Returns the id of the section crossing the line at 30% of the viewport, or
 * null while the hero ("inicio") is the current one. At the bottom of the page
 * the last id is forced so a short last section stays reachable.
 */
export function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join("|");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const list = key.split("|");
    const hero = list[0];
    const last = list[list.length - 1];
    const crossing = new Set<string>();

    const compute = () => {
      const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2;
      let next: string | null = null;
      if (atBottom) {
        next = last;
      } else {
        for (const id of list) if (crossing.has(id)) next = id;
      }
      setActive(next === hero ? null : next);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) crossing.add(entry.target.id);
          else crossing.delete(entry.target.id);
        }
        compute();
      },
      { rootMargin: ROOT_MARGIN },
    );

    for (const id of list) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    window.addEventListener("scroll", compute, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", compute);
    };
  }, [key]);

  return active;
}
