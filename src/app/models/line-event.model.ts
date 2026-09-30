import type { Product } from './product.model';

export const LINE_EVENT_TYPES = [
  'added',
  'status-changed',
  'removed-manually',
  'removed-on-tick',
] as const;

export type LineEventType = (typeof LINE_EVENT_TYPES)[number];

export interface LineEvent {
  readonly id: string;
  readonly type: LineEventType;
  readonly occurredAt: Date;
  readonly productId?: Product['id'];
  readonly description: string;
}
