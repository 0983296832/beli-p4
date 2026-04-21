import * as React from 'react';

import { cn } from '@lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[60px] w-full rounded-lg border border-primary-neutral-300 bg-white px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-1 focus-visible:border-primary-blue-500 disabled:cursor-not-allowed disabled:bg-primary-neutral-100 disabled:text-primary-neutral-500 md:text-sm',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
