import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-line-controls',
  template: `
    <section aria-labelledby="line-controls-heading">
      <h2 id="line-controls-heading">Управление линией</h2>
      <p>За один такт продукт у выхода покидает линию.</p>
      <button type="button" [disabled]="productCount() === 0" (click)="tickRequested.emit()">
        Следующий такт
      </button>
    </section>
  `,
  styles: `
    :host { display: block; }
    section { height: 100%; box-sizing: border-box; padding: 1rem; border: 1px solid #cbd5e1; border-radius: 12px; background: #fff; }
    h2 { margin: 0; color: #0f172a; font-size: 1.15rem; }
    p { margin: .5rem 0 1rem; color: #334155; line-height: 1.5; }
    button { min-height: 44px; padding: .55rem 1rem; border: 0; border-radius: 8px; background: #0f766e; color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
    button:hover:not(:disabled) { background: #115e59; }
    button:focus-visible { outline: 3px solid #0f766e; outline-offset: 3px; }
    button:disabled { background: #64748b; cursor: not-allowed; }
  `,
})
export class LineControls {
  readonly productCount = input.required<number>();
  readonly tickRequested = output<void>();
}
