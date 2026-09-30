import {
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import type { Product, ProductStatusChange } from '../../models/product.model';
import { ProductCard } from '../product-card/product-card';
import { ProductTrackMotion } from '../../services/product-track-motion';

@Component({
  selector: 'app-product-track',
  imports: [ProductCard],
  providers: [ProductTrackMotion],
  templateUrl: './product-track.html',
  styleUrl: './product-track.css',
})
export class ProductTrack {
  readonly products = input.required<readonly Product[]>();
  readonly statusChanged = output<ProductStatusChange>();
  readonly removed = output<Product['id']>();

  private readonly track = viewChild<ElementRef<HTMLElement>>('track');
  private previousIds = new Set<Product['id']>();
  protected readonly motion = inject(ProductTrackMotion);
  protected readonly productsFromEntryToExit = computed(() => [...this.products()].reverse());

  constructor() {
    this.motion.connect(this.products);
    afterRenderEffect({
      write: () => {
        const products = this.products();
        const added = products.some((product) => !this.previousIds.has(product.id));
        this.previousIds = new Set(products.map((product) => product.id));
        if (added) {
          this.scrollToStart();
        }
      },
    });
  }

  protected scrollToStart(): void {
    this.scrollTrack(0);
  }

  protected scrollToExit(): void {
    this.scrollTrack(this.track()?.nativeElement.scrollWidth ?? 0);
  }

  advanceForTick(departingId: Product['id']): void {
    this.motion.advanceForTick(departingId);
  }

  private scrollTrack(left: number): void {
    this.track()?.nativeElement.scrollTo?.({
      left,
      behavior: globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  }
}
