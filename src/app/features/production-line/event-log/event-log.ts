import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import type { LineEvent } from '../models/line-event.model';

@Component({
  selector: 'app-event-log',
  imports: [DatePipe],
  template: `
    <section aria-labelledby="event-log-heading">
      <h2 id="event-log-heading">Журнал событий</h2>
      <ol>
        @for (event of events(); track event.id) {
          <li>{{ event.occurredAt | date: 'short' }} — {{ event.productId }}: {{ event.type }}</li>
        } @empty {
          <li>Событий пока нет</li>
        }
      </ol>
    </section>
  `,
})
export class EventLog {
  readonly events = input.required<readonly LineEvent[]>();
}
