import { useLayoutEffect } from "react";

let overlayCount = 0;
const listeners = new Set();

function emit() {
  listeners.forEach((fn) => fn(overlayCount > 0));
}

/** Hide the nav bar while a modal / bottom sheet is open. Pass true when visible. */
export function useModalOverlay(active) {
  useLayoutEffect(() => {
    if (!active) return;
    overlayCount += 1;
    emit();
    return () => {
      overlayCount = Math.max(0, overlayCount - 1);
      emit();
    };
  }, [active]);
}

export function subscribeModalOverlay(listener) {
  listeners.add(listener);
  listener(overlayCount > 0);
  return () => listeners.delete(listener);
}
