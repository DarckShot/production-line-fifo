import type { ProductStatus } from './product.model';

export type LineEventType = 'added' | 'status-changed' | 'removed';

export interface LineEvent {
  readonly id: string;
  readonly productId: string;
  readonly occurredAt: Date;
  readonly type: LineEventType;
  readonly status?: ProductStatus;
}
