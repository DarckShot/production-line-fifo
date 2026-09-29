import { Component, computed, input } from '@angular/core';
import type { Product } from '../models/product.model';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'app-product-queue',
  imports: [ProductCard],
  template: `
    <section class="line-panel" aria-labelledby="queue-heading">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Производственный участок</p>
          <h2 id="queue-heading">FIFO-очередь</h2>
        </div>
        <p class="queue-count">Продуктов: {{ products().length }}</p>
      </div>

      <div class="line-route" aria-label="Направление движения: от датчика входа к датчику отбраковки">
        <div class="sensor">
          <span class="sensor-light sensor-light--entry" aria-hidden="true"></span>
          <span>Датчик входа</span>
        </div>
        <div class="direction" aria-hidden="true">
          <span class="direction-line"></span>
          <span class="direction-arrow">→</span>
        </div>
        <div class="sensor sensor--exit">
          <span class="sensor-light sensor-light--exit" aria-hidden="true"></span>
          <span>Датчик отбраковки / выход</span>
        </div>
      </div>

      <div class="track">
        @if (products().length) {
          <ol class="products" aria-label="Продукты от входа к выходу">
            @for (product of productsFromEntryToExit(); track product.id) {
              <li><app-product-card [product]="product" /></li>
            }
          </ol>
        } @else {
          <p class="empty-state" role="status">Очередь пуста. Добавьте продукт, чтобы запустить линию.</p>
        }
      </div>
    </section>
  `,
  styles: `
    :host { display: block; min-width: 0; }
    .line-panel { border: 1px solid #cbd5e1; border-radius: 20px; background: #fff; padding: clamp(1rem, 3vw, 2rem); box-shadow: 0 12px 32px #0f172a0d; }
    .panel-heading { display: flex; align-items: start; justify-content: space-between; flex-wrap: wrap; gap: .75rem; }
    .eyebrow { margin: 0 0 .3rem; color: #475569; font-size: .78rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
    h2 { margin: 0; color: #0f172a; font-size: clamp(1.35rem, 2.4vw, 1.8rem); }
    .queue-count { margin: 0; padding: .4rem .75rem; border-radius: 999px; background: #e2e8f0; color: #243247; font-size: .875rem; font-weight: 700; }
    .line-route { display: grid; grid-template-columns: minmax(7rem, auto) minmax(2rem, 1fr) minmax(9rem, auto); align-items: center; gap: .75rem; margin: 1.7rem 0 1rem; }
    .sensor { display: flex; align-items: center; gap: .55rem; color: #1e293b; font-size: .85rem; font-weight: 700; }
    .sensor--exit { justify-content: flex-end; text-align: right; }
    .sensor-light { flex: none; width: .65rem; height: .65rem; border-radius: 50%; box-shadow: 0 0 0 4px #e2e8f0; }
    .sensor-light--entry { background: #047857; }
    .sensor-light--exit { background: #b45309; }
    .direction { display: flex; align-items: center; color: #0f766e; }
    .direction-line { flex: 1; border-top: 2px dashed #0f766e; }
    .direction-arrow { font-size: 1.5rem; line-height: 1; }
    .track { min-height: 9rem; padding: 1rem; border: 1px dashed #94a3b8; border-radius: 14px; background: repeating-linear-gradient(135deg, #f8fafc 0, #f8fafc 14px, #f1f5f9 14px, #f1f5f9 28px); }
    .products { display: flex; gap: .75rem; min-height: 7rem; margin: 0; padding: 0; overflow-x: auto; list-style: none; }
    .products li { flex: 0 0 min(14rem, 75vw); }
    .empty-state { display: grid; place-items: center; min-height: 7rem; margin: 0; border-radius: 10px; background: #fff; color: #334155; text-align: center; font-weight: 600; }
    @media (max-width: 600px) {
      .line-route { grid-template-columns: 1fr auto 1fr; gap: .45rem; }
      .sensor { align-items: flex-start; flex-direction: column; font-size: .72rem; }
      .sensor--exit { align-items: flex-end; }
      .direction { align-self: start; margin-top: .2rem; }
    }
  `,
})
export class ProductQueue {
  readonly products = input.required<readonly Product[]>();
  protected readonly productsFromEntryToExit = computed(() => [...this.products()].reverse());
}
