"use client";

export function LoadingPage() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--bg)]">
      <div
        className="h-10 w-10 rounded-full border-2 border-[hsl(var(--accent)/0.25)] border-t-[hsl(var(--accent))] animate-spin"
        aria-hidden
      />
    </div>
  );
}
