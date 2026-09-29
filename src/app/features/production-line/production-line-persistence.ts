import { LINE_EVENT_TYPES, type LineEvent, type LineEventType } from './models/line-event.model';
import { PRODUCT_STATUSES, type Product, type ProductStatus } from './models/product.model';

export const PRODUCTION_LINE_STORAGE_KEY = 'production-line-fifo.state.v1';

interface ProductionLineSnapshot {
  readonly products: readonly Product[];
  readonly events: readonly LineEvent[];
  readonly nextEventId: number;
}

function emptySnapshot(): ProductionLineSnapshot {
  return { products: [], events: [], nextEventId: 0 };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseDate(value: unknown): Date | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function isProductStatus(value: unknown): value is ProductStatus {
  return typeof value === 'string' && PRODUCT_STATUSES.some((status) => status === value);
}

function isLineEventType(value: unknown): value is LineEventType {
  return typeof value === 'string' && LINE_EVENT_TYPES.some((type) => type === value);
}

function parseProduct(value: unknown): Product | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const id = value['id'];
  const arrivedAt = parseDate(value['arrivedAt']);
  const status = value['status'];
  if (typeof id !== 'string' || !id.trim() || id !== id.trim() || !arrivedAt || !isProductStatus(status)) {
    return undefined;
  }
  return { id, arrivedAt, status };
}

function parseEvent(value: unknown): LineEvent | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const id = value['id'];
  const occurredAt = parseDate(value['occurredAt']);
  const type = value['type'];
  const productId = value['productId'];
  const description = value['description'];
  if (
    typeof id !== 'string' ||
    !/^[1-9]\d*$/.test(id) ||
    !Number.isSafeInteger(Number(id)) ||
    !occurredAt ||
    !isLineEventType(type) ||
    (productId !== undefined && typeof productId !== 'string') ||
    typeof description !== 'string' ||
    !description.trim()
  ) {
    return undefined;
  }
  return { id, occurredAt, type, productId, description };
}

export function loadProductionLineState(): ProductionLineSnapshot {
  try {
    const serialized = globalThis.localStorage?.getItem(PRODUCTION_LINE_STORAGE_KEY);
    if (!serialized) {
      return emptySnapshot();
    }
    const stored: unknown = JSON.parse(serialized);
    if (!isRecord(stored) || stored['version'] !== 1) {
      return emptySnapshot();
    }
    const storedProducts = stored['products'];
    const storedEvents = stored['events'];
    if (!Array.isArray(storedProducts) || !Array.isArray(storedEvents)) {
      return emptySnapshot();
    }

    const products: Product[] = [];
    for (const item of storedProducts as unknown[]) {
      const product = parseProduct(item);
      if (!product || products.some((current) => current.id === product.id)) {
        return emptySnapshot();
      }
      products.push(product);
    }

    const events: LineEvent[] = [];
    for (const item of storedEvents as unknown[]) {
      const event = parseEvent(item);
      if (!event || events.some((current) => current.id === event.id)) {
        return emptySnapshot();
      }
      events.push(event);
    }
    events.sort((first, second) => Number(second.id) - Number(first.id));
    return {
      products,
      events: events.slice(0, 20),
      nextEventId: events.length ? Number(events[0].id) : 0,
    };
  } catch {
    return emptySnapshot();
  }
}

export function saveProductionLineState(products: readonly Product[], events: readonly LineEvent[]): void {
  try {
    const serialized = JSON.stringify({
      version: 1,
      products: products.map((product) => ({
        id: product.id,
        arrivedAt: product.arrivedAt.toISOString(),
        status: product.status,
      })),
      events: events.map((event) => ({
        id: event.id,
        type: event.type,
        occurredAt: event.occurredAt.toISOString(),
        productId: event.productId,
        description: event.description,
      })),
    });
    globalThis.localStorage?.setItem(PRODUCTION_LINE_STORAGE_KEY, serialized);
  } catch {
    // The in-memory queue remains usable when browser storage is unavailable.
  }
}
