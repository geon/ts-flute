export class DelayLine {
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
