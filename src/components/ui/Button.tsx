import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-brand text-ink hover:bg-brand-dark active:bg-brand-dark disabled:bg-brand/50',
  secondary:
    'bg-paper-card text-ink border border-paper-line hover:bg-paper hover:border-ink/20',
  ghost: 'bg-transparent text-ink hover:bg-paper-line/60',
  danger: 'bg-danger text-white hover:bg-red-700',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm rounded-lg',
  md: 'h-11 px-5 text-[15px] rounded-xl',
  lg: 'h-14 px-7 text-base rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', loading, fullWidth, leftIcon, className = '', children, disabled, ...rest },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          'inline-flex items-center justify-center gap-2 font-medium tracking-tight',
          'transition-colors disabled:cursor-not-allowed select-none',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2',
          VARIANTS[variant],
          SIZES[size],
          fullWidth ? 'w-full' : '',
          className,
        ].join(' ')}
        {...rest}
      >
        {loading ? (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
            aria-hidden
          />
        ) : (
          leftIcon
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
