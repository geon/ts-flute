import { SynthGenerator, createGeneratorProcessor } from "./synth-api";
import { customSynthProcessorKey } from "./processor-keys";
import { ChamberlinOscillator } from "./ChamberlinOscillator";
import { Interpolator } from "./Interpolator";
import { frequencyFromMidiNoteNumber } from "./midi-message";

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

class PanFlutePipe {
	pipe: PipeSection;
	whistle: ChamberlinOscillator;
	volumeInterpolator: Interpolator;

	constructor(sampleRate: number, frequency: number) {
		const samplesPerMeter = sampleRate / speedOfSound;
		const length = speedOfSound / frequency;
		this.pipe = new PipeSection(length * samplesPerMeter);
		this.whistle = new ChamberlinOscillator(220);
		this.volumeInterpolator = new Interpolator(sampleRate, 0);
	}

	setVolumeTarget(target: number, time: number) {
		this.volumeInterpolator.setTarget(target, time);
	}

	step(): number {
		const damping = 0.75;

		const [pressureAtFoot, pressureAtHead] = this.pipe.read();

		const pressureFromWhistle = this.whistle.step(
			this.volumeInterpolator.step(),
			pressureAtHead
		);

		this.pipe.write([
			pressureFromWhistle + pressureAtHead * damping,
			pressureAtFoot * -damping,
		]);
		this.pipe.step();

		return pressureAtFoot;
	}
}

const speedOfSound = 343; // m/s

function* makeFlute(sampleRate: number): SynthGenerator {
	const pipes = new Map<number, PanFlutePipe>();

	for (;;) {
		const sumPressure = [...pipes.values()]
			.map((pipe) => pipe.step())
			.reduce((a, b) => a + b, 0);
		const midiMessage = yield sumPressure * 0.2;
		if (midiMessage) {
			let pipe = pipes.get(midiMessage.number);
			if (!pipe) {
				const frequency = frequencyFromMidiNoteNumber(midiMessage.number);
				pipe = new PanFlutePipe(sampleRate, frequency);
				pipes.set(midiMessage.number, pipe);
			}
			switch (midiMessage.type) {
				case "noteon": {
					pipe.setVolumeTarget(0.7, 0.06);
					break;
				}
				case "noteoff": {
					pipe.setVolumeTarget(0, 0.02);
					break;
				}
			}
		}
	}
}

createGeneratorProcessor(customSynthProcessorKey, makeFlute);
