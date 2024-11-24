import {
	SynthGenerator,
	createGeneratorProcessor,
	makePolyphonic,
} from "../../Synth";
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

function* makeFlutePipe(sampleRate: number): SynthGenerator {
	let pipe: PanFlutePipe | undefined;

	for (;;) {
		const midiMessage = yield (pipe?.step() ?? 0) * 0.5;
		if (midiMessage) {
			switch (midiMessage.type) {
				case "noteon": {
					if (!pipe) {
						const frequency = frequencyFromMidiNoteNumber(midiMessage.number);
						pipe = new PanFlutePipe(sampleRate, frequency);
					}
					pipe.setVolumeTarget(0.7, 0.06);
					break;
				}
				case "noteoff": {
					pipe?.setVolumeTarget(0, 0.02);
					break;
				}
			}
		}
	}
}

export function register() {
	createGeneratorProcessor(processorKey, makePolyphonic(makeFlutePipe));
}
