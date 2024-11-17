import { MidiMessage } from "./midi-message";
import { customSynthProcessorKey } from "./processor-keys";

function frequencyFromMidiNoteNumber(noteNumber: number): number {
	return 440 * Math.pow(2, (noteNumber - 69) / 12);
}

type SynthGenerator = Generator<number, never, MidiMessage | undefined>;

function* makeSawToothOscilator(sampleRate: number): SynthGenerator {
	let periodRatio = 0;
	let frequency = 0;
	let volume = 0;

	for (;;) {
		const midiMessage = yield volume * periodRatio;
		if (midiMessage) {
			switch (midiMessage.type) {
				case "noteon": {
					periodRatio = 0;
					frequency = frequencyFromMidiNoteNumber(midiMessage.number);
					volume = 1;
					break;
				}
				case "noteoff": {
					frequency = 0;
					volume = 0;
					break;
				}
			}
		}

		const deltaPeriodRatio = frequency / sampleRate;
		periodRatio += deltaPeriodRatio;
		if (periodRatio >= 1) {
			periodRatio -= 1;
		}
	}
}

class GeneratorProcessor extends AudioWorkletProcessor {
	toneOscilator: SynthGenerator;
	midiMessages: MidiMessage[] = [];

	constructor({
		processorOptions,
	}: {
		processorOptions: { sampleRate: number };
	}) {
		super();
		this.toneOscilator = makeSawToothOscilator(processorOptions.sampleRate);
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

registerProcessor(customSynthProcessorKey, GeneratorProcessor);
