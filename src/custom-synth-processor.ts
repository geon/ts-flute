import { SynthGenerator, createGeneratorProcessor } from "./synth-api";
import { customSynthProcessorKey } from "./processor-keys";

function frequencyFromMidiNoteNumber(noteNumber: number): number {
	return 440 * Math.pow(2, (noteNumber - 69) / 12);
}

class DelayLine {
	cursor: number;
	samples: number[];

	constructor(size: number) {
		if (!size) {
			throw new Error("A delay line must have a size.");
		}

		this.cursor = 0;

		this.samples = [];
		for (let i = 0; i < size; ++i) {
			this.samples[i] = 0;
		}
	}

	step(input: number): number {
		this.samples[this.cursor] = input;
		this.cursor = (this.cursor + 1) % this.samples.length;
		return this.samples[this.cursor]!;
	}
}

function* makeFlute(sampleRate: number): SynthGenerator {
	const speedOfSound = 343; // m/s
	const samplesPerMeter = sampleRate / speedOfSound;

	const dampening = 0.75;

	let headToFoot = new DelayLine(1);
	let footToHead = new DelayLine(1);

	let pressureAtHead = 0;
	let pressureAtFoot = 0;

	let volume = 0;
	for (;;) {
		const noiseFromMouth = 0.1 * volume * (-1 + 2 * Math.random());

		pressureAtHead = footToHead.step(pressureAtFoot * -dampening);
		pressureAtFoot = headToFoot.step(
			noiseFromMouth + pressureAtHead * dampening
		);

		const midiMessage = yield pressureAtFoot;
		if (midiMessage) {
			switch (midiMessage.type) {
				case "noteon": {
					const frequency = frequencyFromMidiNoteNumber(midiMessage.number);
					const length = speedOfSound / frequency;

					headToFoot = new DelayLine(length * samplesPerMeter);
					footToHead = new DelayLine(length * samplesPerMeter);

					volume = 1;
					break;
				}
				case "noteoff": {
					volume = 0;
					break;
				}
			}
		}
	}
}

createGeneratorProcessor(customSynthProcessorKey, makeFlute);
