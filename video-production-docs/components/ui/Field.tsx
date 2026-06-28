import type { HTMLInputTypeAttribute, ReactNode } from "react";

const controlClass = "min-h-11 w-full rounded-xl border border-line-strong bg-surface px-3 py-2.5 text-[15px] text-fg outline-none transition placeholder:text-fg-faint focus:border-brand focus:ring-2 focus:ring-brand/15";

interface FieldProps {
  label: string; value: string | number; onChange: (value: string) => void; type?: HTMLInputTypeAttribute;
  options?: readonly (string | number)[]; rows?: number; placeholder?: string; hint?: string; full?: boolean;
}

export function Field({ label, value, onChange, type = "text", options, rows, placeholder, hint, full = true }: FieldProps) {
  return (
    <label className={full ? "col-span-1 sm:col-span-2" : "col-span-1"}>
      <span className="mb-1.5 block text-xs font-semibold text-fg-muted">{label}</span>
      {options ? (
        <select className={controlClass} value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>
      ) : rows ? (
        <textarea className={`${controlClass} resize-y`} rows={rows} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input className={controlClass} type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      )}
      {hint && <span className="mt-1 block text-xs leading-relaxed text-fg-faint">{hint}</span>}
    </label>
  );
}

export function Section({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div><h2 className="font-display text-xl font-semibold tracking-tight text-fg">{title}</h2>{description && <p className="mt-1 text-sm leading-relaxed text-fg-muted">{description}</p>}</div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function CollapsibleSection({ title, description, defaultOpen = false, children }: { title: string; description?: string; defaultOpen?: boolean; children: ReactNode }) {
  return <details open={defaultOpen} className="group rounded-2xl border border-line bg-surface">
    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3">
      <div><h3 className="text-sm font-bold text-fg">{title}</h3>{description && <p className="mt-0.5 text-xs leading-relaxed text-fg-muted">{description}</p>}</div>
      <span className="text-lg text-fg-faint transition group-open:rotate-45">＋</span>
    </summary>
    <div className="border-t border-line p-4">{children}</div>
  </details>;
}

export const formGridClass = "grid grid-cols-1 gap-4 sm:grid-cols-2";
