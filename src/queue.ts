export class Queue<T> {
    private static readonly _RESIZE_THRESHOLD = 1000

    private items: Maybe<T>[];
    private headIndex: number;

    public enqueue(item: T) {
        this.items.push(item);
    }

    public dequeue(): Maybe<T> {
        if (this.isEmpty()) return undefined;

        const item = this.items[this.headIndex];
        this.headIndex++;

        if (this.headIndex > Queue._RESIZE_THRESHOLD && this.items.length > 2 * this.headIndex) {
            this.items = this.items.slice(this.headIndex);
            this.headIndex = 0;
        }
        return item;
    }

    public getLength() { return this.items.length - this.headIndex; }

    public isEmpty() {
        return this.getLength() === 0;
    }

    constructor() {
        this.items = new Array();
        this.headIndex = 0;
    }
}
