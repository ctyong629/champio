import { useEffect, useCallback } from 'react';

interface KeyHandler {
  key: string;
  handler: (e: KeyboardEvent) => void;
  modifiers?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  };
}

/**
 * Keyboard shortcut hook
 */
export function useKeyboard(handlers: KeyHandler[], deps: unknown[] = []) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    handlers.forEach(({ key, handler, modifiers }) => {
      if (e.key !== key) return;

      if (modifiers) {
        if (modifiers.ctrl && !e.ctrlKey) return;
        if (modifiers.shift && !e.shiftKey) return;
        if (modifiers.alt && !e.altKey) return;
        if (modifiers.meta && !e.metaKey) return;
      }

      e.preventDefault();
      handler(e);
    });
  }, [handlers]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, ...deps]);
}

// Common shortcuts
export function useSearchShortcut(onSearch: () => void) {
  useKeyboard([
    { key: 'k', handler: onSearch, modifiers: { ctrl: true } },
    { key: 'k', handler: onSearch, modifiers: { meta: true } },
  ]);
}

export function useEscapeShortcut(onEscape: () => void) {
  useKeyboard([{ key: 'Escape', handler: onEscape }]);
}
