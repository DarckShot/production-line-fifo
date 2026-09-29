export type ProductStatus = 'В очереди' | 'Проверен' | 'Отбракован';

export interface Product {
  readonly id: string;
  readonly arrivedAt: Date;
  readonly status: ProductStatus;
}
