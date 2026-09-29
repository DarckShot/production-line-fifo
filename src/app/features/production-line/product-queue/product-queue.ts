import { Component, input, output, viewChild } from '@angular/core';
import type { Product, ProductStatus } from '../models/product.model';
import { ProductTrack } from '../product-track/product-track';

@Component({
  selector: 'app-product-queue',
  imports: [ProductTrack],
  template: `
    <section class="line-panel" aria-labelledby="queue-heading">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">ЛЕНТА ПРОДУКТОВ <span aria-hidden="true">/</span> FIFO-01</p>
          <h2 id="queue-heading">Поток линии</h2>
        </div>
        <p class="queue-count"><span aria-hidden="true"></span> Продуктов: {{ products().length }}</p>
      </div>

      <div class="line-route" role="group" aria-label="Направление движения: от датчика входа к датчику отбраковки">
        <div class="sensor">
          <span class="sensor-light sensor-light--entry" aria-hidden="true"></span>
          <span><small>01 / ВХОД</small>Датчик входа</span>
        </div>
        <div class="direction" aria-hidden="true">
          <span class="direction-line"></span>
          <span class="direction-arrow">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M4 12h15m-6-6 6 6-6 6" />
            </svg>
          </span>
        </div>
        <div class="sensor sensor--exit">
          <span class="sensor-light sensor-light--exit" aria-hidden="true"></span>
          <span><small>02 / ВЫХОД</small>Датчик отбраковки</span>
        </div>
      </div>

      <app-product-track [products]="products()" (statusChanged)="statusChanged.emit($event)" (removed)="removed.emit($event)" />
    </section>
  `,
  styles: `
    :host { display: block; min-width: 0; }
    .line-panel { min-height: 100%; padding: clamp(1rem, 2vw, 1.5rem); overflow: hidden; border: 1px solid #174b42; border-radius: 18px; background: #103d35; color: #fff; box-shadow: 0 18px 36px #123e3226; }
    .panel-heading { display: flex; align-items: start; justify-content: space-between; flex-wrap: wrap; gap: .65rem; }
    .eyebrow { margin: 0 0 .55rem; color: #a9cfbf; font-family: ui-monospace, monospace; font-size: .68rem; font-weight: 800; letter-spacing: .1em; }
    .eyebrow span { color: #6b9b85; }
    h2 { margin: 0; font-size: clamp(1.55rem, 2.2vw, 2rem); font-weight: 800; letter-spacing: -.04em; }
    .queue-count { display: inline-flex; align-items: center; gap: .4rem; margin: 0; padding: .48rem .7rem; border: 1px solid #94b8a464; border-radius: 999px; background: #ffffff12; color: #ebf7eb; font-size: .72rem; font-weight: 750; white-space: nowrap; }
    .queue-count span { width: .4rem; height: .4rem; border-radius: 50%; background: var(--lime); }
    .line-route { display: grid; grid-template-columns: minmax(0, auto) minmax(1.5rem, 1fr) minmax(0, auto); align-items: center; gap: .7rem; margin: 2rem 0; padding: .7rem; border: 1px solid #86af9d40; border-radius: 10px; background: #ffffff0a; }
    .sensor { display: flex; align-items: center; gap: .6rem; max-width: 12rem; color: #eaf7ee; font-size: .75rem; font-weight: 700; line-height: 1.2; }
    .sensor > span:last-child { display: grid; gap: .2rem; }
    .sensor small { color: #a9cfbf; font-family: ui-monospace, monospace; font-size: .58rem; letter-spacing: .07em; }
    .sensor--exit { justify-content: flex-end; text-align: right; }
    .sensor-light { flex: none; width: .62rem; height: .62rem; border-radius: 50%; }
    .sensor-light--entry { background: #a8e4b2; box-shadow: 0 0 0 4px #a8e4b226; }
    .sensor-light--exit { background: #ffbb85; box-shadow: 0 0 0 4px #ffbb8526; }
    .direction { position: relative; display: grid; place-items: center; min-width: 2rem; min-height: 2rem; }
    .direction-line { position: absolute; inset-inline: 0; top: 50%; height: 2px; transform: translateY(-50%); border-radius: 999px; background: linear-gradient(90deg, #74a88e, #dded8b); }
    .direction-arrow { position: relative; display: grid; place-items: center; width: 2.25rem; height: 1.65rem; border: 1px solid #e5f3af; border-radius: 999px; background: var(--lime); color: #163c32; box-shadow: 0 0 0 4px #1a473e; }
    .direction-arrow svg { width: 1.15rem; height: 1.15rem; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
    @media (max-width: 620px) {
      .sensor { gap: .35rem; font-size: .68rem; }
      .line-route { gap: .4rem; padding: .55rem; }
      .direction-arrow { width: 1.9rem; height: 1.5rem; }
    }
    @media (max-width: 420px) {
      .line-route { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .sensor { grid-column: 1; grid-row: 1; }
      .sensor--exit { grid-column: 2; grid-row: 1; }
      .direction { grid-column: 1 / -1; grid-row: 2; margin: 0 1rem; }
    }
  `,
})
export class ProductQueue {
  readonly products = input.required<readonly Product[]>();
  readonly statusChanged = output<{ id: Product['id']; status: ProductStatus }>();
  readonly removed = output<Product['id']>();
  private readonly track = viewChild(ProductTrack);

  advanceForTick(departingId: Product['id']): void {
    this.track()?.advanceForTick(departingId);
  }
}
