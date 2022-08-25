import { Connection } from "mysql2";
import { Event, EventEmitter } from "vscode";

class Store<T> {
  private emitter: EventEmitter<T>;
  current: T | undefined;

  event: Event<T>;

  constructor(defaultValue?: T) {
    this.current = defaultValue;
    this.emitter = new EventEmitter();
    this.event = this.emitter.event;
  }

  fire(data: T) {
    this.current = data;

    this.emitter.fire(data);
  }

  dispose() {
    this.emitter.dispose();
  }
}

const connectedConnection$ = new Store<Connection | undefined | void>();

export { connectedConnection$ };
