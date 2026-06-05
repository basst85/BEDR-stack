import { BedSingle, Check, CookingPot, ShieldCheck, ShowerHead } from 'lucide-react';

import { cn } from '@/lib/utils';

type UnitLayoutListProps = {
  title?: string;
  sleepingLayout: string;
  features: string[];
  compact?: boolean;
  className?: string;
};

function getLayoutIcon(text: string) {
  const normalizedText = text.toLowerCase();

  if (
    normalizedText.includes('slaap') ||
    normalizedText.includes('bed') ||
    normalizedText.includes('bedroom')
  ) {
    return BedSingle;
  }

  if (
    normalizedText.includes('douche') ||
    normalizedText.includes('toilet') ||
    normalizedText.includes('washbasin') ||
    normalizedText.includes('sanitary')
  ) {
    return ShowerHead;
  }

  if (normalizedText.includes('keuken') || normalizedText.includes('kitchen')) {
    return CookingPot;
  }

  if (normalizedText.includes('isol')) {
    return ShieldCheck;
  }

  return Check;
}

export function UnitLayoutList({ title, sleepingLayout, features, compact = false, className }: UnitLayoutListProps) {
  const items = [sleepingLayout, ...features];

  return (
    <div className={cn('space-y-2', className)}>
      {title ? (
        <p className={cn('uppercase text-[#D6CAA0]', compact ? 'text-[0.65rem] font-semibold tracking-[0.18em]' : 'text-xs tracking-[0.2em]')}>
          {title}
        </p>
      ) : null}

      <ul className={cn('space-y-2', compact ? 'text-xs leading-5 text-stone-300' : 'text-sm leading-6 text-stone-200')}>
        {items.map((item) => {
          const Icon = getLayoutIcon(item);

          return (
            <li key={item} className="flex items-start gap-2.5">
              <Icon className={cn('mt-0.5 shrink-0 text-[#76BD23]', compact ? 'size-3.5' : 'size-4')} />
              <span>{item}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}