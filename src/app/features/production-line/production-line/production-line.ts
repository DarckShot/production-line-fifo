import { Component, inject } from '@angular/core';
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
        <p class="eyebrow">Мониторинг производства</p>
        <h1>Производственная линия</h1>
        <p>Движение продуктов от входа к выходу по принципу FIFO</p>
      </header>
      <div class="tools">
        <app-product-form />
        <app-line-controls />
      </div>
      <app-product-queue [products]="store.products()" (statusChanged)="store.changeProductStatus($event.id, $event.status)" />
      <app-event-log [events]="store.events()" />
    </main>
  `,
  styles: `
    :host { display: block; min-height: 100vh; background: #f1f5f9; }
    .page { display: grid; gap: 1.5rem; box-sizing: border-box; width: min(100%, 1100px); margin: 0 auto; padding: clamp(1rem, 3vw, 2.5rem); }
    .page-header { padding: .5rem 0; }
    .page-header .eyebrow { margin: 0 0 .4rem; color: #0f766e; font-size: .78rem; font-weight: 750; letter-spacing: .1em; text-transform: uppercase; }
    h1 { margin: 0; color: #0f172a; font-size: clamp(1.8rem, 4vw, 2.8rem); }
    .page-header p:last-child { margin: .6rem 0 0; color: #334155; line-height: 1.5; }
    .tools { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); gap: 1rem; }
  `,
})
export class ProductionLine {
  protected readonly store = inject(ProductionLineStore);
}
