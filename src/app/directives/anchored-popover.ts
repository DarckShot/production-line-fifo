import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, ElementRef, inject, input, output } from '@angular/core';
import type { AnchoredPopoverDismissal } from '../models/anchored-popover.model';

@Directive({
  selector: '[appAnchoredPopover]',
})
export class AnchoredPopover {
  readonly origin = input.required<HTMLElement>({ alias: 'appAnchoredPopover' });
  readonly dismissed = output<AnchoredPopoverDismissal>();

  private readonly document = inject(DOCUMENT);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private isOpen = false;
  private readonly onPointerDown = (event: PointerEvent) => {
    const target = event.target as Node | null;
    if (target && !this.origin().contains(target) && !this.element.contains(target)) {
      this.dismissed.emit('outside');
    }
  };
  private readonly onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.dismissed.emit('escape');
    }
  };
  private readonly onViewportChange = () => {
    if (!this.position()) {
      this.dismissed.emit('out-of-view');
    }
  };

  constructor() {
    inject(DestroyRef).onDestroy(() => this.hide());
  }

  show(): boolean {
    if (this.isOpen) {
      return true;
    }
    this.revealOriginInTrack();
    this.element.style.visibility = 'hidden';
    if (typeof this.element.showPopover === 'function') {
      this.element.showPopover();
    } else {
      this.element.style.display = 'grid';
    }
    this.isOpen = true;
    if (!this.position()) {
      this.hide();
      return false;
    }
    this.element.style.visibility = '';
    this.document.addEventListener('pointerdown', this.onPointerDown);
    this.document.addEventListener('keydown', this.onKeydown);
    this.document.addEventListener('scroll', this.onViewportChange, true);
    this.document.defaultView?.addEventListener('resize', this.onViewportChange);
    return true;
  }

  hide(): void {
    if (!this.isOpen) {
      return;
    }
    this.isOpen = false;
    this.document.removeEventListener('pointerdown', this.onPointerDown);
    this.document.removeEventListener('keydown', this.onKeydown);
    this.document.removeEventListener('scroll', this.onViewportChange, true);
    this.document.defaultView?.removeEventListener('resize', this.onViewportChange);
    if (typeof this.element.hidePopover === 'function' && this.element.matches(':popover-open')) {
      this.element.hidePopover();
    }
    this.element.style.display = '';
    this.element.style.visibility = '';
  }

  private revealOriginInTrack(): void {
    const origin = this.origin();
    const track = origin.closest<HTMLElement>('.track');
    if (!track) {
      return;
    }
    const trackRect = track.getBoundingClientRect();
    const rect = origin.getBoundingClientRect();
    if (rect.left < trackRect.left + 8) {
      track.scrollLeft += rect.left - trackRect.left - 8;
    } else if (rect.right > trackRect.right - 8) {
      track.scrollLeft += rect.right - trackRect.right + 8;
    }
  }

  private position(): boolean {
    if (!this.isOpen) {
      return false;
    }
    const origin = this.origin();
    const rect = origin.getBoundingClientRect();
    const viewportWidth =
      this.document.defaultView?.innerWidth ?? this.document.documentElement.clientWidth;
    const viewportHeight =
      this.document.defaultView?.innerHeight ?? this.document.documentElement.clientHeight;
    const trackRect = origin.closest<HTMLElement>('.track')?.getBoundingClientRect();
    if (
      rect.bottom < 0 ||
      rect.top > viewportHeight ||
      (trackRect && (rect.right < trackRect.left || rect.left > trackRect.right))
    ) {
      return false;
    }

    const width = Math.min(rect.width, Math.max(0, viewportWidth - 16));
    this.element.style.width = `${width}px`;
    const height = this.element.getBoundingClientRect().height;
    const below = rect.bottom + 6;
    const labelTop = origin.previousElementSibling?.getBoundingClientRect().top ?? rect.top;
    const above = labelTop - height - 6;
    const top =
      below + height > viewportHeight - 8
        ? above >= 8
          ? above
          : Math.max(8, viewportHeight - height - 8)
        : below;
    this.element.style.left = `${Math.min(Math.max(8, rect.left), viewportWidth - width - 8)}px`;
    this.element.style.top = `${top}px`;
    return true;
  }
}
