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

  it('removes the selected product and keeps the others in FIFO order', async () => {
    const fixture = TestBed.createComponent(ProductionLine);
    const store = fixture.debugElement.injector.get(ProductionLineStore);
    const arrivedAt = new Date('2026-01-01T10:00:00Z');
    for (const id of ['first', 'middle', 'last']) {
      store.addProduct({ id, arrivedAt, status: 'В очереди' });
    }
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const removeButton = element.querySelector<HTMLButtonElement>(
      'button[aria-label="Удалить продукт middle"]',
    )!;
    removeButton.click();
    await fixture.whenStable();

    expect(store.products().map((product) => product.id)).toEqual(['first', 'last']);
    expect([...element.querySelectorAll('app-product-card h3')].map((heading) => heading.textContent)).toEqual([
      'last',
      'first',
    ]);
    expect(element.querySelector('button[aria-label="Удалить продукт middle"]')).toBeNull();
    expect(element.textContent).toContain('Продуктов: 2');
  });

  it('advances products toward the exit and removes the oldest on each click', async () => {
    const fixture = TestBed.createComponent(ProductionLine);
    const store = fixture.debugElement.injector.get(ProductionLineStore);
    const arrivedAt = new Date('2026-01-01T10:00:00Z');
    const element = fixture.nativeElement as HTMLElement;
    const tickButton = element.querySelector<HTMLButtonElement>('app-line-controls button')!;
    await fixture.whenStable();
    expect(tickButton.disabled).toBe(true);

    for (const id of ['first', 'second', 'third']) {
      store.addProduct({ id, arrivedAt, status: 'В очереди' });
    }
    await fixture.whenStable();
    expect(tickButton.disabled).toBe(false);

    tickButton.click();
    await fixture.whenStable();
    expect(store.products().map((product) => product.id)).toEqual(['second', 'third']);
    expect([...element.querySelectorAll('app-product-card h3')].map((heading) => heading.textContent)).toEqual([
      'third',
      'second',
    ]);

    tickButton.click();
    tickButton.click();
    await fixture.whenStable();
    expect(store.products()).toEqual([]);
    expect(tickButton.disabled).toBe(true);
    expect(element.textContent).toContain('Очередь пуста');
  });

  it('renders a new journal entry after a product is added', async () => {
    const fixture = TestBed.createComponent(ProductionLine);
    const store = fixture.debugElement.injector.get(ProductionLineStore);
    store.addProduct({ id: 'journal-product', arrivedAt: new Date(), status: 'В очереди' });
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const entry = element.querySelector('app-event-log li');
    expect(entry?.textContent).toContain('Добавлен в очередь');
    expect(entry?.textContent).toContain('ID продукта: journal-product');
    expect(entry?.querySelector('time')?.getAttribute('datetime')).toBe(
      store.events()[0].occurredAt.toISOString(),
    );
  });
});
