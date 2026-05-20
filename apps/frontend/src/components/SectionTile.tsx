import type { ReactNode } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type SectionTileProps = {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
};

export function SectionTile({
  eyebrow,
  title,
  description,
  icon,
  actions,
  children,
  className,
  contentClassName,
  headerClassName,
}: SectionTileProps) {
  return (
    <Card className={cn('border-border/60 bg-card/90 shadow-xl shadow-black/20', className)}>
      <CardHeader
        className={cn(
          'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
          !actions && 'sm:block sm:space-y-3',
          headerClassName,
        )}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {icon ? <div className="shrink-0">{icon}</div> : null}
            <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">{eyebrow}</p>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-semibold tracking-tight">{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}
