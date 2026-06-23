import type { HTMLInputTypeAttribute, ReactNode } from "react";

const controlClass = "min-h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-[15px] text-ink outline-none transition placeholder:text-neutral-400 focus:border-brand focus:ring-2 focus:ring-brand/15";

interface FieldProps {
  label: string; value: string | number; onChange: (value: string) => void; type?: HTMLInputTypeAttribute;
  options?: readonly (string | number)[]; rows?: number; placeholder?: string; hint?: string; full?: boolean;
}

export function Field({ label, value, onChange, type = "text", options, rows, placeholder, hint, full = true }: FieldProps) {
  return (
    <label className={full ? "col-span-1 sm:col-span-2" : "col-span-1"}>
      <span className="mb-1.5 block text-xs font-semibold text-neutral-600">{label}</span>
      {options ? (
        <select className={controlClass} value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>
      ) : rows ? (
        <textarea className={`${controlClass} resize-y`} rows={rows} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input className={controlClass} type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      )}
      {hint && <span className="mt-1 block text-xs leading-relaxed text-neutral-400">{hint}</span>}
    </label>
  );
}

export function Section({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div><h2 className="text-lg font-bold tracking-tight text-ink">{title}</h2>{description && <p className="mt-1 text-sm leading-relaxed text-neutral-500">{description}</p>}</div>
        {action}
      </div>
      {children}
    </section>
  );
}

export const formGridClass = "grid grid-cols-1 gap-4 sm:grid-cols-2";
