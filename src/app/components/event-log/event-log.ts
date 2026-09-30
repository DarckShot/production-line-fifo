import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import type { LineEvent } from '../../models/line-event.model';

@Component({
  selector: 'app-event-log',
  imports: [DatePipe],
  templateUrl: './event-log.html',
  styleUrl: './event-log.css',
})
export class EventLog {
  readonly events = input.required<readonly LineEvent[]>();
  protected readonly recentEvents = computed(() => this.events().slice(0, 20));
}
