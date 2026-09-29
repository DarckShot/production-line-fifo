import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { PRODUCT_STATUSES, type Product, type ProductStatus } from '../models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [DatePipe],
  template: `
    <article class="product-card" [class.card--checked]="product().status === 'Проверен'" [class.card--rejected]="product().status === 'Отбракован'">
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
      <button type="button" class="remove-button" [attr.aria-label]="'Удалить продукт ' + product().id" (click)="removed.emit()">
        Удалить
      </button>
    </article>
  `,
  styles: `
    :host { display: block; height: 100%; }
    .product-card { height: 100%; padding: 1rem; border: 1px solid #a9cac8; border-top: 5px solid #176e68; border-radius: 9px; background: #fff; box-shadow: 0 7px 16px #1b3b4514; }
    .product-card.card--checked { border-color: #9cc5ad; border-top-color: #287d4a; }
    .product-card.card--rejected { border-color: #d8aaa4; border-top-color: #ae483e; }
    .card-label { margin: 0; color: #52656d; font-family: ui-monospace, monospace; font-size: .68rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
    h3 { margin: .25rem 0 1rem; overflow-wrap: anywhere; color: #162e39; font-size: 1.25rem; letter-spacing: -.025em; }
    dl { display: grid; gap: .75rem; margin: 0; }
    dt { color: #52656d; font-size: .72rem; }
    dd { margin: .2rem 0 0; color: #223b45; font-size: .84rem; font-weight: 700; }
    time { font-variant-numeric: tabular-nums; }
    .status { display: inline-flex; align-items: center; gap: .35rem; padding: .28rem .5rem; border-radius: 5px; background: #dfefed; color: #145d58; font-size: .75rem; font-weight: 800; }
    .status::before { width: .4rem; height: .4rem; border-radius: 50%; background: currentColor; content: ''; }
    .status--checked { background: #e3f3e8; color: #1f6c3b; }
    .status--rejected { background: #fae8e5; color: #982f2b; }
    .status-label { display: grid; gap: .35rem; margin-top: 1rem; color: #334c55; font-size: .75rem; font-weight: 750; }
    select { width: 100%; min-height: 44px; padding: .45rem .6rem; border: 1px solid #91a8af; border-radius: 7px; background: #fff; color: #172b39; font-size: .82rem; cursor: pointer; }
    select:focus-visible { outline: 3px solid #176e68; outline-offset: 2px; }
    .remove-button { width: 100%; min-height: 44px; margin-top: .7rem; padding: .5rem .75rem; border: 1px solid #c99d98; border-radius: 7px; background: #fff; color: #9b3932; font-size: .8rem; font-weight: 800; cursor: pointer; }
    .remove-button:hover { background: #fae8e5; }
    .remove-button:focus-visible { outline: 3px solid #176e68; outline-offset: 2px; }
  `,
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly statusChanged = output<ProductStatus>();
  readonly removed = output<void>();
  protected readonly statuses = PRODUCT_STATUSES;

  protected onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const status = PRODUCT_STATUSES.find((candidate) => candidate === value);
    if (status && status !== this.product().status) {
      this.statusChanged.emit(status);
    }
  }
}
