import { readFileSync } from "node:fs";
import { argv, exit } from "node:process";
import { Island } from "./island.js";

// async function asyncAsFallible<T, E = Error>(promise: Promise<T>): Promise<[T, null] | [null, E]> {
//   try {
//     const data = await promise;
//     return [data, null];
//   } catch (error) {
//     return [null, error as E]
//   }
// }

function fallible<T, E = Error>(fallible: () => T): [T, undefined] | [undefined, E] {
    try {
        const data = fallible();

        if (Number.isNaN(data)) throw new Error("got NaN");
        if (data === undefined) throw new Error("got undefined");
        if (data === null) throw new Error("got null");

        return [data, undefined];
    } catch (error) {
        return [undefined, error as E]
    }
}

function plur(shouldPlur: number | boolean, sing: string, plur: string): string {
    if (typeof shouldPlur === "number") {
        return shouldPlur === 1 ? sing : plur;
    } else {
        return shouldPlur ? plur : sing;
    }
}

function printUsageAndExit(): number {
    console.error("usage:");
    console.error("  node island.js <rows> <cols>");
    console.error("  node island.js <rows> <cols> -g/--only-gen");
    console.error("  node island.js <rows> <cols> \"[numRep]\"");
    console.error("  node island.js <rows> <cols> [filePath]");
    return 1;
}

function start(): number {
    if (argv.length < 4) return (printUsageAndExit());

    const rows = parseInt(argv[2]!);
    const cols = parseInt(argv[3]!);

    if (argv[4] === "-g" || argv[4] === "--only-gen") {
        console.log(new Island(rows, cols).rep);
        return 0;
    }

    let island: Island;

    if (argv.length >= 5 && argv[4] !== "-s") {
        console.log("attempting to parse " + argv[4]);
        const [data, err] = fallible(() => readFileSync(argv[4]!, "utf8"));

        if (data !== undefined) {
            island = new Island(rows, cols, data);
        } else {
            const [getAtt, _] = fallible(() => new Island(rows, cols, argv[4]));

            if (getAtt === undefined) {
                console.error(`Bad file or number sequence "${argv[4]}" (not found or unparseable)`);
                return 1;
            }

            island = getAtt;
        }
    } else {
        island = new Island(rows, cols);
    }

    let numIslands = 0;
    let method = Math.floor(Math.random() * 3) + 1;
    let [secret, _] = fallible(() => parseInt(argv[5]!));

    if (rows * cols < 10000) {
        island.displayAsGrid();
    }

    if (secret !== undefined) method = secret;


    console.log("Using method " + method);
    switch (method) {
        case 1:
            numIslands = island.getNumIslandsDFS();
            break;
        case 2:
            numIslands = island.getNumIslandsBFS();
            break;
        case 3:
            numIslands = island.getNumIslandsGPT();
            break;
    }

    const pl = numIslands !== 1;
    console.log(`There ` +
        `${plur(pl, "is", "are")} ` +
        `${numIslands} ` +
        `${plur(pl, "island", "islands")} ` +
        `in this arrangement.`
    );

    return 0;
}

exit(start());
