import { Component, ElementRef, computed, inject, input, output } from '@angular/core';
import type { Product, ProductStatus } from '../models/product.model';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'app-product-queue',
  imports: [ProductCard],
  template: `
    <section class="line-panel" aria-labelledby="queue-heading">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">03 / Производственный участок</p>
          <h2 id="queue-heading">FIFO-очередь</h2>
        </div>
        <p class="queue-count">Продуктов: {{ products().length }}</p>
      </div>

      <p class="line-caption">Поток продуктов <span aria-hidden="true">/</span> от входа к выходу</p>
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
          <ol class="products" aria-label="Продукты от входа к выходу" animate.leave="products-leaving">
            @for (product of productsFromEntryToExit(); track product.id) {
              <li animate.leave="product-leaving"><app-product-card [product]="product" (statusChanged)="statusChanged.emit({ id: product.id, status: $event })" (removed)="removed.emit(product.id)" /></li>
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
    .line-panel { min-height: 100%; padding: clamp(1rem, 2.5vw, 1.7rem); border: 1px solid #d3dcdf; border-radius: 16px; background: #fff; box-shadow: 0 4px 18px #1b3b4510; }
    .panel-heading { display: flex; align-items: start; justify-content: space-between; flex-wrap: wrap; gap: .75rem; }
    .eyebrow { margin: 0 0 .65rem; color: #246c69; font-family: ui-monospace, monospace; font-size: .72rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
    h2 { margin: 0; color: #162e39; font-size: clamp(1.45rem, 2.5vw, 1.85rem); letter-spacing: -.035em; }
    .queue-count { margin: 0; padding: .45rem .7rem; border: 1px solid #d0dddc; border-radius: 7px; background: #ecf4f3; color: #185c57; font-family: ui-monospace, monospace; font-size: .78rem; font-weight: 800; }
    .line-caption { margin: clamp(2rem, 5vw, 4.5rem) 0 .65rem; color: #52656d; font-size: .75rem; font-weight: 750; letter-spacing: .08em; text-transform: uppercase; }
    .line-caption span { margin: 0 .25rem; color: #b07525; }
    .line-route { display: grid; grid-template-columns: minmax(7rem, auto) minmax(2rem, 1fr) minmax(9rem, auto); align-items: center; gap: .75rem; margin: 0 0 1rem; }
    .sensor { display: flex; align-items: center; gap: .55rem; color: #223b45; font-size: .82rem; font-weight: 800; line-height: 1.3; }
    .sensor--exit { justify-content: flex-end; text-align: right; }
    .sensor-light { flex: none; width: .7rem; height: .7rem; border-radius: 50%; }
    .sensor-light--entry { background: #178a70; box-shadow: 0 0 0 4px #178a702e; }
    .sensor-light--exit { background: #bd7622; box-shadow: 0 0 0 4px #bd76222e; }
    .direction { display: flex; align-items: center; color: #176e68; }
    .direction-line { flex: 1; border-top: 2px dashed #7ca5a2; }
    .direction-arrow { margin-left: .25rem; font-size: 1.5rem; line-height: 1; }
    .track { min-height: 22rem; padding: 1rem; border: 1px solid #c7d4d7; border-radius: 12px; background: linear-gradient(90deg, #176e6817 0 3px, transparent 3px calc(100% - 3px), #bd762228 calc(100% - 3px)), repeating-linear-gradient(0deg, #f4f7f7 0 23px, #edf2f2 23px 24px); }
    .products { display: flex; justify-content: flex-start; gap: .8rem; min-height: 19.8rem; margin: 0; padding: .15rem .15rem .55rem; overflow-x: auto; list-style: none; scrollbar-color: #93aaa9 transparent; }
    .products li { flex: 0 0 min(13.5rem, 72vw); }
    .product-leaving { animation: product-exit 320ms ease-in forwards; pointer-events: none; }
    .products-leaving { animation: queue-exit 320ms ease-in forwards; pointer-events: none; }
    @keyframes product-exit { to { opacity: 0; transform: translateX(2rem); } }
    @keyframes queue-exit { to { opacity: 0; transform: translateX(2rem); } }
    @media (prefers-reduced-motion: reduce) {
      .product-leaving, .products-leaving { animation-duration: 1ms; }
    }
    .empty-state { display: grid; place-items: center; min-height: 19.8rem; margin: 0; padding: 1rem; border: 1px dashed #9bb0b3; border-radius: 8px; background: #ffffffb5; color: #485e67; text-align: center; font-weight: 650; }
    @media (max-width: 600px) {
      .line-route { grid-template-columns: 1fr auto 1fr; gap: .45rem; }
      .sensor { align-items: flex-start; flex-direction: column; font-size: .72rem; }
      .sensor--exit { align-items: flex-end; }
      .direction { align-self: start; margin-top: .2rem; }
      .line-caption { margin-top: 2rem; }
      .track { min-height: 19rem; padding: .7rem; }
      .products, .empty-state { min-height: 17rem; }
    }
  `,
})
export class ProductQueue {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly products = input.required<readonly Product[]>();
  readonly statusChanged = output<{ id: Product['id']; status: ProductStatus }>();
  readonly removed = output<Product['id']>();
  protected readonly productsFromEntryToExit = computed(() => [...this.products()].reverse());

  animateNextTick(): void {
    if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const cards = this.element.nativeElement.querySelectorAll<HTMLElement>('.products > li:not(.product-leaving)');
    for (const card of [...cards].slice(0, -1)) {
      card.animate?.(
        [
          { transform: 'translateX(0)' },
          { transform: 'translateX(1.5rem)', offset: 0.7 },
          { transform: 'translateX(0)' },
        ],
        { duration: 380, easing: 'ease-in-out' },
      );
    }
  }
}
