import { Component, input, output, viewChild } from '@angular/core';
import type { Product, ProductStatusChange } from '../../models/product.model';
import { ProductTrack } from '../product-track/product-track';

@Component({
  selector: 'app-product-queue',
  imports: [ProductTrack],
  templateUrl: './product-queue.html',
  styleUrl: './product-queue.css',
})
export class ProductQueue {
  readonly products = input.required<readonly Product[]>();
  readonly statusChanged = output<ProductStatusChange>();
  readonly removed = output<Product['id']>();
  private readonly track = viewChild(ProductTrack);

  advanceForTick(departingId: Product['id']): void {
    this.track()?.advanceForTick(departingId);
  }
}
