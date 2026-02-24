export class BitArray {
    public readonly rows;
    public readonly cols;
    private _data: Uint8Array;

    constructor(rows: number, cols: number) {
        this.rows = rows;
        this.cols = cols;

        let bytesNeeded = ((rows * cols) + 7) >> 3;
        this._data = new Uint8Array(bytesNeeded);
    }

    get(r: number, c: number): boolean {
        const bitNum = r * this.cols + c;
        const byte = bitNum >> 3;
        const bitIdMask = 1 << (bitNum & 7);

        // Find the specific bit within the byte
        return (this._data[byte]! & bitIdMask) !== 0;
    }


    set(r: number, c: number, value: boolean) {
        const bitNum = r * this.cols + c;
        const byte = bitNum >> 3;
        const bitIdMask = 1 << (bitNum & 7);

        if (value) {
            this._data[byte]! |= bitIdMask;
        } else {
            this._data[byte]! &= ~bitIdMask;
        }

        // console.log(this._data[0]);
    }
}
