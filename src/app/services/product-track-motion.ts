import {
  DestroyRef,
  Service,
  computed,
  inject,
  linkedSignal,
  signal,
  type Signal,
} from '@angular/core';
import type { Product } from '../models/product.model';
import {
  advanceTrack,
  compactTrack,
  finishTrackSettling,
  reconcileTrack,
} from '../utils/product-track-layout';
import type { ProductTrackLayout } from '../models/product-track-layout.model';

@Service({ autoProvided: false })
export class ProductTrackMotion {
  private readonly productsSource = signal<Signal<readonly Product[]> | undefined>(undefined);
  private readonly products = computed(() => this.productsSource()?.() ?? []);
  private readonly layout = linkedSignal<readonly Product[], ProductTrackLayout>({
    source: this.products,
    computation: (products, previous) => reconcileTrack(products, previous?.value),
  });
  private settleTimer: ReturnType<typeof setTimeout> | undefined;
  private finishTimer: ReturnType<typeof setTimeout> | undefined;

  readonly slotCount = computed(() => this.layout().slotCount);
  readonly settling = computed(() => this.layout().settling);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearTimers());
  }

  connect(products: Signal<readonly Product[]>): void {
    this.productsSource.set(products);
  }

  slotOf(id: Product['id']): number {
    return this.layout().slots.get(id) ?? 0;
  }

  advanceForTick(departingId: Product['id']): void {
    this.clearTimers();
    this.layout.update((current) => advanceTrack(current, departingId));
    if (this.layout().pendingDepartureId !== departingId) {
      return;
    }
    const reducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    this.settleTimer = setTimeout(() => this.settleAtEntry(), reducedMotion ? 0 : 480);
  }

  private settleAtEntry(): void {
    this.layout.set(compactTrack(this.products(), true));
    this.finishTimer = setTimeout(() => {
      this.layout.update(finishTrackSettling);
    }, 280);
  }

  private clearTimers(): void {
    clearTimeout(this.settleTimer);
    clearTimeout(this.finishTimer);
  }
}
