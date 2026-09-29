import { TestBed } from '@angular/core/testing';
import type { Product } from '../models/product.model';
import { ProductQueue } from './product-queue';

describe('ProductQueue', () => {
  it('shows both sensors and the empty queue state', async () => {
    const fixture = TestBed.createComponent(ProductQueue);
    fixture.componentRef.setInput('products', []);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Датчик входа');
    expect(element.textContent).toContain('Датчик отбраковки / выход');
    expect(element.querySelector('.direction-arrow')?.textContent).toBe('→');
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Очередь пуста');
  });

  it('places the newest product at the entry and the oldest at the exit', async () => {
    const products: Product[] = [
      { id: 'oldest', arrivedAt: new Date('2026-01-01T10:00:00Z'), status: 'Проверен' },
      { id: 'newest', arrivedAt: new Date('2026-01-01T10:01:00Z'), status: 'Отбракован' },
    ];
    const fixture = TestBed.createComponent(ProductQueue);
    fixture.componentRef.setInput('products', products);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const cards = [...element.querySelectorAll('app-product-card')];
    expect(cards).toHaveLength(2);
    expect(cards[0].textContent).toContain('newest');
    expect(cards[0].textContent).toContain('Отбракован');
    expect(cards[0].querySelector('time')?.getAttribute('datetime')).toBe('2026-01-01T10:01:00.000Z');
    expect(cards[1].textContent).toContain('oldest');
    expect(cards[1].textContent).toContain('Проверен');
    expect(element.querySelector('[role="status"]')).toBeNull();
  });
});
