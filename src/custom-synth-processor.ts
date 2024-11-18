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

	read(): number {
		return this.samples[this.cursor]!;
	}
	write(input: number): void {
		this.samples[this.cursor] = input;
	}
	step(): void {
		this.cursor = (this.cursor + 1) % this.samples.length;
	}
}

class PipeSection {
	delayLines: [DelayLine, DelayLine];

	constructor(size: number) {
		this.delayLines = [new DelayLine(size), new DelayLine(size)];
	}

	read(): [number, number] {
		return [this.delayLines[0].read(), this.delayLines[1].read()];
	}
	write(input: [number, number]): void {
		this.delayLines[0].write(input[0]);
		this.delayLines[1].write(input[1]);
	}
	step(): void {
		this.delayLines[0].step();
		this.delayLines[1].step();
	}
}

class Whistle {
	step(volume: number, _pressure: number): number {
		return volume * 0.1 * (-1 + 2 * Math.random());
	}
}

function* makeFlute(sampleRate: number): SynthGenerator {
	const speedOfSound = 343; // m/s
	const samplesPerMeter = sampleRate / speedOfSound;

	const dampening = 0.75;

	let pipe = new PipeSection(1);
	const whistle = new Whistle();

	let volume = 0;
	for (;;) {
		const [pressureAtFoot, pressureAtHead] = pipe.read();

		const pressureFromWhistle = whistle.step(volume, pressureAtHead);

		pipe.write([
			pressureFromWhistle + pressureAtHead * dampening,
			pressureAtFoot * -dampening,
		]);
		pipe.step();

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
