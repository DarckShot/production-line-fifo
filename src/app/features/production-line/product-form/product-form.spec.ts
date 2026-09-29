import { TestBed } from '@angular/core/testing';
import { ProductForm } from './product-form';
import { ProductionLineStore } from '../production-line-store';

describe('ProductForm', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProductForm],
      providers: [ProductionLineStore],
    });
  });

  function setup() {
    const fixture = TestBed.createComponent(ProductForm);
    const store = TestBed.inject(ProductionLineStore);
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector<HTMLInputElement>('#product-id')!;
    const form = element.querySelector<HTMLFormElement>('form')!;
    return { fixture, store, element, input, form };
  }

  function enterId(input: HTMLInputElement, value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  it('adds a trimmed ID at the end with current time and default status, then clears the form', async () => {
    const { fixture, store, input, form } = setup();
    await fixture.whenStable();
    const earliestArrival = Date.now();

    enterId(input, '  A-1  ');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();

    expect(store.products()).toHaveLength(1);
    expect(store.products()[0].id).toBe('A-1');
    expect(store.products()[0].status).toBe('В очереди');
    expect(store.products()[0].arrivedAt.getTime()).toBeGreaterThanOrEqual(earliestArrival);
    expect(store.products()[0].arrivedAt.getTime()).toBeLessThanOrEqual(Date.now());
    expect(input.value).toBe('');
  });

  it('shows an error and does not add an empty ID', async () => {
    const { fixture, store, element, form } = setup();
    await fixture.whenStable();

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();

    expect(store.products()).toHaveLength(0);
    expect(element.querySelector('#product-id-error')?.textContent).toContain('Введите ID');
  });

  it('shows an error and keeps the field value for a duplicate ID', async () => {
    const { fixture, store, element, input, form } = setup();
    store.addProduct({ id: 'A-1', arrivedAt: new Date(), status: 'В очереди' });
    await fixture.whenStable();

    enterId(input, ' A-1 ');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();

    expect(store.products()).toHaveLength(1);
    expect(input.value).toBe(' A-1 ');
    expect(element.querySelector('#product-id-error')?.textContent).toContain('уже есть');
  });
});
