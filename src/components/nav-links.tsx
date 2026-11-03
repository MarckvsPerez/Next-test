"use client";

import { useActiveSection } from "@/hooks/use-active-section";
import { navItems, sectionIds } from "@/lib/content";

const linkClass =
  "relative flex min-h-11 items-center rounded-lg px-3 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground aria-[current=location]:bg-surface aria-[current=location]:text-foreground aria-[current=location]:before:absolute aria-[current=location]:before:left-0 aria-[current=location]:before:top-1/2 aria-[current=location]:before:h-5 aria-[current=location]:before:w-0.5 aria-[current=location]:before:-translate-y-1/2 aria-[current=location]:before:rounded-full aria-[current=location]:before:bg-foreground";

/** Section links with aria-current on the one in view (client leaf). */
export function NavLinks({
  onNavigate,
}: {
  onNavigate?: (headingId: string) => void;
}) {
  const active = useActiveSection(sectionIds);
  return (
    <ul className="flex flex-col gap-1">
      {navItems.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            aria-current={active === item.id ? "location" : undefined}
            onClick={onNavigate ? () => onNavigate(item.headingId) : undefined}
            className={linkClass}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
