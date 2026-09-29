import { Service, signal } from '@angular/core';
import type { LineEvent } from './models/line-event.model';
import type { Product, ProductStatus } from './models/product.model';

@Service()
export class ProductionLineStore {
  private readonly productsState = signal<readonly Product[]>([]);
  private readonly eventsState = signal<readonly LineEvent[]>([]);

  readonly products = this.productsState.asReadonly();
  readonly events = this.eventsState.asReadonly();

  addProduct(product: Product): void {
    if (this.products().some((current) => current.id === product.id)) {
      throw new Error(`Продукт с ID ${product.id} уже находится в очереди`);
    }

    this.productsState.update((products) => [...products, product]);
  }

  changeProductStatus(id: Product['id'], status: ProductStatus): boolean {
    if (!this.products().some((product) => product.id === id)) {
      return false;
    }

    this.productsState.update((products) =>
      products.map((product) => (product.id === id ? { ...product, status } : product)),
    );
    return true;
  }

  removeProduct(id: Product['id']): boolean {
    if (!this.products().some((product) => product.id === id)) {
      return false;
    }

    this.productsState.update((products) => products.filter((product) => product.id !== id));
    return true;
  }
}
