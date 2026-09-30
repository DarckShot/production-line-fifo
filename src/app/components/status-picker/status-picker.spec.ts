import { TestBed } from '@angular/core/testing';
import type { ProductStatus } from '../../models/product.model';
import { StatusPicker } from './status-picker';

describe('StatusPicker', () => {
  afterEach(() => vi.restoreAllMocks());

  function setup(status: ProductStatus = 'В очереди') {
    const fixture = TestBed.createComponent(StatusPicker);
    fixture.componentRef.setInput('productId', 'PRD-1');
    fixture.componentRef.setInput('status', status);
    const element = fixture.nativeElement as HTMLElement;
    const trigger = element.querySelector<HTMLButtonElement>('.status-trigger')!;
    const menu = element.querySelector<HTMLElement>('[role="listbox"]')!;
    const options = () => [...menu.querySelectorAll<HTMLElement>('[role="option"]')];
    return { fixture, element, trigger, menu, options };
  }

  it('opens its own menu and closes it when the trigger is clicked again', async () => {
    const { fixture, trigger, menu, options } = setup('Проверен');
    await fixture.whenStable();

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBe(menu.id);
    expect(menu.getAttribute('aria-label')).toContain('PRD-1');
    expect(options().map((option) => option.textContent?.trim())).toEqual([
      'В очереди',
      'Проверен',
      'Отбракован',
    ]);
    expect(options().map((option) => option.getAttribute('aria-selected'))).toEqual([
      'false',
      'true',
      'false',
    ]);

    trigger.click();
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    trigger.click();
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('emits only a changed status and returns focus to the trigger', async () => {
    const { fixture, trigger, options } = setup();
    const changed = vi.fn();
    fixture.componentInstance.statusChanged.subscribe(changed);
    await fixture.whenStable();

    trigger.click();
    options()[0].click();
    await fixture.whenStable();
    expect(changed).not.toHaveBeenCalled();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    trigger.click();
    options()[2].click();
    await fixture.whenStable();
    expect(changed).toHaveBeenCalledExactlyOnceWith('Отбракован');
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('supports Arrow, Home, End and Enter keyboard selection', async () => {
    const { fixture, trigger, menu, options } = setup('Проверен');
    const changed = vi.fn();
    fixture.componentInstance.statusChanged.subscribe(changed);
    await fixture.whenStable();

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(options()[1]);

    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(document.activeElement).toBe(options()[2]);
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(options()[0]);
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(document.activeElement).toBe(options()[2]);
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(document.activeElement).toBe(options()[0]);
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await fixture.whenStable();

    expect(changed).toHaveBeenCalledExactlyOnceWith('Отбракован');
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('supports opening with ArrowUp and choosing an option with Space', async () => {
    const { fixture, trigger, menu, options } = setup();
    const changed = vi.fn();
    fixture.componentInstance.statusChanged.subscribe(changed);
    await fixture.whenStable();

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(document.activeElement).toBe(options()[0]);
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(document.activeElement).toBe(options()[2]);
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
    await fixture.whenStable();

    expect(changed).toHaveBeenCalledExactlyOnceWith('Отбракован');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('moves from the current status when Arrow keys are pressed on an open trigger', async () => {
    const { fixture, trigger, options } = setup('Проверен');
    await fixture.whenStable();

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', bubbles: true }));
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    trigger.click();
    await fixture.whenStable();

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(options()[2]);
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(document.activeElement).toBe(options()[0]);
  });

  it('does not open a menu whose trigger is outside the viewport', async () => {
    const { fixture, trigger } = setup();
    await fixture.whenStable();
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      top: -100,
      bottom: -70,
      left: 0,
      right: 100,
      width: 100,
      height: 30,
    } as DOMRect);

    trigger.click();
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes on Escape with focus restoration and on Tab without trapping focus', async () => {
    const { fixture, trigger, menu } = setup();
    await fixture.whenStable();

    trigger.click();
    await fixture.whenStable();
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);

    trigger.click();
    await fixture.whenStable();
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    menu.dispatchEvent(tab);
    await fixture.whenStable();
    expect(tab.defaultPrevented).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('dismisses on a pointer press outside the menu', async () => {
    const { fixture, trigger, menu } = setup();
    await fixture.whenStable();
    trigger.click();
    await fixture.whenStable();

    menu.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('assigns distinct trigger and menu IDs to different product instances', async () => {
    const first = setup();
    const second = setup();
    await Promise.all([first.fixture.whenStable(), second.fixture.whenStable()]);

    expect(first.trigger.id).not.toBe(second.trigger.id);
    expect(first.menu.id).not.toBe(second.menu.id);
    expect(first.trigger.getAttribute('aria-controls')).toBe(first.menu.id);
    expect(second.trigger.getAttribute('aria-controls')).toBe(second.menu.id);
  });
});
