import { MidiMessage } from "./midi-message";
import { synthImplementations } from "./synths";

const synthCache = new Map<string, Synth>();
export async function getSynth(synthIndex: number): Promise<Synth> {
	const synthImplementation = synthImplementations[synthIndex];
	if (!synthImplementation) {
		throw new Error("Not a valid synth selection.");
	}

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

export class Synth {
	constructor(private audioWorkletNode: AudioWorkletNode) {}

	static async create(
		processorKey: string,
		processorUrl: string
	): Promise<Synth> {
		const context = new AudioContext();
		await context.audioWorklet.addModule(processorUrl);
		const processorOptions: ProcessorOptions = {
			sampleRate: context.sampleRate,
		};
		const options: AudioWorkletNodeOptions = { processorOptions };
		const audioWorkletNode = new AudioWorkletNode(
			context,
			processorKey,
			options
		);
		audioWorkletNode.connect(context.destination);
		return new Synth(audioWorkletNode);
	}

	postMessage(message: MidiMessage): void {
		this.audioWorkletNode.port.postMessage(message);
	}
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
