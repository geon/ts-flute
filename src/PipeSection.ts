import { DelayLine } from "./DelayLine";

export class PipeSection {
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
