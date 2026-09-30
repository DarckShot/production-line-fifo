import { TestBed } from '@angular/core/testing';
import { LineControls } from './line-controls';

describe('LineControls', () => {
  it('disables the next tick when the queue is empty', async () => {
    const fixture = TestBed.createComponent(LineControls);
    fixture.componentRef.setInput('productCount', 0);
    const tickRequested = vi.fn();
    fixture.componentInstance.tickRequested.subscribe(tickRequested);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const button = element.querySelector<HTMLButtonElement>('button')!;
    expect(element.querySelector('.count')?.textContent).toContain('0');
    expect(button.disabled).toBe(true);
    button.click();
    expect(tickRequested).not.toHaveBeenCalled();
  });

  it('enables the control and emits one tick request per click', async () => {
    const fixture = TestBed.createComponent(LineControls);
    fixture.componentRef.setInput('productCount', 2);
    const tickRequested = vi.fn();
    fixture.componentInstance.tickRequested.subscribe(tickRequested);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const button = element.querySelector<HTMLButtonElement>('button')!;
    expect(element.querySelector('.count')?.textContent).toContain('2');
    expect(button.disabled).toBe(false);

    button.click();
    button.click();
    expect(tickRequested).toHaveBeenCalledTimes(2);

    fixture.componentRef.setInput('productCount', 0);
    await fixture.whenStable();
    expect(button.disabled).toBe(true);
  });
});
