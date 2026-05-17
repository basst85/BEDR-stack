import { useMountEffect } from '@/hooks/useMountEffect';

type PageTitleProps = {
  title: string;
};

export function PageTitle({ title }: PageTitleProps) {
  useMountEffect(() => {
    if (typeof document !== 'undefined' && document.title !== title) {
      document.title = title;
    }
  });

  return null;
}
