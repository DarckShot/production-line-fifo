import { TestBed } from '@angular/core/testing';
import { ProductionLineStore } from '../production-line-store';
import { ProductionLine } from './production-line';

describe('ProductionLine status selection', () => {
  it('updates only the chosen product without changing FIFO order', async () => {
    const fixture = TestBed.createComponent(ProductionLine);
    const store = fixture.debugElement.injector.get(ProductionLineStore);
    const arrivedAt = new Date('2026-01-01T10:00:00Z');
    store.addProduct({ id: 'first', arrivedAt, status: 'В очереди' });
    store.addProduct({ id: 'second', arrivedAt, status: 'В очереди' });
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const cards = [...element.querySelectorAll('app-product-card')];
    const select = cards[0].querySelector<HTMLSelectElement>('select')!;
    expect(cards[0].querySelector('h3')?.textContent).toBe('second');
    expect([...select.options].map((option) => option.value)).toEqual([
      'В очереди',
      'Проверен',
      'Отбракован',
    ]);

    select.value = 'Проверен';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await fixture.whenStable();

    expect(store.products().map((product) => [product.id, product.status])).toEqual([
      ['first', 'В очереди'],
      ['second', 'Проверен'],
    ]);
    expect(cards[0].querySelector('.status')?.textContent).toContain('Проверен');
    expect(select.value).toBe('Проверен');
    expect(cards[1].querySelector('.status')?.textContent).toContain('В очереди');
  });
});
