import { Component, inject, viewChild } from '@angular/core';
import { EventLog } from '../event-log/event-log';
import { LineControls } from '../line-controls/line-controls';
import { ProductForm } from '../product-form/product-form';
import { ProductQueue } from '../product-queue/product-queue';
import { ProductionLineStore } from '../production-line-store';

@Component({
  selector: 'app-production-line',
  imports: [EventLog, LineControls, ProductForm, ProductQueue],
  providers: [ProductionLineStore],
  template: `
    <main class="page">
      <header class="page-header">
        <div class="header-top">
          <p class="eyebrow"><span class="live-dot" aria-hidden="true"></span>Мониторинг производства</p>
          <p class="header-tag">Линия · FIFO</p>
        </div>
        <h1>Производственная линия</h1>
        <p>Движение продуктов от входа к выходу по принципу FIFO</p>
      </header>
      <div class="dashboard">
        <div class="tools">
          <app-product-form />
          <app-line-controls [productCount]="store.products().length" (tickRequested)="onNextTick()" />
        </div>
        <app-product-queue [products]="store.products()" (statusChanged)="store.changeProductStatus($event.id, $event.status)" (removed)="store.removeProduct($event)" />
        <app-event-log [events]="store.events()" />
      </div>
    </main>
  `,
  styles: `
    :host { display: block; min-height: 100vh; background: #e9eef0; }
    .page { width: min(100%, 1500px); margin: 0 auto; padding: clamp(1rem, 2.5vw, 2.5rem); }
    .page-header { position: relative; overflow: hidden; padding: clamp(1.4rem, 3vw, 2.5rem); border-radius: 20px; background: #132e3b; color: #fff; box-shadow: 0 16px 34px #13313b26; }
    .page-header::after { position: absolute; top: -5rem; right: -4rem; width: 26rem; height: 22rem; border: 1px solid #ffffff24; border-radius: 50%; box-shadow: 0 0 0 3rem #ffffff09, 0 0 0 6rem #ffffff07; content: ''; pointer-events: none; }
    .header-top { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
    .eyebrow { display: flex; align-items: center; gap: .55rem; margin: 0; color: #b8dfd9; font-size: .72rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
    .live-dot { width: .55rem; height: .55rem; border-radius: 50%; background: #61d7aa; box-shadow: 0 0 0 4px #61d7aa2b; }
    .header-tag { margin: 0; padding: .38rem .65rem; border: 1px solid #ffffff40; border-radius: 4px; color: #dceae9; font-family: ui-monospace, monospace; font-size: .73rem; white-space: nowrap; }
    h1 { position: relative; z-index: 1; max-width: 18ch; margin: 1.2rem 0 .55rem; font-size: clamp(2rem, 4vw, 3.35rem); font-weight: 800; letter-spacing: -.045em; line-height: 1.05; }
    .page-header > p { position: relative; z-index: 1; margin: 0; color: #c9d9dc; line-height: 1.5; }
    .dashboard { display: grid; grid-template-columns: minmax(0, 1.8fr) minmax(19rem, .9fr); grid-template-rows: auto minmax(0, 1fr); gap: 1rem; align-items: start; margin-top: 1rem; }
    .tools { display: grid; grid-column: 2; grid-row: 1; gap: 1rem; min-width: 0; }
    app-product-queue { grid-column: 1; grid-row: 1 / 3; }
    app-event-log { grid-column: 2; grid-row: 2; min-width: 0; }
    @media (max-width: 900px) {
      .dashboard { display: flex; flex-direction: column; }
      .dashboard > * { width: 100%; }
      .tools { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 620px) {
      .tools { grid-template-columns: 1fr; }
      .page-header { border-radius: 14px; }
      .header-tag { display: none; }
    }
  `,
})
export class ProductionLine {
  protected readonly store = inject(ProductionLineStore);
  private readonly queue = viewChild(ProductQueue);

  protected onNextTick(): void {
    if (!this.store.products().length) {
      return;
    }
    this.queue()?.animateNextTick();
    this.store.nextTick();
  }
}
