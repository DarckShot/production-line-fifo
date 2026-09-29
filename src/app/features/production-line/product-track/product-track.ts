import { Component, DestroyRef, ElementRef, computed, effect, inject, input, output, signal, untracked, viewChild } from '@angular/core';
import type { Product, ProductStatus } from '../models/product.model';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'app-product-track',
  imports: [ProductCard],
  template: `
    <div class="track-toolbar">
      <span>ДВИЖЕНИЕ ПРОДУКТОВ</span>
      <div class="track-navigation">
        <button type="button" (click)="scrollToStart()" [disabled]="!products().length">← Вход</button>
        <button type="button" (click)="scrollToExit()" [disabled]="!products().length">Выход →</button>
      </div>
    </div>
    <div #track class="track" role="region" [attr.tabindex]="products().length ? 0 : null" aria-label="Лента продуктов; прокручивается по горизонтали">
      @if (products().length) {
        <ol class="products" [class.settling]="settling()" [style.--slots]="slotCount()" aria-label="Продукты от входа к выходу" animate.leave="products-leaving">
          @for (product of productsFromEntryToExit(); track product.id) {
            <li [style.--slot]="slotOf(product.id)" animate.enter="product-enter" animate.leave="product-leaving"><app-product-card [product]="product" (statusChanged)="statusChanged.emit({ id: product.id, status: $event })" (removed)="removed.emit(product.id)" /></li>
          }
        </ol>
      } @else {
        <div class="empty-state" role="status">
          <span class="empty-icon" aria-hidden="true">↗</span>
          <strong>Линия готова к работе</strong>
          <span>Очередь пуста. Добавьте продукт, чтобы запустить линию.</span>
        </div>
      }
    </div>
    <p class="track-hint">Карточки движутся от входа к датчику отбраковки. Ленту можно прокручивать горизонтально.</p>
  `,
  styles: `
    :host { display: block; min-width: 0; }
    .track-toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .65rem; margin: 0 0 .65rem; }
    .track-toolbar > span { color: #c3ddcf; font-family: ui-monospace, monospace; font-size: .61rem; font-weight: 800; letter-spacing: .09em; }
    .track-toolbar > span span { color: var(--lime); }
    .track-navigation { display: flex; gap: .35rem; }
    .track-navigation button { min-height: 34px; padding: .3rem .6rem; border: 1px solid #86af9d70; border-radius: 6px; background: #ffffff10; color: #f2f8ef; font-size: .7rem; font-weight: 750; cursor: pointer; }
    .track-navigation button:hover:not(:disabled) { background: #ffffff26; }
    .track-navigation button:disabled { opacity: .45; cursor: not-allowed; }
    .track-navigation button:focus-visible { outline: 3px solid var(--lime); outline-offset: 2px; }
    .track { --card-width: min(12.4rem, 72vw); --slot-pitch: calc(var(--card-width) + .7rem); position: relative; min-height: 19.9rem; padding: .85rem; overflow-x: auto; border: 1px solid #c9dccd; border-radius: 10px; background: linear-gradient(90deg, #c2d9c8 0 2px, transparent 2px calc(100% - 2px), #d6ac94 calc(100% - 2px)), repeating-linear-gradient(90deg, #f0f5ef 0 11px, #edf3ed 11px 12px); }
    .track::-webkit-scrollbar { height: 12px; }
    .track::-webkit-scrollbar-track { border-radius: 999px; background: #dbe8de; }
    .track::-webkit-scrollbar-thumb { border: 2px solid #dbe8de; border-radius: 999px; background: #559174; }
    .track::-webkit-scrollbar-thumb:hover { background: #31795d; }
    .track::-webkit-scrollbar-corner { background: transparent; }
    .track:focus-visible { outline: 3px solid var(--lime); outline-offset: 3px; }
    .products { --slots: 1; position: relative; width: max(100%, calc(var(--slots) * var(--slot-pitch))); min-height: 18rem; margin: 0; padding: 0; list-style: none; }
    .products li { --slot: 0; position: absolute; top: 0; left: 0; width: var(--card-width); height: 18rem; transform: translateX(calc(var(--slot) * var(--slot-pitch))); transition: transform 460ms cubic-bezier(.2,.8,.2,1); }
    .products.settling li { transition-duration: 220ms; }
    .product-enter { animation: product-enter 380ms both; }
    .product-leaving { animation: product-exit 360ms ease-in forwards; pointer-events: none; }
    .products-leaving { position: absolute; top: .85rem; left: .85rem; z-index: 1; animation: queue-exit 360ms ease-in forwards; pointer-events: none; }
    @keyframes product-enter { from { opacity: 0; transform: translateX(calc(var(--slot) * var(--slot-pitch) - 1rem)) scale(.97); } }
    @keyframes product-exit { to { opacity: 0; transform: translateX(calc(var(--slot) * var(--slot-pitch) + 2.5rem)) scale(.94); } }
    @keyframes queue-exit { to { opacity: 0; } }
    .empty-state { display: grid; align-content: center; justify-items: center; gap: .45rem; min-height: 18rem; padding: 1rem; border: 1px dashed #aac8b4; border-radius: 8px; background: #ffffffa6; color: #426054; text-align: center; }
    .empty-icon { display: grid; place-items: center; width: 2.7rem; height: 2.7rem; margin-bottom: .3rem; border: 1px solid #bad3c2; border-radius: 50%; color: #176958; font-size: 1.5rem; }
    .empty-state strong { color: #1b4c3c; font-size: 1rem; }
    .empty-state span:last-child { max-width: 26ch; font-size: .78rem; line-height: 1.45; }
    .track-hint { margin: .75rem 0 0; color: #b6d1c2; font-size: .72rem; line-height: 1.4; }
    @media (max-width: 620px) {
      .track { padding: .7rem; }
      .products-leaving { top: .7rem; left: .7rem; }
      .track-toolbar > span { display: none; }
      .track-navigation { width: 100%; justify-content: flex-end; }
    }
    @media (prefers-reduced-motion: reduce) {
      .products li { transition: none; }
      .product-enter, .product-leaving, .products-leaving { animation-duration: 1ms; }
    }
    @supports (-moz-appearance: none) { .track { scrollbar-color: #559174 #dbe8de; scrollbar-width: thin; } }
  `,
})
export class ProductTrack {
  readonly products = input.required<readonly Product[]>();
  readonly statusChanged = output<{ id: Product['id']; status: ProductStatus }>();
  readonly removed = output<Product['id']>();
  private readonly destroyRef = inject(DestroyRef);
  private readonly track = viewChild<ElementRef<HTMLElement>>('track');
  private readonly slots = signal<ReadonlyMap<Product['id'], number>>(new Map());
  private readonly tickDepartures = new Set<Product['id']>();
  private settleTimer: ReturnType<typeof setTimeout> | undefined;
  private resetSettlingTimer: ReturnType<typeof setTimeout> | undefined;
  protected readonly slotCount = signal(1);
  protected readonly settling = signal(false);
  protected readonly productsFromEntryToExit = computed(() => [...this.products()].reverse());

