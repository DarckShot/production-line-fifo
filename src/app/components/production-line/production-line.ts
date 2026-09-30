import { NgOptimizedImage } from '@angular/common';
import { Component, inject, viewChild } from '@angular/core';
import { EventLog } from '../event-log/event-log';
import { LineControls } from '../line-controls/line-controls';
import { ProductNoun } from '../../pipes/product-noun';
import { ProductForm } from '../product-form/product-form';
import { ProductQueue } from '../product-queue/product-queue';
import { ProductionLineStore } from '../../services/production-line-store';

@Component({
  selector: 'app-production-line',
  imports: [EventLog, LineControls, NgOptimizedImage, ProductForm, ProductNoun, ProductQueue],
  providers: [ProductionLineStore],
  templateUrl: './production-line.html',
  styleUrl: './production-line.css',
})
export class ProductionLine {
  protected readonly store = inject(ProductionLineStore);
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
