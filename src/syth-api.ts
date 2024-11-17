import generatorProcessorUrl from "./custom-synth-processor?worker&url";
import { MidiMessage } from "./midi-message";

function makeAudioWorkletNode(context: AudioContext, processorKey: string) {
	const options: AudioWorkletNodeOptions = {
		processorOptions: { sampleRate: context.sampleRate },
	};
	const oscillatorProcessor = new AudioWorkletNode(
		context,
		processorKey,
		options
	);
	return oscillatorProcessor;
}

export class Synth {
	constructor(private audioWorkletNode: AudioWorkletNode) {}

	postMessage(message: MidiMessage): void {
		this.audioWorkletNode.port.postMessage(message);
	}
}

export async function createSynth(processorKey: string): Promise<Synth> {
	const context = new AudioContext();

	// The context refuzes to play unless `resume` is called in a user input event handler.
	context.resume();

	await context.audioWorklet.addModule(generatorProcessorUrl);
	const audioWorkletNode = makeAudioWorkletNode(context, processorKey);
	audioWorkletNode.connect(context.destination);
	return new Synth(audioWorkletNode);
}
