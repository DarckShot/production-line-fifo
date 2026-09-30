import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { AnchoredPopover } from '../../directives/anchored-popover';
import { PRODUCT_STATUSES, type Product, type ProductStatus } from '../../models/product.model';

let nextStatusPickerId = 0;

@Component({
  selector: 'app-status-picker',
  imports: [AnchoredPopover],
  styleUrl: './status-picker.css',
  templateUrl: './status-picker.html',
})
export class StatusPicker {
  readonly productId = input.required<Product['id']>();
  readonly status = input.required<ProductStatus>();
  readonly statusChanged = output<ProductStatus>();

  private readonly document = inject(DOCUMENT);
  private readonly statusTrigger = viewChild<ElementRef<HTMLButtonElement>>('statusTrigger');
  private readonly statusMenu = viewChild<ElementRef<HTMLUListElement>>('statusMenu');
  private readonly popover = viewChild(AnchoredPopover);

  protected readonly pickerId = `product-status-${++nextStatusPickerId}`;
  protected readonly menuOpen = signal(false);
  protected readonly pointerFocus = signal(false);
  protected readonly statuses = PRODUCT_STATUSES;

  protected toggleMenu(): void {
    if (this.menuOpen()) {
      this.closeMenu();
    } else {
      this.openMenu(!this.pointerFocus());
    }
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    this.pointerFocus.set(false);
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return;
    }
    event.preventDefault();
    if (!this.menuOpen()) {
      this.openMenu(true);
      return;
    }
    const selected = this.statuses.indexOf(this.status());
    const step = event.key === 'ArrowDown' ? 1 : -1;
    this.focusOption((selected + step + this.statuses.length) % this.statuses.length);
  }

  protected onMenuKeydown(event: KeyboardEvent): void {
    const options = [
      ...(this.statusMenu()?.nativeElement.querySelectorAll<HTMLElement>('[role="option"]') ?? []),
    ];
    if (!options.length) {
      return;
    }
    const current = Math.max(0, options.indexOf(this.document.activeElement as HTMLElement));

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        this.focusOption(
          (current + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length,
        );
        break;
      case 'Home':
      case 'End':
        event.preventDefault();
        this.focusOption(event.key === 'Home' ? 0 : options.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.chooseStatus(this.statuses[current]);
        break;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        this.closeMenu(true);
        break;
      case 'Tab':
        this.closeMenu();
        break;
    }
  }

  protected chooseStatus(status: ProductStatus): void {
    if (status !== this.status()) {
      this.statusChanged.emit(status);
    }
    this.closeMenu(true);
  }

  protected closeMenu(restoreFocus = false): void {
    if (!this.menuOpen()) {
      return;
    }
    this.menuOpen.set(false);
    this.popover()?.hide();
    if (restoreFocus) {
      this.statusTrigger()?.nativeElement.focus({ preventScroll: true });
    }
  }

  private openMenu(focusSelected: boolean): void {
    if (!this.popover()?.show()) {
      return;
    }
    this.menuOpen.set(true);
    if (focusSelected) {
      this.focusOption(this.statuses.indexOf(this.status()));
    }
  }

  private focusOption(index: number): void {
    const options =
      this.statusMenu()?.nativeElement.querySelectorAll<HTMLElement>('[role="option"]');
    options?.[index]?.focus({ preventScroll: true });
  }
}
