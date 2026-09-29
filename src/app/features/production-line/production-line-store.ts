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
    const id = product.id.trim();
    if (!id) {
      throw new Error('ID продукта не может быть пустым');
    }
    if (this.products().some((current) => current.id === id)) {
      throw new Error(`Продукт с ID ${id} уже находится в очереди`);
    }

    this.productsState.update((products) => [...products, { ...product, id }]);
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
