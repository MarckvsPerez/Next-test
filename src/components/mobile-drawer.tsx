"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NavLinks } from "@/components/nav-links";
import { nameClass } from "@/components/nav-styles";

const buttonClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg border border-border-strong px-3 text-sm transition-colors hover:bg-surface";

function lockScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

/** Menu button + off-canvas drawer (native modal <dialog>), below `lg`. */
export function MobileDrawer() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Set when a link closes the drawer: focus goes to the target heading, not the button.
  const skipRestore = useRef(false);

  const openDrawer = () => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    lockScroll(true);
    setOpen(true);
    closeRef.current?.focus();
  };

  const closeDrawer = () => dialogRef.current?.close();

  // Single place that reacts to every way of closing (Esc, scrim, button, link, resize).
  const handleClose = useCallback(() => {
    lockScroll(false);
    setOpen(false);
    if (skipRestore.current) {
      skipRestore.current = false;
      return;
    }
    buttonRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia?.("(min-width: 64rem)");
    const onChange = (event: MediaQueryListEvent) => {
      const dialog = dialogRef.current;
      // close() on a closed dialog fires no event, which would leave the flag stale.
      if (event.matches && dialog?.open) {
        skipRestore.current = true;
        dialog.close();
      }
    };
    mq?.addEventListener("change", onChange);
    return () => {
      mq?.removeEventListener("change", onChange);
      lockScroll(false);
    };
  }, []);

  const onDialogClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    // A click on ::backdrop targets the dialog itself, outside the panel box.
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX > rect.right || event.clientY > rect.bottom) closeDrawer();
  };

  const onNavigate = (headingId: string) => {
    // Closing here releases the lock synchronously, before the anchor jump runs.
    skipRestore.current = true;
    closeDrawer();
    // The `close` event is queued as a task and fires after the anchor jump.
    lockScroll(false);
    document.getElementById(headingId)?.focus({ preventScroll: true });
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="menu-movil"
        onClick={openDrawer}
        className={`${buttonClass} lg:hidden`}
      >
        Menú
        <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M3 5h14M3 10h14M3 15h14" />
        </svg>
      </button>

      <dialog
        ref={dialogRef}
        id="menu-movil"
        aria-label="Menú de navegación"
        onClose={handleClose}
        onClick={onDialogClick}
        className="drawer fixed left-0 top-0 m-0 h-dvh max-h-none w-80 max-w-[85vw] overflow-y-auto overscroll-contain border-r border-border bg-background p-0 text-foreground"
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <a href="#inicio" onClick={() => onNavigate("hero-title")} className={nameClass}>
            Marc Pérez
          </a>
          <button ref={closeRef} type="button" onClick={closeDrawer} className={buttonClass}>
            Cerrar
            <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>
        <nav aria-label="Principal" className="p-4">
          <NavLinks onNavigate={onNavigate} />
        </nav>
      </dialog>
    </>
  );
}
