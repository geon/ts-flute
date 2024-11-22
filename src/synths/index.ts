import * as panFlute from "./pan-flute";
import * as squareWave from "./square-wave";

interface SynthImplementation {
	readonly name: string;
	readonly processorKey: string;
	readonly workerUrl: string;
}

export const synths: readonly SynthImplementation[] = [panFlute, squareWave];
