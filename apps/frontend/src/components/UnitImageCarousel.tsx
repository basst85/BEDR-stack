import { useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Image } from '@/components/Image';
import { useMountEffect } from '@/hooks/useMountEffect';

type UnitImage = {
  src: string;
  alt: string;
};

type UnitImageCarouselProps = {
  images: UnitImage[];
  title: string;
};

function EmblaStateSync({
  emblaApi,
  onSelect,
}: {
  emblaApi: NonNullable<ReturnType<typeof useEmblaCarousel>[1]>;
  onSelect: (index: number) => void;
}) {
  useMountEffect(() => {
    const updateSelectedIndex = () => {
      onSelect(emblaApi.selectedScrollSnap());
    };

    updateSelectedIndex();
    emblaApi.on('select', updateSelectedIndex);
    emblaApi.on('reInit', updateSelectedIndex);

    return () => {
      emblaApi.off('select', updateSelectedIndex);
      emblaApi.off('reInit', updateSelectedIndex);
    };
  });

  return null;
}

export function UnitImageCarousel({ images, title }: UnitImageCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1, align: 'start' });
  const hasMultipleImages = images.length > 1;

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-black/20">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {images.map((image) => (
              <div key={`${title}-${image.src}-${image.alt}`} className="min-w-0 shrink-0 grow-0 basis-full">
                <div className="relative aspect-[16/10]">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {hasMultipleImages ? (
          <>
            <button
              type="button"
              aria-label={`Previous photo for ${title}`}
              onClick={() => emblaApi?.scrollPrev()}
              className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/12 bg-black/45 text-white transition hover:bg-black/65"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label={`Next photo for ${title}`}
              onClick={() => emblaApi?.scrollNext()}
              className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/12 bg-black/45 text-white transition hover:bg-black/65"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />
      </div>

      {hasMultipleImages ? (
        <div className="flex items-center justify-center gap-2">
          {images.map((image, index) => {
            const isActive = index === selectedIndex;

            return (
              <button
                key={`${title}-dot-${image.src}-${index}`}
                type="button"
                aria-label={`Go to photo ${index + 1} for ${title}`}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`h-2.5 rounded-full transition ${isActive ? 'w-7 bg-[#D6CAA0]' : 'w-2.5 bg-white/30 hover:bg-white/45'}`}
              />
            );
          })}
        </div>
      ) : null}

      {emblaApi ? <EmblaStateSync emblaApi={emblaApi} onSelect={setSelectedIndex} /> : null}
    </div>
  );
}