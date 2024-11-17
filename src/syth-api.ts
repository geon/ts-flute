import generatorProcessorUrl from "./custom-synth-processor?worker&url";
import { MidiMessage } from "./midi-message";
import { customSynthProcessorKey } from "./processor-keys";

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

export type Synth = {
	audioWorkletNode: AudioWorkletNode;
	context: AudioContext;
};

export async function setupSynth(): Promise<Synth> {
	const context = new AudioContext();

	// The context refuzes to play unless `resume` is called in a user input event handler.
	context.resume();

	await context.audioWorklet.addModule(generatorProcessorUrl);
	const audioWorkletNode = makeAudioWorkletNode(
		context,
		customSynthProcessorKey
	);
	audioWorkletNode.connect(context.destination);
	return { audioWorkletNode, context };
}

// Just a wrapper for typing.
export function postMessage(synth: Synth, message: MidiMessage): void {
	// Handle the MIDI message inside the oscilator.
	synth.audioWorkletNode.port.postMessage(message);
}
