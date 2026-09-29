import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, viewChild } from '@angular/core';
import { EventLog } from '../event-log/event-log';
import { LineControls } from '../line-controls/line-controls';
import { ProductForm } from '../product-form/product-form';
import { ProductQueue } from '../product-queue/product-queue';
import { ProductionLineStore } from '../production-line-store';

@Component({
  selector: 'app-production-line',
  imports: [EventLog, LineControls, NgOptimizedImage, ProductForm, ProductQueue],
  providers: [ProductionLineStore],
  template: `
    <main class="page">
      <header class="page-header">
        <div class="topbar">
          <div class="brand">
            <img class="brand-mark" ngSrc="/favicon.svg" width="38" height="38" alt="" [priority]="true" />
            <span class="brand-name">FLOWLINE <small>ПРОИЗВОДСТВО</small></span>
          </div>
          <span class="live-status"><span aria-hidden="true"></span> Линия активна</span>
        </div>
        <div class="hero">
          <div class="hero-copy">
            <p class="eyebrow">ПАНЕЛЬ УПРАВЛЕНИЯ <span aria-hidden="true">/</span> FIFO-01</p>
            <h1>Производственная линия</h1>
            <p>Контролируйте путь каждого продукта — от датчика входа до выхода линии.</p>
          </div>
          <div class="hero-stat">
            <span>СЕЙЧАС В ОЧЕРЕДИ</span>
            <strong>{{ store.products().length }}</strong>
            <small>{{ productNoun() }} на линии</small>
          </div>
        </div>
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
    :host { display: block; min-height: 100vh; background: radial-gradient(circle at 100% 0, #e4ece4 0, transparent 35%), #f3f5f1; }
    .page { width: min(100%, 1600px); margin: 0 auto; padding: clamp(1rem, 1.4vw, 1.5rem); }
    .page-header { overflow: hidden; border: 1px solid #dbe5dc; border-radius: 20px; background: #fff; box-shadow: var(--shadow); }
    .topbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; min-height: 3.7rem; padding: .65rem clamp(1.2rem, 2.5vw, 2.25rem); border-bottom: 1px solid #e9eee8; }
    .brand { display: flex; align-items: center; gap: .75rem; }
    .brand-mark { display: block; flex: none; width: 2.35rem; height: 2.35rem; }
    .brand-name { display: grid; gap: .05rem; color: var(--ink); font-size: .86rem; font-weight: 900; letter-spacing: .12em; line-height: 1.1; }
    .brand-name small { color: var(--muted); font-size: .56rem; font-weight: 700; letter-spacing: .16em; }
    .live-status { display: inline-flex; align-items: center; gap: .5rem; padding: .5rem .75rem; border: 1px solid #cce3d6; border-radius: 999px; background: #edf8ef; color: #236245; font-size: .76rem; font-weight: 750; white-space: nowrap; }
    .live-status span { width: .45rem; height: .45rem; border-radius: 50%; background: #258e59; box-shadow: 0 0 0 3px #258e5924; }
    .hero { display: flex; align-items: end; justify-content: space-between; gap: 2rem; padding: clamp(1.2rem, 2vw, 1.55rem) clamp(1.2rem, 2.5vw, 2.25rem); background: linear-gradient(120deg, #fff 0%, #fff 60%, #f2f8ed 100%); }
    .eyebrow { margin: 0 0 .65rem; color: #2c705d; font-family: ui-monospace, monospace; font-size: .7rem; font-weight: 800; letter-spacing: .11em; }
    .eyebrow span { margin: 0 .3rem; color: #a9bcae; }
    h1 { max-width: 20ch; margin: 0; color: #17342d; font-size: clamp(2rem, 3.7vw, 3.25rem); font-weight: 800; letter-spacing: -.055em; line-height: 1.06; }
    .hero-copy > p:last-child { max-width: 55ch; margin: .8rem 0 0; color: #5b6e66; font-size: .97rem; line-height: 1.5; }
    .hero-stat { display: grid; flex: 0 0 auto; min-width: 12rem; padding-left: 1.5rem; border-left: 1px solid #cbded0; }
    .hero-stat span { color: #4b6c5d; font-family: ui-monospace, monospace; font-size: .64rem; font-weight: 800; letter-spacing: .08em; }
    .hero-stat strong { margin: .2rem 0; color: #185642; font-size: clamp(2.7rem, 4vw, 4rem); font-weight: 800; letter-spacing: -.07em; line-height: 1; }
    .hero-stat small { color: #60736d; font-size: .75rem; }
    .dashboard { display: grid; grid-template-columns: minmax(14rem, 17rem) minmax(0, 1fr) minmax(15rem, 19rem); gap: 1rem; align-items: start; margin-top: 1rem; }
    .tools { display: grid; gap: 1rem; min-width: 0; }
    app-product-queue, app-event-log { min-width: 0; align-self: stretch; }
    @media (max-width: 1199px) {
      .dashboard { grid-template-columns: minmax(14rem, 17rem) minmax(0, 1fr); }
      .tools { grid-column: 1; grid-row: 1; }
      app-product-queue { grid-column: 2; grid-row: 1; }
      app-event-log { grid-column: 1 / -1; grid-row: 2; }
    }
    @media (max-width: 800px) {
      .dashboard { display: flex; flex-direction: column; }
      .dashboard > * { width: 100%; }
      .tools { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 620px) {
      .page-header { border-radius: 15px; }
      .hero { display: block; }
      .hero-stat { display: none; }
      .tools { grid-template-columns: 1fr; }
      .live-status { padding: .4rem .55rem; font-size: .65rem; }
    }
  `,
})
export class ProductionLine {
  protected readonly store = inject(ProductionLineStore);
  protected readonly productNoun = computed(() => {
    const count = this.store.products().length;
    if (count % 10 === 1 && count % 100 !== 11) return 'продукт';
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14)) return 'продукта';
    return 'продуктов';
  });
  private readonly queue = viewChild(ProductQueue);

  protected onNextTick(): void {
    const departingProduct = this.store.products()[0];
    if (!departingProduct) {
      return;
    }
    this.queue()?.advanceForTick(departingProduct.id);
    this.store.nextTick();
  }
}
