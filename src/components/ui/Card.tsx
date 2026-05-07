import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PADDING = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8 md:p-10',
};

export function Card({ children, className = '', padding = 'md', ...rest }: CardProps) {
  return (
    <div
      className={[
        'bg-paper-card border border-paper-line rounded-2xl shadow-card',
        PADDING[padding],
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}
