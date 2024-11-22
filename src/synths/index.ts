import * as panFlute from "./pan-flute";
import * as squareWave from "./square-wave";

interface SynthImplementation {
	readonly name: string;
	readonly processorKey: string;
	readonly workerUrl: string;
}

export const synthImplementations: readonly SynthImplementation[] = [
	panFlute,
	squareWave,
];
