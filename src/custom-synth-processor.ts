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
class Whistle {
	sinZ = 0;
	cosZ = 0;

	constructor(private frequency: number) {}

	step(volume: number, feedback: number): number {
		// The frequency control coefficient as described in
		// https://www.earlevel.com/main/2003/03/02/the-digital-state-variable-filter/
		const f = 2 * Math.PI * (this.frequency / sampleRate);

		const noise = 0.01 * (-1 + 2 * Math.random());

		this.sinZ = this.sinZ + this.cosZ * f;
		this.cosZ = this.cosZ - this.sinZ * f;

		this.sinZ = clampInputToVolume(this.sinZ + noise + feedback * f, volume);

		return this.sinZ;
	}
}

function* makeFlute(sampleRate: number): SynthGenerator {
	const speedOfSound = 343; // m/s
	const samplesPerMeter = sampleRate / speedOfSound;

	const dampening = 0.75;

	let pipe = new PipeSection(1);
	const whistle = new Whistle(220);

	const volumeInterpolator = new Interpolator(sampleRate * 0.2, 0);
	for (;;) {
		const [pressureAtFoot, pressureAtHead] = pipe.read();

		const pressureFromWhistle = whistle.step(
			volumeInterpolator.step(),
			pressureAtHead
		);

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
					volumeInterpolator.setTarget(1, 0.3);
					break;
				}
				case "noteoff": {
					volumeInterpolator.setTarget(0, 0.1);
					break;
				}
			}
		}
	}
}

createGeneratorProcessor(customSynthProcessorKey, makeFlute);
