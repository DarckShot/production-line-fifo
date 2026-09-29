import type { Product } from './models/product.model';
import { ProductionLineStore } from './production-line-store';

describe('ProductionLineStore', () => {
  let store: ProductionLineStore;
  const first: Product = {
    id: 'first',
    arrivedAt: new Date('2026-01-01T10:00:00Z'),
    status: 'В очереди',
  };
  const second: Product = {
    id: 'second',
    arrivedAt: new Date('2026-01-01T10:01:00Z'),
    status: 'Проверен',
  };

  beforeEach(() => {
    store = new ProductionLineStore();
  });

  it('keeps products in insertion order and rejects duplicate IDs', () => {
    store.addProduct(first);
    store.addProduct(second);

    expect(store.products()).toEqual([first, second]);
    expect(() => store.addProduct({ ...first, status: 'Отбракован' })).toThrow(/уже находится/);
    expect(store.products()).toEqual([first, second]);
  });

  it('rejects blank IDs and compares IDs after trimming whitespace', () => {
    expect(() => store.addProduct({ ...first, id: '   ' })).toThrow(/не может быть пустым/);
    store.addProduct(first);
    expect(() => store.addProduct({ ...first, id: ' first ' })).toThrow(/уже находится/);
    expect(store.products()).toEqual([first]);
  });

  it('changes only the selected product status and keeps its position', () => {
    store.addProduct(first);
    store.addProduct(second);

    expect(store.changeProductStatus('first', 'Отбракован')).toBe(true);
    expect(store.products()).toEqual([{ ...first, status: 'Отбракован' }, second]);
    expect(store.changeProductStatus('missing', 'Проверен')).toBe(false);
  });

  it('removes only the selected product', () => {
    store.addProduct(first);
    store.addProduct(second);

    expect(store.removeProduct('first')).toBe(true);
    expect(store.products()).toEqual([second]);
    expect(store.removeProduct('missing')).toBe(false);
  });

  it('advances FIFO on each tick and safely handles an empty queue', () => {
    expect(store.nextTick()).toBeUndefined();
    store.addProduct(first);
    store.addProduct(second);

    expect(store.nextTick()).toEqual(first);
    expect(store.products()).toEqual([second]);
    expect(store.nextTick()).toEqual(second);
    expect(store.products()).toEqual([]);
    expect(store.nextTick()).toBeUndefined();
  });

  it('records all four event types with time, product ID, and description', () => {
    const earliestEventTime = Date.now();
    store.addProduct(first);
    store.changeProductStatus('first', 'Отбракован');
    store.removeProduct('first');
    store.addProduct(second);
    store.nextTick();

    expect(store.events().map((event) => event.type)).toEqual([
      'removed-on-tick',
      'added',
      'removed-manually',
      'status-changed',
      'added',
    ]);
    expect(new Set(store.events().map((event) => event.id)).size).toBe(5);
    for (const event of store.events()) {
      expect(event.productId).toMatch(/^(first|second)$/);
      expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(earliestEventTime);
      expect(event.occurredAt.getTime()).toBeLessThanOrEqual(Date.now());
      expect(event.description.length).toBeGreaterThan(0);
    }
    expect(store.events()[0].description).toContain('Автоматически удалён');
    expect(store.events()[2].description).toContain('Удалён вручную');
    expect(store.events()[3].description).toContain('Отбракован');
  });

  it('keeps only the 20 most recent events and skips operations that did not change state', () => {
    store.nextTick();
    store.removeProduct('missing');
    store.changeProductStatus('missing', 'Проверен');
    expect(store.events()).toEqual([]);

    for (let index = 1; index <= 25; index += 1) {
      store.addProduct({ ...first, id: String(index) });
    }
    expect(store.events()).toHaveLength(20);
    expect(store.events()[0].productId).toBe('25');
    expect(store.events()[19].productId).toBe('6');

    store.changeProductStatus('25', 'В очереди');
    expect(store.events()).toHaveLength(20);
    expect(store.events()[0].productId).toBe('25');
    expect(store.events()[0].type).toBe('added');
  });
});
