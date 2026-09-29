import { Component } from '@angular/core';

@Component({
  selector: 'app-line-controls',
  template: `
    <section aria-labelledby="line-controls-heading">
      <h2 id="line-controls-heading">Управление линией</h2>
      <button type="button" disabled>Следующий такт</button>
    </section>
  `,
})
export class LineControls {}
