import type { LineEvent } from './line-event.model';
import type { Product } from './product.model';

export interface ProductionLineSnapshot {
  readonly products: readonly Product[];
  readonly events: readonly LineEvent[];
  readonly nextEventId: number;
}
