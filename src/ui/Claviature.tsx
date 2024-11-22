import React from "react";

const middleCMidiNumber = 60;

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

export function Claviature(props: {
	readonly makeNoteStartEventHandler: (
		midiNumber: number
	) => React.MouseEventHandler<HTMLButtonElement>;
	readonly makeNoteStopEventHandler: (
		midiNumber: number
	) => React.MouseEventHandler<HTMLButtonElement>;
}): JSX.Element {
	return (
		<div>
			<div>
				{sharps.map((sharp, index) => {
					if (!sharp) {
						return <span key={"_" + index} />;
					}
					const { name, midiNumber } = sharp;
					return (
						<button
							key={midiNumber}
							onPointerDown={props.makeNoteStartEventHandler(midiNumber)}
							onPointerUp={props.makeNoteStopEventHandler(midiNumber)}
						>
							{name}
						</button>
					);
				})}
			</div>
			<div>
				{notes.map(({ name, midiNumber }) => (
					<button
						key={midiNumber}
						onPointerDown={props.makeNoteStartEventHandler(midiNumber)}
						onPointerUp={props.makeNoteStopEventHandler(midiNumber)}
					>
						{name}
					</button>
				))}
			</div>
		</div>
	);
}
