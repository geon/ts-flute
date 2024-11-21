import { MidiMessage } from "./midi-message";

export class Synth {
	constructor(private audioWorkletNode: AudioWorkletNode) {}

	postMessage(message: MidiMessage): void {
		this.audioWorkletNode.port.postMessage(message);
	}
}

export async function createSynth(
	processorKey: string,
	processorUrl: string
): Promise<Synth> {
	const context = new AudioContext();
	await context.audioWorklet.addModule(processorUrl);
	const processorOptions: ProcessorOptions = { sampleRate: context.sampleRate };
	const options: AudioWorkletNodeOptions = { processorOptions };
	const audioWorkletNode = new AudioWorkletNode(context, processorKey, options);
	audioWorkletNode.connect(context.destination);
	return new Synth(audioWorkletNode);
}

export type SynthGenerator = Generator<number, never, MidiMessage | undefined>;

interface ProcessorOptions {
	sampleRate: number;
}

export function createGeneratorProcessor(
	processorKey: string,
	createSynthGenerator: (sampleRate: number) => SynthGenerator
) {
	class GeneratorProcessor extends AudioWorkletProcessor {
		toneOscilator: SynthGenerator;
		midiMessages: MidiMessage[] = [];

		constructor({ processorOptions }: { processorOptions: ProcessorOptions }) {
			super();
			this.toneOscilator = createSynthGenerator(processorOptions.sampleRate);
			// Prime the generator so it is ready to receive events.
			this.toneOscilator.next();
			this.port.onmessage = (event: MessageEvent<MidiMessage>): void => {
				this.midiMessages.push(event.data);
			};
		}

		process(
			_inputs: Float32Array[][],
			outputs: Float32Array[][],
			_parameters: Record<string, Float32Array>
		) {
			const channel = outputs[0]?.[0];
			if (!channel) {
				throw new Error("Missing channel.");
			}

			for (let i = 0; i < channel.length; i++) {
				channel[i] = this.toneOscilator.next(this.midiMessages.shift()).value;
			}

			return true;
		}
	}

	registerProcessor(processorKey, GeneratorProcessor);
}