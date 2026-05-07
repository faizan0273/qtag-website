import { forwardRef, type InputHTMLAttributes, type LabelHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';

/* -------------------------------- Label ---------------------------------- */

export function Label({ className = '', ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`block text-sm font-medium text-ink-soft mb-1.5 ${className}`}
      {...props}
    />
  );
}

/* -------------------------------- Input ---------------------------------- */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

const inputBaseStyles = (invalid?: boolean) =>
  [
    'w-full h-12 px-4 rounded-xl bg-paper-card border text-ink',
    'placeholder:text-ink-muted/70',
    'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand',
    'disabled:bg-paper-line/40 disabled:cursor-not-allowed',
    'transition-colors',
    invalid ? 'border-danger' : 'border-paper-line',
  ].join(' ');

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', invalid, ...rest }, ref) => (
    <input ref={ref} className={`${inputBaseStyles(invalid)} ${className}`} {...rest} />
  ),
);
Input.displayName = 'Input';

/* ------------------------------- Textarea -------------------------------- */

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', invalid, rows = 4, ...rest }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={`${inputBaseStyles(invalid)} h-auto py-3 leading-6 ${className}`}
      {...rest}
    />
  ),
);
Textarea.displayName = 'Textarea';

/* -------------------------------- Select --------------------------------- */

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', invalid, children, ...rest }, ref) => (
    <select
      ref={ref}
      className={`${inputBaseStyles(invalid)} pr-10 appearance-none bg-[length:14px] bg-no-repeat ${className}`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%235B6473' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
        backgroundPosition: 'right 14px center',
      }}
      {...rest}
    >
      {children}
    </select>
  ),
);
Select.displayName = 'Select';

/* -------------------------------- Field ---------------------------------- */

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
}

export function Field({ label, htmlFor, hint, error, children }: FieldProps) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="mt-1.5 text-sm text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-sm text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}
