import { DOCUMENT, DatePipe } from '@angular/common';
import { Component, DestroyRef, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { PRODUCT_STATUSES, type Product, type ProductStatus } from '../models/product.model';

let nextStatusPickerId = 0;

@Component({
  selector: 'app-product-card',
  imports: [DatePipe],
  host: {
    '(document:pointerdown)': 'onDocumentPointerDown($event)',
    '(document:keydown.escape)': 'onEscape($event)',
    '(window:resize)': 'closeMenu()',
  },
  template: `
    <article class="product-card" [class.card--checked]="product().status === 'Проверен'" [class.card--rejected]="product().status === 'Отбракован'">
      <div class="card-head">
        <p class="card-label">ПРОДУКТ</p>
        <span class="status" [class.status--checked]="product().status === 'Проверен'" [class.status--rejected]="product().status === 'Отбракован'">
          {{ product().status }}
        </span>
      </div>
      <h3 [attr.title]="product().id">{{ product().id }}</h3>
      <dl>
        <div>
          <dt>Время поступления</dt>
          <dd><time [attr.datetime]="product().arrivedAt.toISOString()">{{ product().arrivedAt | date: 'dd.MM.yyyy HH:mm' }}</time></dd>
        </div>
      </dl>
      <div class="card-actions">
        <div class="status-control">
          <label [attr.for]="pickerId + '-trigger'">Изменить статус</label>
          <button
            #statusTrigger
            [id]="pickerId + '-trigger'"
            type="button"
            class="status-trigger"
            [class.pointer-focus]="pointerFocus()"
            [attr.aria-label]="'Изменить статус продукта ' + product().id + '. Сейчас: ' + product().status"
            aria-haspopup="listbox"
            [attr.aria-expanded]="menuOpen()"
            (pointerdown)="pointerFocus.set(true)"
            (keydown)="onTriggerKeydown($event)"
            (blur)="pointerFocus.set(false)"
            (click)="toggleMenu()"
          >
            <span>{{ product().status }}</span>
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
              <path d="m4 6.5 4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <ul
            #statusMenu
            [id]="pickerId + '-menu'"
            class="status-menu"
            popover="manual"
            role="listbox"
            [attr.aria-label]="'Статус продукта ' + product().id"
            (keydown)="onMenuKeydown($event)"
          >
            @for (status of statuses; track status) {
              <li role="option" tabindex="-1" [attr.aria-selected]="status === product().status" (click)="chooseStatus(status)">
                {{ status }}
              </li>
            }
          </ul>
        </div>
        <button type="button" class="remove-button" [attr.aria-label]="'Удалить продукт ' + product().id" (click)="removed.emit()">
          Удалить
          <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
            <path d="m4.5 4.5 7 7m0-7-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </article>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }

    .product-card {
      --state: #5988F8E2;
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: .85rem;
      border: 1px solid #d5e2d9;
      border-top: 4px solid var(--state);
      border-radius: 9px;
      background: #fff;
      box-shadow: 0 8px 20px #1c493124;
    }

    .product-card.card--checked {
      --state: #2a7e49;
    }

    .product-card.card--rejected {
      --state: #b24e43;
    }

    .card-head {
      display: grid;
      gap: .4rem;
      justify-items: start;
    }

    .card-label {
      margin: 0;
      color: #62796d;
      font-family: ui-monospace, monospace;
      font-size: .58rem;
      font-weight: 800;
      letter-spacing: .12em;
    }

    .status {
      display: inline-flex;
      align-items: center;
      gap: .3rem;
      max-width: 100%;
      padding: .23rem .45rem;
      border-radius: 4px;
      background: #5988F81F;
      color: #315eaf;
      font-size: .65rem;
      font-weight: 800;
      white-space: nowrap;
    }

    .status::before {
      width: .38rem;
      height: .38rem;
      border-radius: 50%;
      background: currentColor;
      content: '';
    }

    .status--checked {
      background: #e3f2e7;
      color: #216640;
    }

    .status--rejected {
      background: #fae8e5;
      color: #9c352f;
    }

    h3 {
      max-height: 3.1rem;
      min-height: 1.6rem;
      margin: .55rem 0 .75rem;
      overflow: auto;
      overflow-wrap: anywhere;
      color: #17342d;
      font-size: 1.12rem;
      font-weight: 850;
      letter-spacing: -.04em;
      line-height: 1.25;
    }

    dl {
      margin: 0;
      padding: .55rem 0;
      border-top: 1px solid #e5ede6;
    }

    dt {
      color: #65776d;
      font-size: .66rem;
    }

    dd {
      margin: .22rem 0 0;
      color: #203e32;
      font-family: ui-monospace, monospace;
      font-size: .68rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }

    .card-actions {
      display: grid;
      gap: .55rem;
      margin-top: auto;
    }

    .status-control {
      display: grid;
      gap: .32rem;
    }

    .status-control label {
      color: #435b4e;
      font-size: .68rem;
      font-weight: 750;
      cursor: pointer;
    }

    .status-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      min-height: 42px;
      padding: .45rem .7rem .45rem .65rem;
      border: 1px solid #bbcdc0;
      border-radius: 7px;
      background: #fbfdf9;
      color: #19312e;
      font-size: .75rem;
      font-weight: 750;
      text-align: left;
      cursor: pointer;
    }

    .status-trigger:hover {
      border-color: #7eaa90;
      background: #f3faf4;
    }

    .status-trigger:focus {
      outline: none;
    }

    .status-trigger:focus-visible:not(.pointer-focus) {
      box-shadow: inset 0 -3px 0 #176958;
    }

    .status-trigger svg {
      width: 1rem;
      height: 1rem;
      flex: none;
      color: #286a51;
      pointer-events: none;
      transition: transform 160ms ease;
    }

    .status-trigger[aria-expanded='true'] svg {
      transform: rotate(180deg);
    }

    .status-menu {
      position: fixed;
      inset: auto;
      display: none;
      gap: .15rem;
      max-height: calc(100dvh - 1rem);
      margin: 0;
      padding: .3rem;
      overflow-y: auto;
      border: 1px solid #c7d9ca;
      border-radius: 10px;
      background: #fff;
      box-shadow: 0 16px 36px #183e2a30;
      list-style: none;
    }

    .status-menu:popover-open {
      display: grid;
    }

    .status-menu li {
      display: flex;
      align-items: center;
      min-height: 40px;
      padding: .6rem .75rem;
      border-radius: 6px;
      color: #19312e;
      font-size: .8rem;
      font-weight: 750;
      cursor: pointer;
      user-select: none;
    }

    .status-menu li:hover, .status-menu li:focus-visible {
      background: #edf7ef;
    }

    .status-menu li:focus-visible {
      outline: 2px solid #176958;
      outline-offset: -2px;
    }

    .status-menu li[aria-selected='true'] {
      background: #dff0e3;
      color: #185d43;
      font-weight: 800;
    }

    .remove-button {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      min-height: 42px;
      padding: .45rem .7rem .45rem .65rem;
      border: 1px solid #e4c9c3;
      border-radius: 7px;
      background: #fff9f8;
      color: #9c352f;
      font-size: .75rem;
      font-weight: 800;
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    .remove-button:hover {
      background: #fae8e5;
    }

    .remove-button:active {
      background: #f3dcd7;
    }

    .remove-button:focus-visible {
      outline: 2px solid #9c352f;
      outline-offset: 2px;
    }

    .remove-button svg {
      width: 1rem;
      height: 1rem;
      flex: none;
      pointer-events: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .status-trigger svg {
        transition: none;
      }
    }
  `,
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly statusChanged = output<ProductStatus>();
  readonly removed = output<void>();
  private readonly document = inject(DOCUMENT);
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly statusTrigger = viewChild<ElementRef<HTMLButtonElement>>('statusTrigger');
  private readonly statusMenu = viewChild<ElementRef<HTMLUListElement>>('statusMenu');
  private readonly repositionOnScroll = () => this.positionMenu();
  protected readonly pickerId = `product-status-${++nextStatusPickerId}`;
  protected readonly menuOpen = signal(false);
  protected readonly pointerFocus = signal(false);
  protected readonly statuses = PRODUCT_STATUSES;

  constructor() {
    this.destroyRef.onDestroy(() => this.document.removeEventListener('scroll', this.repositionOnScroll, true));
  }

  protected toggleMenu(): void {
    if (this.menuOpen()) {
      this.closeMenu();
    } else {
      this.openMenu(!this.pointerFocus());
    }
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    this.pointerFocus.set(false);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!this.menuOpen()) {
        this.openMenu(true);
      } else {
        const selected = this.statuses.indexOf(this.product().status);
        this.focusOption((selected + (event.key === 'ArrowDown' ? 1 : -1) + this.statuses.length) % this.statuses.length);
      }
    }
  }

  protected onMenuKeydown(event: KeyboardEvent): void {
    const options = [...(this.statusMenu()?.nativeElement.querySelectorAll<HTMLElement>('[role="option"]') ?? [])];
    if (!options.length) {
      return;
    }
    const current = Math.max(0, options.indexOf(this.document.activeElement as HTMLElement));

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        this.focusOption((current + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
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
    if (status !== this.product().status) {
      this.statusChanged.emit(status);
    }
    this.closeMenu(true);
  }

  protected onDocumentPointerDown(event: PointerEvent): void {
    if (this.menuOpen() && event.target && !this.hostElement.nativeElement.contains(event.target as Node)) {
      this.closeMenu();
    }
  }

  protected onEscape(event: Event): void {
    if (this.menuOpen()) {
      event.preventDefault();
      this.closeMenu(true);
    }
  }

  protected closeMenu(restoreFocus = false): void {
    if (!this.menuOpen()) {
      return;
    }
    this.menuOpen.set(false);
    this.document.removeEventListener('scroll', this.repositionOnScroll, true);
    const menu = this.statusMenu()?.nativeElement;
    if (menu && typeof menu.hidePopover === 'function' && menu.matches(':popover-open')) {
      menu.hidePopover();
    }
    if (restoreFocus) {
      this.statusTrigger()?.nativeElement.focus({ preventScroll: true });
    }
  }

  private openMenu(focusSelected: boolean): void {
    const trigger = this.statusTrigger()?.nativeElement;
    const menu = this.statusMenu()?.nativeElement;
    if (!trigger || !menu) {
      return;
    }

    const track = trigger.closest<HTMLElement>('.track');
    if (track) {
      const trackRect = track.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();
      if (triggerRect.left < trackRect.left + 8) {
        track.scrollLeft += triggerRect.left - trackRect.left - 8;
      } else if (triggerRect.right > trackRect.right - 8) {
        track.scrollLeft += triggerRect.right - trackRect.right + 8;
      }
    }

    if (typeof menu.showPopover === 'function') {
      menu.style.visibility = 'hidden';
      menu.showPopover();
      this.positionMenu();
      menu.style.visibility = '';
    }

    this.menuOpen.set(true);
    if (focusSelected) {
      this.focusOption(this.statuses.indexOf(this.product().status));
    }
    this.document.addEventListener('scroll', this.repositionOnScroll, true);
  }

  private positionMenu(): void {
    const trigger = this.statusTrigger()?.nativeElement;
    const menu = this.statusMenu()?.nativeElement;
    if (!trigger || !menu || typeof menu.showPopover !== 'function' || !menu.matches(':popover-open')) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const viewportWidth = this.document.defaultView?.innerWidth ?? this.document.documentElement.clientWidth;
    const viewportHeight = this.document.defaultView?.innerHeight ?? this.document.documentElement.clientHeight;
    const trackRect = trigger.closest<HTMLElement>('.track')?.getBoundingClientRect();
    if (this.menuOpen() && (rect.bottom < 0 || rect.top > viewportHeight || (trackRect && (rect.right < trackRect.left || rect.left > trackRect.right)))) {
      this.closeMenu();
      return;
    }
    const width = Math.min(rect.width, Math.max(0, viewportWidth - 16));
    menu.style.width = `${width}px`;
    const height = menu.getBoundingClientRect().height;
    const below = rect.bottom + 6;
    const labelTop = trigger.previousElementSibling?.getBoundingClientRect().top ?? rect.top;
    const above = labelTop - height - 6;
    let top = below;
    if (below + height > viewportHeight - 8) {
      top = above >= 8 ? above : Math.max(8, viewportHeight - height - 8);
    }
    menu.style.left = `${Math.min(Math.max(8, rect.left), viewportWidth - width - 8)}px`;
    menu.style.top = `${top}px`;
  }

  private focusOption(index: number): void {
    const options = this.statusMenu()?.nativeElement.querySelectorAll<HTMLElement>('[role="option"]');
    options?.[index]?.focus({ preventScroll: true });
  }
}
