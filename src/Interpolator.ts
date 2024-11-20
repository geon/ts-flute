export class Interpolator {
	private samplesLeftToTarget: number;
	private current: number;
	private target: number;

	constructor(private samplerate: number, initial: number) {
		this.samplesLeftToTarget = 0;
		this.current = initial;
		this.target = initial;
	}

	setTarget(target: number, time: number) {
		this.target = target;
		this.samplesLeftToTarget = this.samplerate * time;
	}

	step(): number {
		if (this.samplesLeftToTarget) {
			this.current += (this.target - this.current) / this.samplesLeftToTarget;
			--this.samplesLeftToTarget;
		}
		return this.current;
	}
}
