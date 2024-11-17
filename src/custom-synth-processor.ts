import { SynthGenerator, createGeneratorProcessor } from "./syth-api";
import { customSynthProcessorKey } from "./processor-keys";

function frequencyFromMidiNoteNumber(noteNumber: number): number {
	return 440 * Math.pow(2, (noteNumber - 69) / 12);
}

function* makeSawToothOscilator(sampleRate: number): SynthGenerator {
	let periodRatio = 0;
	let frequency = 0;
	let volume = 0;

	for (;;) {
		const midiMessage = yield volume * periodRatio;
		if (midiMessage) {
			switch (midiMessage.type) {
				case "noteon": {
					periodRatio = 0;
					frequency = frequencyFromMidiNoteNumber(midiMessage.number);
					volume = 1;
					break;
				}
				case "noteoff": {
					frequency = 0;
					volume = 0;
					break;
				}
			}
		}

		const deltaPeriodRatio = frequency / sampleRate;
		periodRatio += deltaPeriodRatio;
		if (periodRatio >= 1) {
			periodRatio -= 1;
		}
	}
}

createGeneratorProcessor(customSynthProcessorKey, makeSawToothOscilator);
