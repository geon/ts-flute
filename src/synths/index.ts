import { Synth } from "../Synth";
import * as panFlute from "./pan-flute";
import * as squareWave from "./square-wave";

export interface SynthImplementation {
	readonly name: string;
	readonly processorKey: string;
	readonly workerUrl: string;
}

export const synthImplementations: readonly SynthImplementation[] = [
	panFlute,
	squareWave,
];

const synthCache = new Map<string, Synth>();
export async function getSynth(
	synthImplementation: SynthImplementation
): Promise<Synth> {
	let synth = synthCache.get(synthImplementation.workerUrl);
	if (!synth) {
		synth = await Synth.create(
			synthImplementation.processorKey,
			synthImplementation.workerUrl
		);
		synthCache.set(synthImplementation.workerUrl, synth);
	}
	return synth;
}
