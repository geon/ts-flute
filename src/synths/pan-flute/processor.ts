import { SynthGenerator, createGeneratorProcessor } from "../../Synth";
import { ChamberlinOscillator } from "../../ChamberlinOscillator";
import { Interpolator } from "../../Interpolator";
import { frequencyFromMidiNoteNumber, getNumSamplesForPipe } from "../../utils";
import { PipeSection } from "../../PipeSection";

export const name = "Pan Flute";
export const processorKey = "pan-flute";

class PanFlutePipe {
	pipe: PipeSection;
	whistle: ChamberlinOscillator;
	volumeInterpolator: Interpolator;

	constructor(sampleRate: number, frequency: number) {
		const numSamples = getNumSamplesForPipe(sampleRate, frequency);
		this.pipe = new PipeSection(numSamples);
		this.whistle = new ChamberlinOscillator(frequency);
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
			pressureAtFoot * damping,
		]);
		this.pipe.step();

		return pressureAtFoot;
	}
}

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

export function register() {
	createGeneratorProcessor(processorKey, makeFlute);
}
