import React from "react";
import { createSynth, Synth } from "./synth-api";
import { customSynthProcessorKey } from "./processor-keys";

const middleCMidiNumber = 60;
let synth: Synth | undefined;
function makeNoteStartEventHandler(
	note: number
): React.MouseEventHandler<HTMLButtonElement> | undefined {
	return async () => {
		if (!synth) {
			synth = await createSynth(customSynthProcessorKey);
		}

		synth.postMessage({
			type: "noteon",
			number: note,
			value: 0,
			channel: 0,
			timestamp: 0,
		});
	};
}
async function noteStopEventHandler(): Promise<void> {
	if (!synth) {
		synth = await createSynth(customSynthProcessorKey);
	}

	synth.postMessage({
		type: "noteoff",
		number: 0,
		value: 0,
		channel: 0,
		timestamp: 0,
	});
}

const notes = [
	{
		name: "C",
		midiNumber: middleCMidiNumber,
	},
	{
		name: "D",
		midiNumber: middleCMidiNumber + 2,
	},
	{
		name: "E",
		midiNumber: middleCMidiNumber + 4,
	},
	{
		name: "F",
		midiNumber: middleCMidiNumber + 5,
	},
	{
		name: "G",
		midiNumber: middleCMidiNumber + 7,
	},
	{
		name: "A",
		midiNumber: middleCMidiNumber + 9,
	},
	{
		name: "B",
		midiNumber: middleCMidiNumber + 11,
	},
];
const sharps = [
	{
		name: "C#",
		midiNumber: middleCMidiNumber + 1,
	},
	{
		name: "D#",
		midiNumber: middleCMidiNumber + 3,
	},
	undefined,
	{
		name: "F#",
		midiNumber: middleCMidiNumber + 6,
	},
	{
		name: "G#",
		midiNumber: middleCMidiNumber + 8,
	},
	{
		name: "A#",
		midiNumber: middleCMidiNumber + 10,
	},
	undefined,
];

export function Ui(): JSX.Element {
	return (
		<div>
			<div>
				{sharps.map((sharp) => {
					if (!sharp) {
						return <span />;
					}
					const { name, midiNumber } = sharp;
					return (
						<button
							onPointerDown={makeNoteStartEventHandler(midiNumber)}
							onPointerUp={noteStopEventHandler}
						>
							{name}
						</button>
					);
				})}
			</div>
			<div>
				{notes.map(({ name, midiNumber }) => (
					<button
						onPointerDown={makeNoteStartEventHandler(midiNumber)}
						onPointerUp={noteStopEventHandler}
					>
						{name}
					</button>
				))}
			</div>
		</div>
	);
}
