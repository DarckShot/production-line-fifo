import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AnchoredPopover } from './anchored-popover';

@Component({
  imports: [AnchoredPopover],
  template: `
    <div class="track">
      <label for="status-trigger">Статус</label>
      <button id="status-trigger" #origin type="button">Изменить</button>
      <ul [appAnchoredPopover]="origin" popover="manual"></ul>
    </div>
  `,
})
class PopoverHost {}

function rect(x: number, y: number, width: number, height: number): DOMRect {
  return {
    x,
    y,
    width,
    height,
    left: x,
    top: y,
    right: x + width,
    bottom: y + height,
    toJSON: () => ({}),
  } as DOMRect;
}

describe('AnchoredPopover', () => {
  function setup() {
    const fixture = TestBed.createComponent(PopoverHost);
    const element = fixture.nativeElement as HTMLElement;
    const track = element.querySelector<HTMLElement>('.track')!;
    const label = element.querySelector<HTMLElement>('label')!;
    const origin = element.querySelector<HTMLButtonElement>('button')!;
    const menu = element.querySelector<HTMLElement>('ul')!;
    const directive = fixture.debugElement
      .query(By.directive(AnchoredPopover))
      .injector.get(AnchoredPopover);
    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue(rect(0, 0, 800, 300));
    vi.spyOn(label, 'getBoundingClientRect').mockReturnValue(rect(200, 80, 180, 20));
    vi.spyOn(origin, 'getBoundingClientRect').mockReturnValue(rect(200, 100, 180, 30));
    vi.spyOn(menu, 'getBoundingClientRect').mockReturnValue(rect(0, 0, 180, 100));
    return { fixture, track, label, origin, menu, directive };
  }

  afterEach(() => vi.restoreAllMocks());

  it('positions the menu beside its own trigger and ignores inside pointer presses', async () => {
    const { fixture, origin, menu, directive } = setup();
    const dismissed = vi.fn();
    directive.dismissed.subscribe(dismissed);
    await fixture.whenStable();

    expect(directive.show()).toBe(true);
    expect(directive.show()).toBe(true);
    expect(menu.style.width).toBe('180px');
    expect(menu.style.left).toBe('200px');
    expect(menu.style.top).toBe('136px');
    origin.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    menu.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(dismissed).not.toHaveBeenCalled();

    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(dismissed).toHaveBeenCalledExactlyOnceWith('outside');
    directive.hide();
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(dismissed).toHaveBeenCalledTimes(1);
  });

  it('flips above the trigger and clamps to the viewport near its right edge', async () => {
    const { fixture, track, origin, label, menu, directive } = setup();
    vi.mocked(track.getBoundingClientRect).mockReturnValue(rect(0, 0, 1200, 800));
    vi.mocked(origin.getBoundingClientRect).mockReturnValue(rect(980, 710, 180, 30));
    vi.mocked(label.getBoundingClientRect).mockReturnValue(rect(980, 690, 180, 20));
    await fixture.whenStable();

    expect(directive.show()).toBe(true);
    expect(menu.style.left).toBe(`${window.innerWidth - 180 - 8}px`);
    expect(menu.style.top).toBe('584px');
  });

  it('scrolls a clipped trigger into the product track before positioning', async () => {
    const { fixture, track, origin, directive } = setup();
    vi.mocked(track.getBoundingClientRect).mockReturnValue(rect(100, 0, 300, 300));
    vi.mocked(origin.getBoundingClientRect).mockReturnValue(rect(350, 100, 80, 30));
    await fixture.whenStable();

    expect(directive.show()).toBe(true);
    expect(track.scrollLeft).toBe(38);
  });

  it('scrolls back when the trigger is clipped at the entry edge', async () => {
    const { fixture, track, origin, directive } = setup();
    vi.mocked(track.getBoundingClientRect).mockReturnValue(rect(100, 0, 300, 300));
    vi.mocked(origin.getBoundingClientRect).mockReturnValue(rect(95, 100, 80, 30));
    await fixture.whenStable();

    expect(directive.show()).toBe(true);
    expect(track.scrollLeft).toBe(-13);
  });

  it('uses the native popover API when the browser provides it', async () => {
    const { fixture, menu, directive } = setup();
    const showPopover = vi.fn();
    const hidePopover = vi.fn();
    Object.defineProperty(menu, 'showPopover', { configurable: true, value: showPopover });
    Object.defineProperty(menu, 'hidePopover', { configurable: true, value: hidePopover });
    vi.spyOn(menu, 'matches').mockReturnValue(true);
    await fixture.whenStable();

    expect(directive.show()).toBe(true);
    expect(showPopover).toHaveBeenCalledOnce();
    directive.hide();
    expect(hidePopover).toHaveBeenCalledOnce();
  });

  it('dismisses on Escape or when scrolling moves the trigger out of view', async () => {
    const { fixture, origin, directive } = setup();
    const dismissed = vi.fn();
    directive.dismissed.subscribe(dismissed);
    await fixture.whenStable();

    expect(directive.show()).toBe(true);
    const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    document.dispatchEvent(escape);
    expect(escape.defaultPrevented).toBe(true);
    expect(dismissed).toHaveBeenCalledWith('escape');

    vi.mocked(origin.getBoundingClientRect).mockReturnValue(rect(200, -100, 180, 30));
    document.dispatchEvent(new Event('scroll'));
    expect(dismissed).toHaveBeenCalledWith('out-of-view');
  });

  it('refuses to open for an off-screen trigger and removes listeners on destroy', async () => {
    const { fixture, origin, menu, directive } = setup();
    const dismissed = vi.fn();
    directive.dismissed.subscribe(dismissed);
    await fixture.whenStable();
    vi.mocked(origin.getBoundingClientRect).mockReturnValue(rect(200, -100, 180, 30));

    expect(directive.show()).toBe(false);
    expect(menu.style.display).toBe('');
    vi.mocked(origin.getBoundingClientRect).mockReturnValue(rect(200, 100, 180, 30));
    expect(directive.show()).toBe(true);
    fixture.destroy();
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(dismissed).not.toHaveBeenCalled();
  });
});
