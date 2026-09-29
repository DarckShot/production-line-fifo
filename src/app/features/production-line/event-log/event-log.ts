import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import type { LineEvent } from '../models/line-event.model';

@Component({
  selector: 'app-event-log',
  imports: [DatePipe],
  template: `
    <section aria-labelledby="event-log-heading">
      <h2 id="event-log-heading">Журнал событий</h2>
      @if (chronologicalEvents().length) {
        <ol>
          @for (event of chronologicalEvents(); track event.id) {
            <li>
              <time [attr.datetime]="event.occurredAt.toISOString()">{{ event.occurredAt | date: 'dd.MM.yyyy HH:mm:ss' }}</time>
              — {{ event.description }}
            </li>
          }
        </ol>
      } @else {
        <p>Событий пока нет</p>
      }
    </section>
  `,
})
export class EventLog {
  readonly events = input.required<readonly LineEvent[]>();
  protected readonly chronologicalEvents = computed(() => [...this.events()].reverse());
}
