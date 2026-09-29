import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import type { Product } from '../models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [DatePipe],
  template: `
    <article>
      <h3>Продукт {{ product().id }}</h3>
      <p>Поступил: {{ product().arrivedAt | date: 'short' }}</p>
      <p>Статус: {{ product().status }}</p>
    </article>
  `,
})
export class ProductCard {
  readonly product = input.required<Product>();
}
