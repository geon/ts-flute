import {
	SynthGenerator,
	createGeneratorProcessor,
	makePolyphonic,
} from "../../Synth";
import { frequencyFromMidiNoteNumber } from "../../utils";

export const name = "Square Wave";
export const processorKey = "square-wave";

function* makeSquareWave(sampleRate: number): SynthGenerator {
	let value = 1;
	let volume = 0;
	let samplesPerHalfPeriod = 1;
	for (;;) {
		for (let i = 0; i < samplesPerHalfPeriod; ++i) {
			const midiMessage = yield value * volume * 0.15;

			if (midiMessage) {
				switch (midiMessage.type) {
					case "noteon": {
						const frequency = frequencyFromMidiNoteNumber(midiMessage.number);
						samplesPerHalfPeriod = (sampleRate / frequency) * 0.5;
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
		value *= -1;
	}
}

export function register() {
	createGeneratorProcessor(processorKey, makePolyphonic(makeSquareWave));
}
