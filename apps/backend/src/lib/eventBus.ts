import { EventEmitter } from "node:events";

import type { DomainEventMap, DomainEventName } from "../events/domainEvents";

class TypedEventBus {
  private readonly emitter = new EventEmitter();

  emit<K extends DomainEventName>(event: K, payload: DomainEventMap[K]): void {
    this.emitter.emit(event, payload);
  }

  on<K extends DomainEventName>(
    event: K,
    handler: (payload: DomainEventMap[K]) => void | Promise<void>,
  ): void {
    this.emitter.on(event, (payload: DomainEventMap[K]) => {
      void handler(payload);
    });
  }
}

export const eventBus = new TypedEventBus();
