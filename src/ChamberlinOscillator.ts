// https://www.earlevel.com/main/2003/03/02/the-digital-state-variable-filter/
export class ChamberlinOscillator {
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

function clampInputToVolume(input: number, volume: number): number {
	return Math.max(-volume, Math.min(volume, input));
}
