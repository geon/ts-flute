import { SynthGenerator, createGeneratorProcessor } from "../../synth-api";
import { frequencyFromMidiNoteNumber } from "../../midi-message";

export const processorKey = "square-wave";

function* makeSquareWave(samplesPerHalfPeriod: number): SynthGenerator {
	let value = 1;
	for (;;) {
		for (let i = 0; i < samplesPerHalfPeriod; ++i) {
			yield value;
		}
		value *= -1;
	}
}

function* makeSquareWaves(sampleRate: number): SynthGenerator {
	const oscillators = new Map<number, SynthGenerator>();

	for (;;) {
		const sumPressure = [...oscillators.values()]
			.map((oscillator) => oscillator.next().value)
			.reduce((a, b) => a + b, 0);
		const midiMessage = yield sumPressure * 0.15;
		if (midiMessage) {
			let oscillator = oscillators.get(midiMessage.number);
			switch (midiMessage.type) {
				case "noteon": {
					if (!oscillator) {
						const frequency = frequencyFromMidiNoteNumber(midiMessage.number);
						oscillator = makeSquareWave((sampleRate / frequency) * 0.5);
						oscillators.set(midiMessage.number, oscillator);
					}
					break;
				}
				case "noteoff": {
					oscillators.delete(midiMessage.number);
					break;
				}
			}
		}
	}
}

export function register() {
	createGeneratorProcessor(processorKey, makeSquareWaves);
}
