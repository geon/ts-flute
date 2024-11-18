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

class PipeSection {
	delayLines: [DelayLine, DelayLine];

	constructor(size: number) {
		this.delayLines = [new DelayLine(size), new DelayLine(size)];
	}

	step(input: [number, number]): [number, number] {
		return [
			this.delayLines[0].step(input[0]),
			this.delayLines[1].step(input[1]),
		];
	}
}

function* makeFlute(sampleRate: number): SynthGenerator {
	const speedOfSound = 343; // m/s
	const samplesPerMeter = sampleRate / speedOfSound;

	const dampening = 0.75;

	let pipe = new PipeSection(1);

	let pressureAtHead = 0;
	let pressureAtFoot = 0;

	let volume = 0;
	for (;;) {
		const noiseFromMouth = 0.1 * volume * (-1 + 2 * Math.random());

		[pressureAtFoot, pressureAtHead] = pipe.step([
			noiseFromMouth + pressureAtHead * dampening,
			pressureAtFoot * -dampening,
		]);

		const midiMessage = yield pressureAtFoot;
		if (midiMessage) {
			switch (midiMessage.type) {
				case "noteon": {
					const frequency = frequencyFromMidiNoteNumber(midiMessage.number);
					const length = speedOfSound / frequency;
					pipe = new PipeSection(length * samplesPerMeter);
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
