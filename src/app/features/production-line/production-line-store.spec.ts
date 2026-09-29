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
});
