import generatorProcessorUrl from "./custom-synth-processor?worker&url";
import { MidiMessage } from "./midi-message";
import { customSynthProcessorKey } from "./processor-keys";

const middleCMidiNumber = 60;

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

type Synth = {
	audioWorkletNode: AudioWorkletNode;
	context: AudioContext;
};

async function setupSynth(): Promise<Synth> {
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
function postMessage(synth: Synth, message: MidiMessage): void {
	// Handle the MIDI message inside the oscilator.
	synth.audioWorkletNode.port.postMessage(message);
}

async function main() {
	let synth: Synth | undefined = undefined;

	const playButton = window.document.getElementById("play");
	if (!playButton) {
		throw new Error("No play button found.");
	}

	playButton.addEventListener("mousedown", async () => {
		if (!synth) {
			synth = await setupSynth();
		}

		postMessage(synth, {
			type: "noteon",
			number: middleCMidiNumber,
			value: 0,
			channel: 0,
			timestamp: 0,
		});
	});

	playButton.addEventListener("mouseup", async () => {
		if (!synth) {
			synth = await setupSynth();
		}

		postMessage(synth, {
			type: "noteoff",
			number: middleCMidiNumber,
			value: 0,
			channel: 0,
			timestamp: 0,
		});
	});
}

main();
