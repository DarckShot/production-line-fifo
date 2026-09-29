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
    expect(element.textContent).toContain('Датчик отбраковки');
    expect(element.querySelector('.line-route')?.getAttribute('aria-label'))
      .toBe('Направление движения: от датчика входа к датчику отбраковки');
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
    expect(cards[0].querySelector('.status-trigger')?.textContent?.trim()).toBe('Отбракован');
    expect(cards[0].querySelector('time')?.getAttribute('datetime')).toBe('2026-01-01T10:01:00.000Z');
    expect(cards[1].textContent).toContain('oldest');
    expect(cards[1].textContent).toContain('Проверен');
    expect(cards[1].querySelector('.status-trigger')?.textContent?.trim()).toBe('Проверен');
    expect(element.querySelector('[role="status"]')).toBeNull();

    fixture.componentRef.setInput('products', [products[0], { ...products[1], status: 'В очереди' }]);
    await fixture.whenStable();
    expect(cards[0].querySelector('.status-trigger')?.textContent?.trim()).toBe('В очереди');
  });

  it('compacts slots after manual removal without changing product order', async () => {
    const arrivedAt = new Date('2026-01-01T10:00:00Z');
    const oldest: Product = { id: 'oldest', arrivedAt, status: 'В очереди' };
    const middle: Product = { id: 'middle', arrivedAt, status: 'В очереди' };
    const newest: Product = { id: 'newest', arrivedAt, status: 'В очереди' };
    const added: Product = { id: 'added', arrivedAt, status: 'В очереди' };
    const fixture = TestBed.createComponent(ProductQueue);
    const positions = () => [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.products > li')]
      .map((card) => [card.querySelector('h3')?.textContent, card.style.getPropertyValue('--slot')]);

    fixture.componentRef.setInput('products', [oldest, middle, newest]);
    await fixture.whenStable();
    expect(positions()).toEqual([['newest', '0'], ['middle', '1'], ['oldest', '2']]);

    fixture.componentRef.setInput('products', [oldest, newest]);
    await fixture.whenStable();
    expect(positions()).toEqual([['newest', '0'], ['oldest', '1']]);

    fixture.componentRef.setInput('products', [oldest]);
    await fixture.whenStable();
    expect(positions()).toEqual([['oldest', '0']]);

    fixture.componentRef.setInput('products', [oldest, added]);
    await fixture.whenStable();
    expect(positions()).toEqual([['added', '0'], ['oldest', '1']]);
  });
});
