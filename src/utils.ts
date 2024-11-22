export function frequencyFromMidiNoteNumber(noteNumber: number): number {
	return 440 * Math.pow(2, (noteNumber - 69) / 12);
}

export const speedOfSound = 343; // m/s

export function getNumSamplesForPipe(sampleRate: number, frequency: number) {
	const samplesPerMeter = sampleRate / speedOfSound;
	const length = speedOfSound / frequency;
	const numSamples = length * samplesPerMeter;
	return numSamples;
}
