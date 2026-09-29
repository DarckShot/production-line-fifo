import { Service, signal } from '@angular/core';
import type { LineEvent, LineEventType } from './models/line-event.model';
import type { Product, ProductStatus } from './models/product.model';

@Service()
export class ProductionLineStore {
  private readonly productsState = signal<readonly Product[]>([]);
  private readonly eventsState = signal<readonly LineEvent[]>([]);
  private nextEventId = 0;

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
    this.recordEvent('added', id, `Продукт ${id} добавлен в очередь`);
  }

  changeProductStatus(id: Product['id'], status: ProductStatus): boolean {
    const currentProduct = this.products().find((product) => product.id === id);
    if (!currentProduct) {
      return false;
    }
    if (currentProduct.status === status) {
      return true;
    }

    this.productsState.update((products) =>
      products.map((product) => (product.id === id ? { ...product, status } : product)),
    );
    this.recordEvent(
      'status-changed',
      id,
      `Статус продукта ${id} изменён: ${currentProduct.status} → ${status}`,
    );
    return true;
  }

  removeProduct(id: Product['id']): boolean {
    if (!this.products().some((product) => product.id === id)) {
      return false;
    }

    this.productsState.update((products) => products.filter((product) => product.id !== id));
    this.recordEvent('removed-manually', id, `Продукт ${id} удалён вручную`);
    return true;
  }

  nextTick(): Product | undefined {
    const departingProduct = this.products()[0];
    if (!departingProduct) {
      return undefined;
    }

    this.productsState.update((products) => products.slice(1));
    this.recordEvent(
      'removed-on-tick',
      departingProduct.id,
      `Продукт ${departingProduct.id} автоматически удалён после такта`,
    );
    return departingProduct;
  }

  private recordEvent(type: LineEventType, productId: Product['id'], description: string): void {
    const event: LineEvent = {
      id: String(++this.nextEventId),
      type,
      occurredAt: new Date(),
      productId,
      description,
    };
    this.eventsState.update((events) => [event, ...events].slice(0, 20));
  }
}
