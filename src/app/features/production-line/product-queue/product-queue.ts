import { Component, input } from '@angular/core';
import type { Product } from '../models/product.model';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'app-product-queue',
  imports: [ProductCard],
  template: `
    <section aria-labelledby="queue-heading">
      <h2 id="queue-heading">FIFO-очередь</h2>
      <p>Датчик входа → Датчик отбраковки</p>
      <ol>
        @for (product of products(); track product.id) {
          <li><app-product-card [product]="product" /></li>
        } @empty {
          <li>Очередь пуста</li>
        }
      </ol>
    </section>
  `,
})
export class ProductQueue {
  readonly products = input.required<readonly Product[]>();
}
