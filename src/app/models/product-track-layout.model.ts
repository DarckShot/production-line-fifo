import type { Product } from './product.model';

export interface ProductTrackLayout {
  readonly slots: ReadonlyMap<Product['id'], number>;
  readonly slotCount: number;
  readonly settling: boolean;
  readonly pendingDepartureId?: Product['id'];
}
