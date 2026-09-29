import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { PRODUCT_STATUSES, type Product, type ProductStatus } from '../models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [DatePipe],
  template: `
    <article class="product-card">
      <p class="card-label">Продукт</p>
      <h3>{{ product().id }}</h3>
      <dl>
        <div>
          <dt>Время поступления</dt>
          <dd><time [attr.datetime]="product().arrivedAt.toISOString()">{{ product().arrivedAt | date: 'dd.MM.yyyy HH:mm' }}</time></dd>
        </div>
        <div>
          <dt>Статус</dt>
          <dd>
            <span class="status" [class.status--checked]="product().status === 'Проверен'" [class.status--rejected]="product().status === 'Отбракован'">
              {{ product().status }}
            </span>
          </dd>
        </div>
      </dl>
      <label class="status-label">
        Изменить статус
        <select [value]="product().status" (change)="onStatusChange($event)">
          @for (status of statuses; track status) {
            <option [value]="status">{{ status }}</option>
          }
        </select>
      </label>
    </article>
  `,
  styles: `
    :host { display: block; height: 100%; }
    .product-card { box-sizing: border-box; height: 100%; padding: 1rem; border: 1px solid #cbd5e1; border-top: 4px solid #0f766e; border-radius: 10px; background: #fff; box-shadow: 0 3px 10px #0f172a14; }
    .card-label { margin: 0; color: #475569; font-size: .75rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
    h3 { margin: .25rem 0 1rem; overflow-wrap: anywhere; color: #0f172a; font-size: 1.2rem; }
    dl { display: grid; gap: .75rem; margin: 0; }
    dt { color: #475569; font-size: .75rem; }
    dd { margin: .2rem 0 0; color: #0f172a; font-size: .9rem; font-weight: 650; }
    .status { display: inline-block; padding: .25rem .5rem; border-radius: 6px; background: #dbeafe; color: #1e3a8a; font-size: .8rem; }
    .status--checked { background: #dcfce7; color: #166534; }
    .status--rejected { background: #fee2e2; color: #991b1b; }
    .status-label { display: grid; gap: .35rem; margin-top: 1rem; color: #334155; font-size: .8rem; font-weight: 700; }
    select { box-sizing: border-box; width: 100%; min-height: 44px; padding: .45rem .6rem; border: 1px solid #64748b; border-radius: 8px; background: #fff; color: #0f172a; font: inherit; font-size: .9rem; cursor: pointer; }
    select:focus-visible { outline: 3px solid #0f766e; outline-offset: 2px; }
  `,
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly statusChanged = output<ProductStatus>();
  protected readonly statuses = PRODUCT_STATUSES;

  protected onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const status = PRODUCT_STATUSES.find((candidate) => candidate === value);
    if (status && status !== this.product().status) {
      this.statusChanged.emit(status);
    }
  }
}
