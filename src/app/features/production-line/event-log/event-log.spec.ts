import { TestBed } from '@angular/core/testing';
import type { LineEvent } from '../models/line-event.model';
import { EventLog } from './event-log';

describe('EventLog', () => {
  it('numbers events from the earliest to the latest', async () => {
    const events: LineEvent[] = Array.from({ length: 6 }, (_, index) => ({
      id: String(6 - index),
      type: 'added',
      occurredAt: new Date(`2026-01-01T10:00:0${6 - index}Z`),
      productId: String(6 - index),
      description: `Событие ${6 - index}`,
    }));
    const fixture = TestBed.createComponent(EventLog);
    fixture.componentRef.setInput('events', events);
    await fixture.whenStable();

    const entries = [...(fixture.nativeElement as HTMLElement).querySelectorAll('ol li')];
    expect(entries).toHaveLength(6);
    expect(entries[0].textContent).toContain('Событие 1');
    expect(entries[0].textContent).toContain('ID продукта: 1');
    expect(entries[5].textContent).toContain('Событие 6');
    expect(entries[5].textContent).toContain('Последнее событие');
    expect(entries[0].textContent).not.toContain('Последнее событие');
  });

  it('shows only the 20 newest entries and omits an absent product ID', async () => {
    const events: LineEvent[] = Array.from({ length: 25 }, (_, index) => ({
      id: String(25 - index),
      type: 'added',
      occurredAt: new Date('2026-01-01T10:00:00Z'),
      productId: String(25 - index),
      description: `Событие ${25 - index}`,
    }));
    events[0] = { ...events[0], productId: undefined };
    const fixture = TestBed.createComponent(EventLog);
    fixture.componentRef.setInput('events', events);
    await fixture.whenStable();

    const entries = [...(fixture.nativeElement as HTMLElement).querySelectorAll('ol li')];
    expect(entries).toHaveLength(20);
    expect(entries[0].textContent).toContain('Событие 6');
    expect(entries[19].textContent).toContain('Событие 25');
    expect(entries[19].textContent).not.toContain('ID продукта:');
  });

  it('shows an unnumbered empty state', async () => {
    const fixture = TestBed.createComponent(EventLog);
    fixture.componentRef.setInput('events', []);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('ol')).toBeNull();
    expect(element.textContent).toContain('Событий пока нет');
  });
});
