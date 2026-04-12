/// <reference types="vite/client" />

declare global {
  /** Metricool `be.js` tracker / embed */
  interface Window {
    beTracker?: {
      t: (config: { hash: string }) => void;
    };
  }
}

export {};
