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
    <main>
      <h1>Производственная линия</h1>
      <p>Каркас управления FIFO-очередью</p>
      <app-product-form />
      <app-line-controls />
      <app-product-queue [products]="store.products()" />
      <app-event-log [events]="store.events()" />
    </main>
  `,
})
export class ProductionLine {
  protected readonly store = inject(ProductionLineStore);
}
