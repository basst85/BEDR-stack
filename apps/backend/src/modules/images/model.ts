import { t } from 'elysia';

export const imageFormatValues = ['jpeg', 'png', 'webp'] as const;

export const imageOptimizationQuery = t.Object({
  src: t.String({ format: 'uri' }),
  width: t.Optional(t.Numeric({ minimum: 1, maximum: 3840 })),
  height: t.Optional(t.Numeric({ minimum: 1, maximum: 3840 })),
  quality: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  format: t.Optional(t.Union(imageFormatValues.map((value) => t.Literal(value)))),
});

export const imageErrorDto = t.Object({
  message: t.String(),
});

export type ImageOptimizationQuery = typeof imageOptimizationQuery.static;
export type ImageFormatValue = (typeof imageFormatValues)[number];