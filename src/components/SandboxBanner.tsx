/**
 * Shown when VITE_SANDBOX=true (set on test.slxai.org only — not production).
 */
export function SandboxBanner() {
  const enabled = import.meta.env.VITE_SANDBOX === 'true' || import.meta.env.VITE_SANDBOX === '1';
  if (!enabled) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[200] bg-amber-500 text-amber-950 text-center text-sm font-semibold py-2 px-4 shadow-lg border-t-2 border-amber-600"
      role="status"
      aria-live="polite"
    >
      Sandbox / test environment — not production
    </div>
  );
}
