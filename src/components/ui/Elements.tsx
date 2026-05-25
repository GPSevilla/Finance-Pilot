import { Info, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { formatCurrency, formatNumber, formatPercent } from "../../utils/formatting";

export function Panel({
  title,
  subtitle,
  right,
  children,
  className = ""
}: {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-panel ${className}`}>
      {(title || right) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title ? <h3 className="text-lg font-semibold text-ink">{title}</h3> : null}
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}

export function KpiCard({
  label,
  value,
  helper,
  accent = "bg-blue-100 text-blue-700"
}: {
  label: string;
  value: string;
  helper?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-panel">
      <div className="mb-4 flex items-center justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accent}`}>
          <Info className="h-5 w-5 opacity-0" />
        </div>
        <Info className="h-4 w-4 text-slate-300" />
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-ink">{value}</p>
      {helper ? <p className="mt-2 text-sm text-sea">{helper}</p> : null}
    </div>
  );
}

export function SectionTitle({ eyebrow, title, detail }: { eyebrow?: string; title: string; detail?: string }) {
  return (
    <div>
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{eyebrow}</p> : null}
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">{title}</h2>
      {detail ? <p className="mt-2 max-w-3xl text-sm text-slate-500">{detail}</p> : null}
    </div>
  );
}

export function LabeledInput({
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  readOnly = false,
  type = "text",
  step,
  min,
  max,
  placeholder,
  prefix,
  suffix,
  zeroAsEmpty = false
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  readOnly?: boolean;
  type?: string;
  step?: number | string;
  min?: number;
  max?: number;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  zeroAsEmpty?: boolean;
}) {
  const displayValue = typeof value === "number" && zeroAsEmpty && value === 0 ? "" : value;
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-600">{label}</span>
      <div className="flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition focus-within:border-slateblue focus-within:bg-white">
        {prefix ? <span className="pl-4 text-sm font-medium text-slate-400">{prefix}</span> : null}
        <input
          className={`min-w-0 w-full bg-transparent px-4 py-3 text-sm text-ink outline-none ${readOnly ? "cursor-default text-slate-500" : ""}`}
          type={type}
          value={displayValue}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          readOnly={readOnly}
          step={step}
          min={min}
          max={max}
          placeholder={placeholder}
        />
        {suffix ? <span className="pr-4 text-sm font-medium text-slate-400">{suffix}</span> : null}
      </div>
    </label>
  );
}

export function CurrencyInput({
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  readOnly = false,
  placeholder,
  min,
  max
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  readOnly?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
}) {
  return (
    <LabeledInput
      label={label}
      value={Math.trunc(Number.isFinite(value) ? value : 0)}
      onChange={(next) => onChange(Number(next || 0))}
      onFocus={onFocus}
      onBlur={onBlur}
      type="number"
      prefix="$"
      step={1}
      zeroAsEmpty
      placeholder={placeholder}
      min={min}
      max={max}
      readOnly={readOnly}
    />
  );
}

export function CurrencySliderInput({
  label,
  value,
  onChange,
  min = 0,
  max = 500000,
  step = 1000
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="space-y-3">
      <CurrencyInput label={label} value={value} onChange={onChange} min={min} />
      <div className="rounded-2xl bg-slate-50 px-4 py-3">
        <input
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#2751c3]"
          type="range"
          min={min}
          max={max}
          step={step}
          value={Math.max(min, Math.min(max, value))}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
          <span>{formatCurrency(min)}</span>
          <span>{formatCurrency(max)}+</span>
        </div>
      </div>
    </div>
  );
}

export function PercentInput({
  label,
  value,
  onChange,
  step = 0.1
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}) {
  const displayValue = Number.isFinite(value) ? Number((value * 100).toFixed(2)) : 0;
  return (
    <LabeledInput
      label={label}
      value={displayValue}
      onChange={(next) => onChange(Number(next || 0) / 100)}
      type="number"
      suffix="%"
      step={step}
      zeroAsEmpty
    />
  );
}

export function WholePercentInput({
  label,
  value,
  onChange,
  step = 1
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}) {
  const displayValue = Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
  return (
    <LabeledInput
      label={label}
      value={displayValue}
      onChange={(next) => onChange(Number(next || 0))}
      type="number"
      suffix="%"
      step={step}
      zeroAsEmpty
      min={0}
      max={100}
    />
  );
}

export function LabeledSelect({
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-600">{label}</span>
      <select
        className="min-w-0 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-slateblue focus:bg-white"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Pills({
  value,
  onChange,
  options
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            value === option.value
              ? "bg-blue-50 text-slateblue shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function ActionButton({
  children,
  onClick,
  variant = "primary",
  icon
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: "plus" | "trash";
}) {
  const iconNode = icon === "plus" ? <Plus className="h-4 w-4" /> : icon === "trash" ? <Trash2 className="h-4 w-4" /> : null;
  const classes = {
    primary: "bg-slateblue text-white hover:bg-blue-700",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100",
    danger: "bg-rose-50 text-rosewood hover:bg-rose-100"
  }[variant];

  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-center transition ${classes}`}>
      {iconNode}
      {children}
    </button>
  );
}

export function StatList({
  items
}: {
  items: Array<{ label: string; value: number | string; format?: "currency" | "percent" | "number" | "plain"; digits?: number }>;
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
          <span className="text-sm text-slate-500">{toTitleCase(item.label)}</span>
          <span className="text-sm font-semibold text-ink">
            {typeof item.value === "number"
              ? item.format === "percent"
                ? formatPercent(item.value)
                : item.format === "number"
                  ? formatNumber(item.value, item.digits ?? 1)
                  : item.format === "plain"
                    ? String(item.value)
                    : formatCurrency(item.value)
              : item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function toTitleCase(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}
