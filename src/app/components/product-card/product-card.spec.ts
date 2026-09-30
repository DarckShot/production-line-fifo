import { TestBed } from '@angular/core/testing';
import type { Product, ProductStatus } from '../../models/product.model';
import { ProductCard } from './product-card';

describe('ProductCard', () => {
  const arrivedAt = new Date('2026-01-01T10:01:00Z');
  const product: Product = { id: 'PRD-42', arrivedAt, status: 'В очереди' };

  it.each([
    ['В очереди', false, false],
    ['Проверен', true, false],
    ['Отбракован', false, true],
  ] as const)('renders the %s status with its visual state', async (status, checked, rejected) => {
    const fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('product', { ...product, status });
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h3')?.textContent).toBe('PRD-42');
    expect(element.querySelector('time')?.getAttribute('datetime')).toBe(arrivedAt.toISOString());
    expect(element.querySelector('.status')?.textContent).toContain(status);
    expect(element.querySelector('article')?.classList.contains('card--checked')).toBe(checked);
    expect(element.querySelector('article')?.classList.contains('card--rejected')).toBe(rejected);
  });

  it('emits a status selection and a removal request for its product', async () => {
    const fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('product', product);
    const statusChanged = vi.fn<(status: ProductStatus) => void>();
    const removed = vi.fn();
    fixture.componentInstance.statusChanged.subscribe(statusChanged);
    fixture.componentInstance.removed.subscribe(removed);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('.status-trigger')!.click();
    await fixture.whenStable();
    element.querySelectorAll<HTMLElement>('[role="option"]')[1].click();
    await fixture.whenStable();
    expect(statusChanged).toHaveBeenCalledExactlyOnceWith('Проверен');

    const remove = element.querySelector<HTMLButtonElement>('.remove-button')!;
    expect(remove.getAttribute('aria-label')).toBe('Удалить продукт PRD-42');
    remove.click();
    expect(removed).toHaveBeenCalledTimes(1);
  });
});
