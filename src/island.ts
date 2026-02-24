import { Queue } from "./queue.js";

export function generate2DArray<T>(rows: number, cols: number, fill: T): T[][] {
    if (!Number.isInteger(rows) || !Number.isInteger(cols)) {
        throw new Error("rows and cols should be integers");
    }

    return Array.from({ length: rows },
        () => Array.from({ length: cols }, () => fill)
    );
}

export class Island {
    readonly rows: number;
    readonly cols: number;
    readonly rep: string;
    private _data: boolean[][];

    private static _generateIslandDataFromString(rep: string, rows: number, cols: number): boolean[][] {
        let island: boolean[][] = generate2DArray(rows, cols, false);

        for (const numS of rep.split(" ")) {
            let num = parseInt(numS);

            let row: number = Math.trunc(num / cols);
            let col = num % cols;

            island[row]![col] = true;
        }

        return island;
    }

    private static _getStringRepFromData(data: boolean[][], rows: number, cols: number) {
        let stringRep = "";

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (data[i]![j]) {
                    stringRep += (i * cols) + j;
                    stringRep += " ";
                }
            }
        }

        return stringRep.slice(0, stringRep.length - 1);
    }

    private static _generateRandomIslandData(rows: number, cols: number): boolean[][] {
        let island: boolean[][] = generate2DArray(rows, cols, false);

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                island[i]![j] = Math.random() < 0.5;
            }
        }

        return island;
    }

    public get(row: number, col: number): boolean {
        return this._data[row]![col]!;
    }

    public displayAsGrid() {
        let toLog: string = "";

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                toLog += this.get(i, j) ? "█" : " ";
            }

            console.log(toLog);
            toLog = "";
        }
    }

    private _getNumIslandsDFS(row: number, col: number, state: boolean[][]): boolean {
        if (row >= this.rows) return false;
        if (row < 0) return false;
        if (col >= this.cols) return false;
        if (col < 0) return false;

        if (!this.get(row, col)) return false;

        if (state[row]![col]) return false;

        state[row]![col] = true;

        this._getNumIslandsDFS(row + 1, col, state);
        this._getNumIslandsDFS(row - 1, col, state);
        this._getNumIslandsDFS(row, col + 1, state);
        this._getNumIslandsDFS(row, col - 1, state);

        return true;
    }

    private _getNumIslandsBFS(row: number, col: number, state: boolean[][]): boolean {
        if (!this.get(row, col) || state[row]![col]) return false;

        const queue: Queue<[number, number]> = new Queue();

        state[row]![col] = true;
        queue.enqueue([row, col]);

        while (!queue.isEmpty()) {
            const [r, c] = queue.dequeue()!;

            if (r > 0 && this.get(r - 1, c) && !state[r - 1]![c]) {
                state[r - 1]![c] = true;
                queue.enqueue([r - 1, c]);
            }

            if (r < this.rows - 1 && this.get(r + 1, c) && !state[r + 1]![c]) {
                state[r + 1]![c] = true;
                queue.enqueue([r + 1, c]);
            }

            if (c > 0 && this.get(r, c - 1) && !state[r]![c - 1]) {
                state[r]![c - 1] = true;
                queue.enqueue([r, c - 1]);
            }

            if (c < this.cols - 1 && this.get(r, c + 1) && !state[r]![c + 1]) {
                state[r]![c + 1] = true;
                queue.enqueue([r, c + 1]);
            }
        }

        return true;
    }

    private _getNumIslandsGPT(row: number, col: number, state: boolean[][]): boolean {
        if (!this.get(row, col) || state[row]![col]) return false;

        const stack: [number, number][] = []
        stack.push([row, col]);

        while (stack.length > 0) {
            const [r, c] = stack.pop()!;

            let l = c;
            while (l > 0 && this.get(r, l - 1)) l--;

            let scanningBelow = false;
            let scanningAbove = false;

            for (; l < this.cols; l++) {
                if (!this.get(r, l) || state[r]![l]) break;

                state[r]![l] = true;

                if (r > 0) {
                    if (!scanningAbove && this.get(r - 1, l) && !state[r - 1]![l]) {
                        stack.push([r - 1, l]);
                        scanningAbove = true;
                    } else if (scanningAbove && !this.get(r - 1, l)) {
                        scanningAbove = false;
                    }
                }

                if (r < this.rows - 1) {
                    if (!scanningBelow && this.get(r + 1, l) && !state[r + 1]![l]) {
                        stack.push([r + 1, l]);
                        scanningBelow = true;
                    } else if (scanningBelow && !this.get(r + 1, l)) {
                        scanningBelow = false;
                    }
                }
            }
        }

        return true;
    }

    private _getNumIslands(searchMethod: (a: number, b: number, c: boolean[][]) => boolean): number {
        const state = generate2DArray(this.rows, this.cols, false);
        let numIslands = 0;

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (searchMethod.bind(this)(i, j, state)) numIslands++;
            }
        }

        return numIslands;
    }

    public getNumIslandsDFS(): number {
        return this._getNumIslands(this._getNumIslandsDFS);
    }

    public getNumIslandsBFS(): number {
        return this._getNumIslands(this._getNumIslandsBFS);
    }

    public getNumIslandsGPT(): number {
        return this._getNumIslands(this._getNumIslandsGPT)
    }

    constructor(rows: number, cols: number, rep?: string) {
        if (!Number.isInteger(rows) || !Number.isInteger(cols)) {
            throw new Error("rows and cols should be integers");
        }

        this.rows = rows;
        this.cols = cols;

        if (rep !== undefined) {
            this._data = Island._generateIslandDataFromString(rep, rows, cols);
            this.rep = rep;

            return;
        } else {
            this._data = Island._generateRandomIslandData(rows, cols);
        }

        this.rep = Island._getStringRepFromData(this._data, this.rows, this.cols);
    }
}