  constructor() {
    effect(() => {
      const products = this.products();
      untracked(() => this.reconcileSlots(products));
    });
    this.destroyRef.onDestroy(() => {
      clearTimeout(this.settleTimer);
      clearTimeout(this.resetSettlingTimer);
    });
  }

  protected slotOf(id: Product['id']): number {
    return this.slots().get(id) ?? 0;
  }

  protected scrollToStart(): void {
    this.scrollTrack(0);
  }

  protected scrollToExit(): void {
    this.scrollTrack(this.track()?.nativeElement.scrollWidth ?? 0);
  }

  advanceForTick(departingId: Product['id']): void {
    clearTimeout(this.settleTimer);
    clearTimeout(this.resetSettlingTimer);
    this.settling.set(false);
    this.tickDepartures.add(departingId);
    const moved = new Map(this.slots());
    for (const [id, slot] of moved) {
      if (id !== departingId) {
        moved.set(id, slot + 1);
      }
    }
    this.slots.set(moved);
    const requiredSlots = Math.max(...moved.values()) + 1;
    this.slotCount.update((count) => Math.max(count, requiredSlots));
    this.settleTimer = setTimeout(
      () => this.settleAtEntry(),
      globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 0 : 480,
    );
  }

  private settleAtEntry(): void {
    const next = new Map<Product['id'], number>(
      [...this.products()].reverse().map((product, slot) => [product.id, slot]),
    );
    this.settling.set(true);
    this.slots.set(next);
    this.slotCount.set(Math.max(1, next.size));
    this.resetSettlingTimer = setTimeout(() => this.settling.set(false), 280);
  }

  private reconcileSlots(products: readonly Product[]): void {
    const activeIds = new Set(products.map((product) => product.id));
    const previous = this.slots();
    const removedIds = [...previous.keys()].filter((id) => !activeIds.has(id));
    const manuallyRemoved = removedIds.some((id) => !this.tickDepartures.has(id));
    for (const id of removedIds) {
      this.tickDepartures.delete(id);
    }
    const next = manuallyRemoved
      ? new Map<Product['id'], number>([...products].reverse().map((product, slot) => [product.id, slot]))
      : new Map([...previous].filter(([id]) => activeIds.has(id)));
    let added = manuallyRemoved && products.some((product) => !previous.has(product.id));

    if (!manuallyRemoved) {
      for (const product of products) {
        if (next.has(product.id)) {
          continue;
        }
        added = true;
        const occupied = new Map([...next].map(([id, slot]) => [slot, id]));
        for (let slot = 0; occupied.has(slot); slot += 1) {
          next.set(occupied.get(slot)!, slot + 1);
        }
        next.set(product.id, 0);
      }
    }

    if (next.size !== previous.size || [...next].some(([id, slot]) => previous.get(id) !== slot)) {
      this.slots.set(next);
    }
    if (manuallyRemoved) {
      this.slotCount.set(Math.max(1, next.size));
    } else if (products.length) {
      const requiredSlots = Math.max(...next.values()) + 1;
      this.slotCount.set(previous.size ? Math.max(this.slotCount(), requiredSlots) : requiredSlots);
    }
    if (added) {
      this.scrollToStart();
    }
  }

  private scrollTrack(left: number): void {
    const track = this.track()?.nativeElement;
    if (!track?.scrollTo) {
      return;
    }
    track.scrollTo({
      left,
      behavior: globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }
}
