import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'border-input file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-base file:font-medium focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm sm:file:text-sm',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
