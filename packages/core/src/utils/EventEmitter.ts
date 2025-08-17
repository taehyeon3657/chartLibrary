export type EventListener<T = any> = (data: T, event?: Event) => void;

export class EventEmitter<T extends Record<string, any> = {}> {
    private events: Map<keyof T, EventListener[]> = new Map();

    public on<K extends keyof T>(event: K, listener: EventListener<T[K]>): this {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event)?.push(listener);
        return this;
    }

    public off<K extends keyof T>(event: K, listener?: EventListener<T[K]>): this {
        if (!this.events.has(event)) return this;

        if (listener) {
            const listeners = this.events.get(event);
            if (listeners) {
                this.events.set(event, listeners.filter(l => l !== listener));
            }
        } else {
            this.events.delete(event);
        }
        return this;
    }

    public emit<K extends keyof T>(event: K, data: T[K], originalEvent?: Event): this {
        if (!this.events.has(event)) return this;

        const listeners = this.events.get(event)!;
        listeners.forEach(listener => listener(data, originalEvent));

        return this;
    }

    public removeAllListeners(): this {
        this.events.clear();
        return this;
    }
}