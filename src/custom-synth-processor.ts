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

class Interpolator {
	private samplesLeftToTarget: number;
	private current: number;
	private target: number;

	constructor(private samplerate: number, initial: number) {
		this.samplesLeftToTarget = 0;
		this.current = initial;
		this.target = initial;
	}

	setTarget(target: number, time: number) {
		this.target = target;
		this.samplesLeftToTarget = this.samplerate * time;
	}

	step(): number {
		if (this.samplesLeftToTarget) {
			this.current += (this.target - this.current) / this.samplesLeftToTarget;
			--this.samplesLeftToTarget;
		}
		return this.current;
	}
}

function clampInputToVolume(input: number, volume: number): number {
	return Math.max(-volume, Math.min(volume, input));
}

// https://www.earlevel.com/main/2003/03/02/the-digital-state-variable-filter/
class ChamberlinOscillator {
	sinZ = 0;
	cosZ = 0;

	constructor(private frequency: number) {}

	step(volume: number, feedback: number): number {
		// The frequency control coefficient as described in
		// https://www.earlevel.com/main/2003/03/02/the-digital-state-variable-filter/
		const f = 2 * Math.PI * (this.frequency / sampleRate);

		this.sinZ = this.sinZ + this.cosZ * f;
		this.cosZ = this.cosZ - this.sinZ * f;

		const noise = 0.0001 * (-1 + 2 * Math.random());
		this.sinZ = clampInputToVolume(this.sinZ + noise + feedback * f, volume);

		return this.sinZ;
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
