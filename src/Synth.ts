import { MidiMessage } from "./midi-message";

export class Synth {
	constructor(private audioWorkletNode: AudioWorkletNode) {}

	static context: AudioContext | undefined = undefined;
	static getCommonAudioContext(): AudioContext {
		if (!Synth.context) {
			Synth.context = new AudioContext();
		}

		return Synth.context;
	}

	static async create(
		processorKey: string,
		processorUrl: string
	): Promise<Synth> {
		const context = Synth.getCommonAudioContext();
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

export function makePolyphonic(
	makeMonophonic: (sampleRate: number) => SynthGenerator
): (sampleRate: number) => SynthGenerator {
	return function* () {
		const monophonics = new Map<number, SynthGenerator>();

		let sum: number = 0;
		for (;;) {
			const midiMessage = yield sum;

			if (midiMessage) {
				let monophonic = monophonics.get(midiMessage.number);
				if (!monophonic) {
					monophonic = makeMonophonic(sampleRate);
					monophonics.set(midiMessage.number, monophonic);

					// Prime it so it is ready to recieve midi messages.
					monophonic.next();
				}
			}

			sum = [...monophonics.entries()]
				.map(
					([key, oscillator]) =>
						oscillator.next(
							key === midiMessage?.number ? midiMessage : undefined
						).value
				)
				.reduce((a, b) => a + b, 0);
		}
	};
}
