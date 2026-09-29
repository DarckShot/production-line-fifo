import { TestBed } from '@angular/core/testing';
import { ProductionLineStore } from '../production-line-store';
import { ProductionLine } from './production-line';

describe('ProductionLine status selection', () => {
  beforeEach(() => {
    localStorage.clear();
  });

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

  it('animates remaining cards without delaying a tick or changing FIFO order', async () => {
    const originalAnimate = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'animate');
    const animate = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: animate });

    try {
      const fixture = TestBed.createComponent(ProductionLine);
      const store = fixture.debugElement.injector.get(ProductionLineStore);
      for (const id of ['first', 'second', 'third']) {
        store.addProduct({ id, arrivedAt: new Date('2026-01-01T10:00:00Z'), status: 'В очереди' });
      }
      await fixture.whenStable();

      const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('app-line-controls button')!;
      button.click();

      expect(animate).toHaveBeenCalledTimes(2);
      expect(animate.mock.calls[0][0]).toEqual([
        { transform: 'translateX(0)' },
        { transform: 'translateX(1.5rem)', offset: 0.7 },
        { transform: 'translateX(0)' },
      ]);
      expect(store.products().map((product) => product.id)).toEqual(['second', 'third']);
      expect(store.events()[0].type).toBe('removed-on-tick');
    } finally {
      if (originalAnimate) {
        Object.defineProperty(HTMLElement.prototype, 'animate', originalAnimate);
      } else {
        delete (HTMLElement.prototype as Partial<HTMLElement>).animate;
      }
    }
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
