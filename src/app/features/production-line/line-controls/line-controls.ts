import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-line-controls',
  template: `
    <section aria-labelledby="line-controls-heading">
      <p class="eyebrow">02 / Ритм линии</p>
      <h2 id="line-controls-heading">Управление линией</h2>
      <p>За один такт продукт у выхода покидает линию.</p>
      <div class="control-footer">
        <span class="count">В очереди <strong>{{ productCount() }}</strong></span>
      <button type="button" [disabled]="productCount() === 0" (click)="tickRequested.emit()">
        Следующий такт <span aria-hidden="true">→</span>
      </button>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }
    section { height: 100%; padding: 1.4rem; border: 1px solid #d3dcdf; border-radius: 16px; background: #fff; box-shadow: 0 4px 18px #1b3b4510; }
    .eyebrow { margin: 0 0 .65rem; color: #246c69; font-family: ui-monospace, monospace; font-size: .72rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
    h2 { margin: 0; color: #162e39; font-size: 1.25rem; letter-spacing: -.025em; }
    section > p:not(.eyebrow) { margin: .4rem 0 1.25rem; color: #52656d; font-size: .88rem; line-height: 1.45; }
    .control-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .7rem; }
    .count { color: #52656d; font-size: .8rem; font-weight: 700; }
    .count strong { display: inline-grid; place-items: center; min-width: 1.7rem; height: 1.7rem; margin-left: .3rem; border-radius: 5px; background: #e5efee; color: #125b56; font-family: ui-monospace, monospace; }
    button { display: flex; align-items: center; justify-content: space-between; gap: 1rem; min-height: 44px; padding: .55rem .8rem; border: 0; border-radius: 8px; background: #d5912e; color: #172b39; font-weight: 800; cursor: pointer; }
    button:hover:not(:disabled) { background: #edaa45; }
    button:focus-visible { outline: 3px solid #176e68; outline-offset: 3px; }
    button:disabled { background: #dbe2e2; color: #52656d; cursor: not-allowed; }
    button span { font-size: 1.2rem; line-height: 1; }
    @media (max-width: 900px) and (min-width: 621px) { .control-footer { align-items: flex-start; flex-direction: column; } }
  `,
})
export class LineControls {
  readonly productCount = input.required<number>();
  readonly tickRequested = output<void>();
}
