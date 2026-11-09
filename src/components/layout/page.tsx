import type { ComponentType, ReactNode } from "react";
import type { LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

export function Page({
  children,
  className,
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div className={cn("app-page", wide && "app-page-wide", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  meta,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-5 border-b border-[var(--line)] pb-6 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {meta ? (
          <div className="mb-2 flex flex-wrap items-center gap-2 text-[12px] font-medium text-[var(--brand)]">
            {meta}
          </div>
        ) : null}
        <h1 className="font-serif text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-[var(--ink)] sm:text-[34px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[var(--ink-3)]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
  );
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--ink)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--ink-3)]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 pb-0.5">{action}</div> : null}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: ComponentType<LucideProps>;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--line-strong)] bg-[var(--surface-2)] px-6 py-12 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-3)]">
        <Icon className="h-5 w-5" strokeWidth={1.7} />
      </div>
      <h3 className="font-serif text-[18px] font-medium text-[var(--ink)]">
        {title}
      </h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-[var(--ink-3)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
