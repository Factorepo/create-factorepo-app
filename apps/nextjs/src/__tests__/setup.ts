import { afterAll, vi } from "vitest";

import { trackTimers } from "./leaked-timers";

import "@testing-library/jest-dom/vitest";

// jsdom ships no matchMedia; framer-motion's useReducedMotion calls it on mount.
window.matchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// jsdom ships no ResizeObserver; Radix primitives measure their trigger on mount.
class ResizeObserverMock {
  observe() {
    // jsdom does no layout, so there is nothing to report.
  }
  unobserve() {
    // jsdom does no layout, so there is nothing to report.
  }
  disconnect() {
    // jsdom does no layout, so there is nothing to report.
  }
}

window.ResizeObserver = ResizeObserverMock;

// jsdom ships no IntersectionObserver; framer-motion's whileInView observes on mount.
class IntersectionObserverMock {
  readonly root = null;
  readonly rootMargin = "";
  readonly scrollMargin = "";
  readonly thresholds: number[] = [];
  observe() {
    // jsdom does no layout, so nothing ever enters the viewport.
  }
  unobserve() {
    // jsdom does no layout, so nothing ever enters the viewport.
  }
  disconnect() {
    // jsdom does no layout, so nothing ever enters the viewport.
  }
  takeRecords() {
    return [];
  }
}

window.IntersectionObserver = IntersectionObserverMock;

// jsdom ships no elementFromPoint; input-otp probes for a password-manager badge on focus.
document.elementFromPoint = () => null;

// The teardown of vitest deletes window while the node timers keep running, so a
// timer that a component left behind wakes up with no window and fails the run.
// input-otp leaks one setState per keystroke. Cancel what is still pending.
const { sweep } = trackTimers(globalThis);
afterAll(sweep);
