export function frequencyFromMidiNoteNumber(noteNumber: number): number {
	return 440 * Math.pow(2, (noteNumber - 69) / 12);
}

export const speedOfSound = 343; // m/s

export function getSamplesPerMeter(sampleRate: number) {
	return sampleRate / speedOfSound;
}

export function getNumSamplesForPipe(sampleRate: number, frequency: number) {
	const samplesPerMeter = getSamplesPerMeter(sampleRate);
	const length = speedOfSound / frequency;
	const numSamples = length * samplesPerMeter;
	return numSamples;
}
