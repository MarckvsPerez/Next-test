import { MobileDrawer } from "@/components/mobile-drawer";
import { NavLinks } from "@/components/nav-links";
import { nameClass } from "@/components/nav-styles";

/**
 * Server shell: sticky bar below `lg`, fixed sidebar from `lg`. The interactive
 * parts are client leaves (MobileDrawer, NavLinks).
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-6 sm:px-8 lg:h-auto lg:max-w-none lg:flex-col lg:items-stretch lg:justify-start lg:gap-8 lg:px-4 lg:py-6">
        <a href="#inicio" className={nameClass}>
          Marc Pérez
        </a>
        <MobileDrawer />
        <nav aria-label="Principal" className="hidden lg:block">
          <NavLinks />
        </nav>
      </div>
    </header>
  );
}
