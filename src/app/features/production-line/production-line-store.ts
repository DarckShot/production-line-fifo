import { Service, signal } from '@angular/core';
import type { LineEvent } from './models/line-event.model';
import type { Product } from './models/product.model';

@Service()
export class ProductionLineStore {
  private readonly productsState = signal<readonly Product[]>([]);
  private readonly eventsState = signal<readonly LineEvent[]>([]);

  readonly products = this.productsState.asReadonly();
  readonly events = this.eventsState.asReadonly();
}
