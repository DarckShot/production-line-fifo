import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { Product } from '../models/product.model';
import { ProductTrackMotion } from './product-track-motion';

describe('ProductTrackMotion', () => {
  const arrivedAt = new Date('2026-01-01T10:00:00Z');
  const product = (id: string): Product => ({ id, arrivedAt, status: 'В очереди' });

  beforeEach(() => TestBed.configureTestingModule({ providers: [ProductTrackMotion] }));
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('tracks the entry-to-exit position as products are added and manually removed', () => {
    const motion = TestBed.inject(ProductTrackMotion);
    const products = signal<readonly Product[]>([]);
    motion.connect(products);
    expect(motion.slotCount()).toBe(1);

    products.set([product('first'), product('second'), product('third')]);
    expect(['third', 'second', 'first'].map((id) => motion.slotOf(id))).toEqual([0, 1, 2]);
    expect(motion.slotCount()).toBe(3);

    products.set([product('first'), product('third')]);
    expect([motion.slotOf('third'), motion.slotOf('first')]).toEqual([0, 1]);
    expect(motion.slotCount()).toBe(2);
  });

  it('advances survivors for a tick, then closes the entry gap after the animation', () => {
    vi.useFakeTimers();
    const motion = TestBed.inject(ProductTrackMotion);
    const products = signal<readonly Product[]>([
      product('first'),
      product('second'),
      product('third'),
    ]);
    motion.connect(products);

    motion.advanceForTick('first');
    products.set(products().slice(1));
    expect([motion.slotOf('third'), motion.slotOf('second')]).toEqual([1, 2]);
    expect(motion.slotCount()).toBe(3);
    expect(motion.settling()).toBe(false);

    vi.advanceTimersByTime(480);
    expect([motion.slotOf('third'), motion.slotOf('second')]).toEqual([0, 1]);
    expect(motion.settling()).toBe(true);
    vi.advanceTimersByTime(280);
    expect(motion.settling()).toBe(false);
  });

  it('settles immediately when reduced motion is requested', () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true })),
    );
    const motion = TestBed.inject(ProductTrackMotion);
    const products = signal<readonly Product[]>([product('first'), product('second')]);
    motion.connect(products);

    motion.advanceForTick('first');
    products.set([product('second')]);
    vi.advanceTimersByTime(0);

    expect(motion.slotOf('second')).toBe(0);
    expect(motion.settling()).toBe(true);
  });

  it('cancels the previous settlement when ticks happen in quick succession', () => {
    vi.useFakeTimers();
    const motion = TestBed.inject(ProductTrackMotion);
    const products = signal<readonly Product[]>([
      product('first'),
      product('second'),
      product('third'),
    ]);
    motion.connect(products);

    motion.advanceForTick('first');
    products.set(products().slice(1));
    vi.advanceTimersByTime(250);
    motion.advanceForTick('second');
    products.set([product('third')]);

    vi.advanceTimersByTime(230);
    expect(motion.slotOf('third')).toBe(2);
    vi.advanceTimersByTime(250);
    expect(motion.slotOf('third')).toBe(0);
    expect(motion.settling()).toBe(true);
  });

  it('does nothing when the departing product is not on the track', () => {
    vi.useFakeTimers();
    const motion = TestBed.inject(ProductTrackMotion);
    motion.connect(signal<readonly Product[]>([product('first')]));

    motion.advanceForTick('missing');

    expect(motion.slotOf('first')).toBe(0);
    expect(motion.slotCount()).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
  });
});
