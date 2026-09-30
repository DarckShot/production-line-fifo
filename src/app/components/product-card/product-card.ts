import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import type { Product, ProductStatus } from '../../models/product.model';
import { StatusPicker } from '../status-picker/status-picker';

@Component({
  selector: 'app-product-card',
  imports: [DatePipe, StatusPicker],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly statusChanged = output<ProductStatus>();
  readonly removed = output<void>();
}
