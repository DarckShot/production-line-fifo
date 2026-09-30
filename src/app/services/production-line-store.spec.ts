import { TestBed } from '@angular/core/testing';
import type { Product } from '../models/product.model';
import { PRODUCTION_LINE_STORAGE_KEY } from './production-line-persistence';
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
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [ProductionLineStore] });
    store = TestBed.inject(ProductionLineStore);
  });

  function reloadStore(): ProductionLineStore {
    return TestBed.runInInjectionContext(() => new ProductionLineStore());
  }

  it('adds a product with its ID, arrival time, and status', () => {
    store.addProduct(first);

    expect(store.products()).toEqual([first]);
    expect(store.events()).toHaveLength(1);
    expect(store.events()[0]).toMatchObject({ type: 'added', productId: 'first' });
  });

  it('adds multiple products to the end in FIFO order', () => {
    store.addProduct(first);
    store.addProduct(second);
    const third: Product = { ...first, id: 'third', status: 'Отбракован' };
    store.addProduct(third);

    expect(store.products()).toEqual([first, second, third]);
    expect(store.products().map((product) => product.id)).toEqual(['first', 'second', 'third']);
  });

  it('rejects duplicate IDs without changing the queue or journal', () => {
    store.addProduct(first);
    store.addProduct(second);
    const eventsBefore = store.events();

    expect(() => store.addProduct({ ...first, status: 'Отбракован' })).toThrow(/уже находится/);
    expect(store.products()).toEqual([first, second]);
    expect(store.events()).toEqual(eventsBefore);
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

  it('removes a product from the middle without reordering its neighbors', () => {
    store.addProduct(first);
    store.addProduct(second);
    const third: Product = { ...first, id: 'third' };
    store.addProduct(third);

    expect(store.removeProduct('second')).toBe(true);
    expect(store.products()).toEqual([first, third]);
    expect(store.events()[0]).toMatchObject({ type: 'removed-manually', productId: 'second' });
    expect(store.removeProduct('missing')).toBe(false);
  });

  it('removes the oldest product on each tick and preserves survivor order', () => {
    store.addProduct(first);
    store.addProduct(second);
    const third: Product = { ...first, id: 'third' };
    store.addProduct(third);

    expect(store.nextTick()).toEqual(first);
    expect(store.products()).toEqual([second, third]);
    expect(store.events()[0]).toMatchObject({ type: 'removed-on-tick', productId: 'first' });
    expect(store.nextTick()).toEqual(second);
    expect(store.products()).toEqual([third]);
    expect(store.nextTick()).toEqual(third);
    expect(store.products()).toEqual([]);
  });

  it('safely handles an empty queue without recording an event', () => {
    expect(store.nextTick()).toBeUndefined();
    expect(store.products()).toEqual([]);
    expect(store.events()).toEqual([]);
    expect(store.removeProduct('missing')).toBe(false);
    expect(store.changeProductStatus('missing', 'Проверен')).toBe(false);
    expect(store.events()).toEqual([]);
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

  it('restores products, statuses, dates, and events after a reload', () => {
    store.addProduct(first);
    expect(reloadStore().products()).toEqual([first]);
    store.addProduct(second);
    store.changeProductStatus('first', 'Отбракован');
    expect(reloadStore().products()[0].status).toBe('Отбракован');
    store.removeProduct('second');
    expect(reloadStore().products()).toHaveLength(1);

    const restored = reloadStore();
    expect(restored.products()).toEqual([{ ...first, status: 'Отбракован' }]);
    expect(restored.products()[0].arrivedAt).toBeInstanceOf(Date);
    expect(restored.events()).toEqual(store.events());
    expect(restored.events()[0].occurredAt).toBeInstanceOf(Date);

    restored.nextTick();
    expect(reloadStore().products()).toEqual([]);
    expect(reloadStore().events()[0].type).toBe('removed-on-tick');
    expect(reloadStore().events()[0].id).toBe('5');
  });

  it('restores only the latest 20 events after a reload', () => {
    for (let index = 1; index <= 25; index += 1) {
      store.addProduct({ ...first, id: String(index) });
    }

    const restored = reloadStore();
    expect(restored.events()).toHaveLength(20);
    expect(restored.events()[0].productId).toBe('25');
    expect(restored.events()[19].productId).toBe('6');
    restored.removeProduct('25');
    expect(restored.events()[0].id).toBe('26');
  });

  it('starts empty when storage is absent or damaged', () => {
    expect(store.products()).toEqual([]);
    expect(store.events()).toEqual([]);

    localStorage.setItem(PRODUCTION_LINE_STORAGE_KEY, '{broken json');
    const restored = reloadStore();
    expect(restored.products()).toEqual([]);
    expect(restored.events()).toEqual([]);
    restored.addProduct(first);
    expect(reloadStore().products()).toEqual([first]);
  });

  it('ignores saved data with an invalid product status or date', () => {
    localStorage.setItem(
      PRODUCTION_LINE_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        products: [{ id: 'broken', arrivedAt: 'not-a-date', status: 'Неизвестен' }],
        events: [],
      }),
    );

    const restored = reloadStore();
    expect(restored.products()).toEqual([]);
    expect(restored.events()).toEqual([]);
  });
});
