export const PRODUCT_STATUSES = ['В очереди', 'Проверен', 'Отбракован'] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export interface Product {
  readonly id: string;
  readonly arrivedAt: Date;
  readonly status: ProductStatus;
}
