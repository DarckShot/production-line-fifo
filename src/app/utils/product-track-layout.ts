import type { Product } from '../models/product.model';
import type { ProductTrackLayout } from '../models/product-track-layout.model';

export function compactTrack(products: readonly Product[], settling = false): ProductTrackLayout {
  const slots = new Map<Product['id'], number>(
    [...products].reverse().map((product, slot) => [product.id, slot]),
  );
  return { slots, slotCount: Math.max(1, slots.size), settling };
}

export function reconcileTrack(
  products: readonly Product[],
  previous?: ProductTrackLayout,
): ProductTrackLayout {
  if (!previous) {
    return compactTrack(products);
  }

  const activeIds = new Set(products.map((product) => product.id));
  const removedIds = [...previous.slots.keys()].filter((id) => !activeIds.has(id));
  if (removedIds.some((id) => id !== previous.pendingDepartureId)) {
    return compactTrack(products);
  }

  const slots = new Map([...previous.slots].filter(([id]) => activeIds.has(id)));
  for (const product of products) {
    if (slots.has(product.id)) {
      continue;
    }
    for (const [id, slot] of slots) {
      slots.set(id, slot + 1);
    }
    slots.set(product.id, 0);
  }

  const requiredSlots = slots.size ? Math.max(...slots.values()) + 1 : 1;
  return {
    slots,
    slotCount: previous.slots.size ? Math.max(previous.slotCount, requiredSlots) : requiredSlots,
    settling: previous.settling,
    pendingDepartureId: activeIds.has(previous.pendingDepartureId ?? '')
      ? previous.pendingDepartureId
      : undefined,
  };
}

export function advanceTrack(
  layout: ProductTrackLayout,
  departingId: Product['id'],
): ProductTrackLayout {
  if (!layout.slots.has(departingId)) {
    return layout;
  }
  const slots = new Map(layout.slots);
  for (const [id, slot] of slots) {
    if (id !== departingId) {
      slots.set(id, slot + 1);
    }
  }
  return {
    slots,
    slotCount: Math.max(layout.slotCount, Math.max(...slots.values()) + 1),
    settling: false,
    pendingDepartureId: departingId,
  };
}

export function finishTrackSettling(layout: ProductTrackLayout): ProductTrackLayout {
  return { ...layout, settling: false };
}
