import type { Product } from '../models/product.model';
import {
  advanceTrack,
  compactTrack,
  finishTrackSettling,
  reconcileTrack,
} from './product-track-layout';

const arrivedAt = new Date('2026-01-01T10:00:00Z');
const product = (id: string): Product => ({ id, arrivedAt, status: 'В очереди' });
const slots = (layout: ReturnType<typeof compactTrack>) => [...layout.slots];

describe('product track layout', () => {
  it('keeps a usable empty slot and leaves unknown departures unchanged', () => {
    const empty = compactTrack([]);
    expect(empty.slotCount).toBe(1);
    expect(slots(empty)).toEqual([]);
    expect(advanceTrack(empty, 'missing')).toBe(empty);
  });

  it('places new products at the entry while keeping FIFO order', () => {
    const first = reconcileTrack([product('first')]);
    const second = reconcileTrack([product('first'), product('second')], first);
    const third = reconcileTrack([product('first'), product('second'), product('third')], second);

    expect(slots(third)).toEqual([
      ['first', 2],
      ['second', 1],
      ['third', 0],
    ]);
    expect(third.slotCount).toBe(3);
  });

  it('moves survivors toward the exit and compacts them after the tick', () => {
    const products = [product('first'), product('second'), product('third')];
    const moved = advanceTrack(compactTrack(products), 'first');
    const afterRemoval = reconcileTrack(products.slice(1), moved);

    expect(slots(afterRemoval)).toEqual([
      ['third', 1],
      ['second', 2],
    ]);
    expect(afterRemoval.slotCount).toBe(3);
    expect(slots(compactTrack(products.slice(1), true))).toEqual([
      ['third', 0],
      ['second', 1],
    ]);
  });

  it('closes gaps immediately after manual removal, including during a tick', () => {
    const products = [product('first'), product('second'), product('third')];
    const compacted = reconcileTrack([products[0], products[2]], compactTrack(products));
    expect(slots(compacted)).toEqual([
      ['third', 0],
      ['first', 1],
    ]);

    const moved = advanceTrack(compactTrack(products), 'first');
    const afterBothRemovals = reconcileTrack([products[2]], moved);
    expect(slots(afterBothRemovals)).toEqual([['third', 0]]);
  });

  it('keeps positions consistent across consecutive ticks', () => {
    const products = [product('first'), product('second'), product('third')];
    const firstTick = reconcileTrack(
      products.slice(1),
      advanceTrack(compactTrack(products), 'first'),
    );
    const secondTick = reconcileTrack(products.slice(2), advanceTrack(firstTick, 'second'));

    expect(slots(secondTick)).toEqual([['third', 2]]);
    expect(secondTick.pendingDepartureId).toBeUndefined();
    expect(slots(compactTrack(products.slice(2)))).toEqual([['third', 0]]);
  });

  it('finishes settling without changing the product positions', () => {
    const settling = compactTrack([product('first'), product('second')], true);
    const finished = finishTrackSettling(settling);

    expect(finished.settling).toBe(false);
    expect(slots(finished)).toEqual(slots(settling));
    expect(settling.settling).toBe(true);
  });
});
