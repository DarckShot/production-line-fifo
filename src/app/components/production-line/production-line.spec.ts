import { TestBed } from '@angular/core/testing';
import { ProductionLineStore } from '../../services/production-line-store';
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
    const trigger = cards[0].querySelector<HTMLButtonElement>('.status-trigger')!;
    const options = [...cards[0].querySelectorAll<HTMLElement>('[role="option"]')];
    expect(cards[0].querySelector('h3')?.textContent).toBe('second');
    expect(options.map((option) => option.textContent?.trim())).toEqual([
      'В очереди',
      'Проверен',
      'Отбракован',
    ]);

    trigger.click();
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    options[1].click();
    await fixture.whenStable();

    expect(store.products().map((product) => [product.id, product.status])).toEqual([
      ['first', 'В очереди'],
      ['second', 'Проверен'],
    ]);
    expect(cards[0].querySelector('.status')?.textContent).toContain('Проверен');
    expect(trigger.textContent).toContain('Проверен');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(cards[1].querySelector('.status')?.textContent).toContain('В очереди');
  });

  it('opens the status menu for the chosen card and closes it on a second click', async () => {
    const fixture = TestBed.createComponent(ProductionLine);
    const store = fixture.debugElement.injector.get(ProductionLineStore);
    for (const id of ['first', 'middle', 'last']) {
      store.addProduct({ id, arrivedAt: new Date('2026-01-01T10:00:00Z'), status: 'В очереди' });
    }
    await fixture.whenStable();

    const cards = [...(fixture.nativeElement as HTMLElement).querySelectorAll('app-product-card')];
    const middleCard = cards[1];
    const trigger = middleCard.querySelector<HTMLButtonElement>('.status-trigger')!;
    expect(middleCard.querySelector('h3')?.textContent).toBe('middle');
    expect(middleCard.querySelector('[role="listbox"]')).not.toBeNull();

    trigger.click();
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(cards[0].querySelector('.status-trigger')?.getAttribute('aria-expanded')).toBe('false');

    trigger.click();
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(store.products().map((product) => product.status)).toEqual([
      'В очереди',
      'В очереди',
      'В очереди',
    ]);
  });

  it('closes the open status menu on Escape and returns focus to its trigger', async () => {
    const fixture = TestBed.createComponent(ProductionLine);
    const store = fixture.debugElement.injector.get(ProductionLineStore);
    store.addProduct({ id: 'first', arrivedAt: new Date(), status: 'В очереди' });
    await fixture.whenStable();

    const trigger = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.status-trigger',
    )!;
    const menu = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.status-menu')!;
    expect(trigger.getAttribute('aria-controls')).toBe(menu.id);

    trigger.click();
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
  });

  it('closes one product menu when another product menu is opened', async () => {
    const fixture = TestBed.createComponent(ProductionLine);
    const store = fixture.debugElement.injector.get(ProductionLineStore);
    for (const id of ['first', 'second']) {
      store.addProduct({ id, arrivedAt: new Date(), status: 'В очереди' });
    }
    await fixture.whenStable();

    const triggers = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
        '.status-trigger',
      ),
    ];
    triggers[0].click();
    await fixture.whenStable();
    triggers[1].dispatchEvent(new Event('pointerdown', { bubbles: true }));
    triggers[1].click();
    await fixture.whenStable();

    expect(triggers.map((trigger) => trigger.getAttribute('aria-expanded'))).toEqual([
      'false',
      'true',
    ]);
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
    expect(
      [...element.querySelectorAll('app-product-card h3')].map((heading) => heading.textContent),
    ).toEqual(['last', 'first']);
    expect(element.querySelector('button[aria-label="Удалить продукт middle"]')).toBeNull();
    expect(element.textContent).toContain('Продуктов: 2');
    expect(
      [...element.querySelectorAll<HTMLElement>('.products > li')].map((card) =>
        card.style.getPropertyValue('--slot'),
      ),
    ).toEqual(['0', '1']);
  });

  it('closes the entry gap when a product is manually removed after a tick', async () => {
    const fixture = TestBed.createComponent(ProductionLine);
    const store = fixture.debugElement.injector.get(ProductionLineStore);
    const arrivedAt = new Date('2026-01-01T10:00:00Z');
    for (const id of ['first', 'second', 'third']) {
      store.addProduct({ id, arrivedAt, status: 'В очереди' });
    }
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const slots = () =>
      [...element.querySelectorAll<HTMLElement>('.products > li')].map((card) => [
        card.querySelector('h3')?.textContent,
        card.style.getPropertyValue('--slot'),
      ]);
    element.querySelector<HTMLButtonElement>('app-line-controls button')!.click();
    await fixture.whenStable();
    expect(slots()).toEqual([
      ['third', '1'],
      ['second', '2'],
    ]);

    element.querySelector<HTMLButtonElement>('button[aria-label="Удалить продукт third"]')!.click();
    await fixture.whenStable();
    expect(store.products().map((product) => product.id)).toEqual(['second']);
    expect(slots()).toEqual([['second', '0']]);
    expect(store.events()[0].type).toBe('removed-manually');
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
    expect(
      [...element.querySelectorAll('app-product-card h3')].map((heading) => heading.textContent),
    ).toEqual(['third', 'second']);

    tickButton.click();
    tickButton.click();
    await fixture.whenStable();
    expect(store.products()).toEqual([]);
    expect(tickButton.disabled).toBe(true);
    expect(element.textContent).toContain('Очередь пуста');
  });

  it('moves each surviving card toward the exit, then closes the entry gap', async () => {
    const fixture = TestBed.createComponent(ProductionLine);
    const store = fixture.debugElement.injector.get(ProductionLineStore);
    const arrivedAt = new Date('2026-01-01T10:00:00Z');
    for (const id of ['first', 'second', 'third']) {
      store.addProduct({ id, arrivedAt, status: 'В очереди' });
    }
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const slots = () =>
      [...element.querySelectorAll<HTMLElement>('.products > li')].map((card) => [
        card.querySelector('h3')?.textContent,
        card.style.getPropertyValue('--slot'),
      ]);
    expect(slots()).toEqual([
      ['third', '0'],
      ['second', '1'],
      ['first', '2'],
    ]);

    element.querySelector<HTMLButtonElement>('app-line-controls button')!.click();
    expect(store.products().map((product) => product.id)).toEqual(['second', 'third']);
    await fixture.whenStable();
    expect(slots()).toEqual([
      ['third', '1'],
      ['second', '2'],
    ]);
    expect(store.events()[0].type).toBe('removed-on-tick');

    await new Promise((resolve) => setTimeout(resolve, 520));
    await fixture.whenStable();
    expect(slots()).toEqual([
      ['third', '0'],
      ['second', '1'],
    ]);

    store.addProduct({ id: 'fourth', arrivedAt, status: 'В очереди' });
    await fixture.whenStable();
    expect(slots()).toEqual([
      ['fourth', '0'],
      ['third', '1'],
      ['second', '2'],
    ]);

    element.querySelector<HTMLButtonElement>('app-line-controls button')!.click();
    await fixture.whenStable();
    expect(store.products().map((product) => product.id)).toEqual(['third', 'fourth']);
    expect(slots()).toEqual([
      ['fourth', '1'],
      ['third', '2'],
    ]);

    await new Promise((resolve) => setTimeout(resolve, 520));
    await fixture.whenStable();
    expect(slots()).toEqual([
      ['fourth', '0'],
      ['third', '1'],
    ]);
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
