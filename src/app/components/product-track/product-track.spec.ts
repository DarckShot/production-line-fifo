import { TestBed } from '@angular/core/testing';
import type { Product } from '../../models/product.model';
import { ProductTrack } from './product-track';

describe('ProductTrack', () => {
  const arrivedAt = new Date('2026-01-01T10:00:00Z');
  const product = (id: string): Product => ({ id, arrivedAt, status: 'В очереди' });

  afterEach(() => vi.unstubAllGlobals());

  it('renders the empty state, then the newest product at the entry', async () => {
    const fixture = TestBed.createComponent(ProductTrack);
    fixture.componentRef.setInput('products', []);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const track = element.querySelector<HTMLElement>('.track')!;
    const buttons = [...element.querySelectorAll<HTMLButtonElement>('.track-navigation button')];
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Очередь пуста');
    expect(track.hasAttribute('tabindex')).toBe(false);
    expect(buttons.every((button) => button.disabled)).toBe(true);

    fixture.componentRef.setInput('products', [product('first'), product('second')]);
    await fixture.whenStable();
    expect(element.querySelector('[role="status"]')).toBeNull();
    expect(track.tabIndex).toBe(0);
    expect(buttons.every((button) => !button.disabled)).toBe(true);
    expect(
      [...element.querySelectorAll('app-product-card h3')].map((item) => item.textContent),
    ).toEqual(['second', 'first']);
  });

  it('scrolls to the selected sensor without changing the queue', async () => {
    const fixture = TestBed.createComponent(ProductTrack);
    const element = fixture.nativeElement as HTMLElement;
    const track = element.querySelector<HTMLElement>('.track')!;
    const scrollTo = vi.fn();
    Object.defineProperty(track, 'scrollTo', { configurable: true, value: scrollTo });
    Object.defineProperty(track, 'scrollWidth', { configurable: true, value: 1200 });
    fixture.componentRef.setInput('products', [product('first'), product('second')]);
    await fixture.whenStable();
    scrollTo.mockClear();

    const buttons = element.querySelectorAll<HTMLButtonElement>('.track-navigation button');
    buttons[1].click();
    expect(scrollTo).toHaveBeenCalledWith({ left: 1200, behavior: 'smooth' });
    buttons[0].click();
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: 'smooth' });
    expect(fixture.componentInstance.products().map((item) => item.id)).toEqual([
      'first',
      'second',
    ]);
  });

  it('uses immediate scrolling when reduced motion is requested', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true })),
    );
    const fixture = TestBed.createComponent(ProductTrack);
    const element = fixture.nativeElement as HTMLElement;
    const track = element.querySelector<HTMLElement>('.track')!;
    const scrollTo = vi.fn();
    Object.defineProperty(track, 'scrollTo', { configurable: true, value: scrollTo });
    fixture.componentRef.setInput('products', [product('first')]);
    await fixture.whenStable();

    element.querySelector<HTMLButtonElement>('.track-navigation button')!.click();
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: 'auto' });
  });

  it('forwards the selected product ID and status without mutating its input', async () => {
    const fixture = TestBed.createComponent(ProductTrack);
    const products = [product('first'), product('second')];
    fixture.componentRef.setInput('products', products);
    const statusChanged = vi.fn();
    const removed = vi.fn();
    fixture.componentInstance.statusChanged.subscribe(statusChanged);
    fixture.componentInstance.removed.subscribe(removed);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const newest = element.querySelector('app-product-card')!;
    newest.querySelector<HTMLButtonElement>('.status-trigger')!.click();
    await fixture.whenStable();
    newest.querySelectorAll<HTMLElement>('[role="option"]')[1].click();
    newest.querySelector<HTMLButtonElement>('.remove-button')!.click();

    expect(statusChanged).toHaveBeenCalledExactlyOnceWith({ id: 'second', status: 'Проверен' });
    expect(removed).toHaveBeenCalledExactlyOnceWith('second');
    expect(products.map((item) => item.status)).toEqual(['В очереди', 'В очереди']);
  });
});
