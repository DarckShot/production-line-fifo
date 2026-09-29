import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-line-controls',
  template: `
    <section aria-labelledby="line-controls-heading">
      <p class="eyebrow">УПРАВЛЕНИЕ ПОТОКОМ</p>
      <h2 id="line-controls-heading">Следующий такт</h2>
      <p>Продукты сдвинутся к выходу. Крайний продукт покинет линию.</p>
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
    section { height: 100%; padding: 1.25rem; border: 1px solid #d7e4cc; border-radius: 16px; background: #eaf2e0; box-shadow: var(--shadow); }
    .eyebrow { margin: 0 0 .75rem; color: #436942; font-family: ui-monospace, monospace; font-size: .62rem; font-weight: 800; letter-spacing: .09em; }
    h2 { margin: 0; color: #23462e; font-size: 1.25rem; font-weight: 800; letter-spacing: -.04em; line-height: 1.15; }
    section > p:not(.eyebrow) { margin: .5rem 0 1.3rem; color: #4b6650; font-size: .78rem; line-height: 1.45; }
    .control-footer { display: grid; gap: .75rem; }
    .count { display: flex; align-items: center; justify-content: space-between; color: #36593c; font-size: .75rem; font-weight: 750; }
    .count strong { display: inline-grid; place-items: center; min-width: 1.8rem; height: 1.8rem; border: 1px solid #bed3b5; border-radius: 5px; background: #fff; color: #1d5a3b; font-family: ui-monospace, monospace; }
    button { display: flex; align-items: center; justify-content: space-between; width: 100%; min-height: 46px; padding: .6rem .8rem; border: 0; border-radius: 7px; background: #213e2d; color: #fff; font-size: .78rem; font-weight: 800; cursor: pointer; transition: background 160ms, transform 160ms; }
    button:hover:not(:disabled) { background: #315a3e; transform: translateY(-1px); }
    button:focus-visible { outline: 3px solid #176958; outline-offset: 3px; }
    button:disabled { background: #cddbc9; color: #4d6551; cursor: not-allowed; }
    button span { font-size: 1.2rem; line-height: 1; }
    @media (prefers-reduced-motion: reduce) { button { transition: none; } }
  `,
})
export class LineControls {
  readonly productCount = input.required<number>();
  readonly tickRequested = output<void>();
}
