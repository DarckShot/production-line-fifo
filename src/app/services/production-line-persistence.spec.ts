import type { LineEvent } from '../models/line-event.model';
import type { Product } from '../models/product.model';
import {
  PRODUCTION_LINE_STORAGE_KEY,
  ProductionLinePersistence,
} from './production-line-persistence';

describe('ProductionLinePersistence', () => {
  const arrivedAt = new Date('2026-01-01T10:00:00Z');
  const occurredAt = new Date('2026-01-01T10:01:00Z');
  const product: Product = { id: 'PRD-1', arrivedAt, status: 'Проверен' };
  const event: LineEvent = {
    id: '1',
    type: 'status-changed',
    occurredAt,
    productId: 'PRD-1',
    description: 'Статус изменён: В очереди → Проверен',
  };
  const storedProduct = { id: 'PRD-1', arrivedAt: arrivedAt.toISOString(), status: 'Проверен' };
  const storedEvent = { ...event, occurredAt: occurredAt.toISOString() };

  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  function saveRaw(products: unknown[], events: unknown[]): void {
    localStorage.setItem(
      PRODUCTION_LINE_STORAGE_KEY,
      JSON.stringify({ version: 1, products, events }),
    );
  }

  it('serializes the queue and journal as JSON and restores dates as Date objects', () => {
    const persistence = new ProductionLinePersistence();
    persistence.save([product], [event]);

    expect(JSON.parse(localStorage.getItem(PRODUCTION_LINE_STORAGE_KEY)!)).toEqual({
      version: 1,
      products: [storedProduct],
      events: [storedEvent],
    });
    expect(persistence.load()).toEqual({ products: [product], events: [event], nextEventId: 1 });
  });

  it('restores only the 20 latest events in descending ID order', () => {
    saveRaw(
      [storedProduct],
      Array.from({ length: 25 }, (_, index) => ({ ...storedEvent, id: String(index + 1) })),
    );

    const restored = new ProductionLinePersistence().load();
    expect(restored.products).toEqual([product]);
    expect(restored.events.map((entry) => entry.id)).toEqual(
      Array.from({ length: 20 }, (_, index) => String(25 - index)),
    );
    expect(restored.nextEventId).toBe(25);
  });

  it('starts empty when no snapshot exists or its JSON or version is invalid', () => {
    const persistence = new ProductionLinePersistence();
    const empty = { products: [], events: [], nextEventId: 0 };
    expect(persistence.load()).toEqual(empty);

    for (const invalid of ['{broken', 'null', '{"version":2,"products":[],"events":[]}']) {
      localStorage.setItem(PRODUCTION_LINE_STORAGE_KEY, invalid);
      expect(persistence.load()).toEqual(empty);
    }
  });

  it.each([
    ['missing product array', { version: 1, events: [] }],
    ['missing event array', { version: 1, products: [] }],
    ['non-object product', { version: 1, products: [null], events: [] }],
    ['invalid product ID', { version: 1, products: [{ ...storedProduct, id: ' ' }], events: [] }],
    [
      'untrimmed product ID',
      { version: 1, products: [{ ...storedProduct, id: ' PRD-1 ' }], events: [] },
    ],
    [
      'invalid product status',
      { version: 1, products: [{ ...storedProduct, status: 'Unknown' }], events: [] },
    ],
    [
      'invalid product date',
      { version: 1, products: [{ ...storedProduct, arrivedAt: 'bad' }], events: [] },
    ],
    [
      'non-string product date',
      { version: 1, products: [{ ...storedProduct, arrivedAt: 42 }], events: [] },
    ],
    ['duplicate product IDs', { version: 1, products: [storedProduct, storedProduct], events: [] }],
    ['non-object event', { version: 1, products: [], events: [null] }],
    [
      'invalid event type',
      { version: 1, products: [], events: [{ ...storedEvent, type: 'unknown' }] },
    ],
    ['invalid event ID', { version: 1, products: [], events: [{ ...storedEvent, id: '0' }] }],
    [
      'invalid event date',
      { version: 1, products: [], events: [{ ...storedEvent, occurredAt: 'bad' }] },
    ],
    [
      'non-string event date',
      { version: 1, products: [], events: [{ ...storedEvent, occurredAt: 42 }] },
    ],
    [
      'invalid event description',
      { version: 1, products: [], events: [{ ...storedEvent, description: ' ' }] },
    ],
    [
      'invalid event product ID',
      { version: 1, products: [], events: [{ ...storedEvent, productId: 12 }] },
    ],
    ['duplicate event IDs', { version: 1, products: [], events: [storedEvent, storedEvent] }],
  ])('rejects a snapshot with %s instead of partially restoring it', (_reason, invalid) => {
    localStorage.setItem(PRODUCTION_LINE_STORAGE_KEY, JSON.stringify(invalid));

    expect(new ProductionLinePersistence().load()).toEqual({
      products: [],
      events: [],
      nextEventId: 0,
    });
  });

  it('keeps the application usable when browser storage is unavailable', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('storage blocked');
      },
      setItem: () => {
        throw new Error('storage blocked');
      },
    });
    const persistence = new ProductionLinePersistence();

    expect(persistence.load()).toEqual({ products: [], events: [], nextEventId: 0 });
    expect(() => persistence.save([product], [event])).not.toThrow();
  });
});
