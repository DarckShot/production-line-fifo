import type { Product } from './product.model';

export type LineEventType = 'added' | 'status-changed' | 'removed-manually' | 'removed-on-tick';

export interface LineEvent {
  readonly id: string;
  readonly type: LineEventType;
  readonly occurredAt: Date;
  readonly productId: Product['id'];
  readonly description: string;
}
