import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-line-controls',
  templateUrl: './line-controls.html',
  styleUrl: './line-controls.css',
})
export class LineControls {
  readonly productCount = input.required<number>();
  readonly tickRequested = output<void>();
}
