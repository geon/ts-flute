import React from "react";
import { middleCMidiNumber } from "../utils";
import styled from "styled-components";

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

const KeyStyle = styled.button``;
const BlackKeys = styled.div``;
const WhiteKeys = styled.div``;
const ClaviatureStyle = styled.div``;

export function Claviature(props: {
	readonly makeNoteStartEventHandler: (
		midiNumber: number
	) => React.MouseEventHandler<HTMLButtonElement>;
	readonly makeNoteStopEventHandler: (
		midiNumber: number
	) => React.MouseEventHandler<HTMLButtonElement>;
}): JSX.Element {
	return (
		<ClaviatureStyle>
			<BlackKeys>
				{sharps.map((sharp, index) => {
					if (!sharp) {
						return <span key={"_" + index} />;
					}
					const { name, midiNumber } = sharp;
					return (
						<Key
							key={midiNumber}
							label={name}
							midiNumber={midiNumber}
							makeNoteStartEventHandler={props.makeNoteStartEventHandler}
							makeNoteStopEventHandler={props.makeNoteStopEventHandler}
						/>
					);
				})}
			</BlackKeys>
			<WhiteKeys>
				{notes.map(({ name, midiNumber }) => (
					<Key
						key={midiNumber}
						label={name}
						midiNumber={midiNumber}
						makeNoteStartEventHandler={props.makeNoteStartEventHandler}
						makeNoteStopEventHandler={props.makeNoteStopEventHandler}
					/>
				))}
			</WhiteKeys>
		</ClaviatureStyle>
	);
}

function Key(props: {
	readonly midiNumber: number;
	readonly label: string;
	readonly makeNoteStartEventHandler: (
		midiNumber: number
	) => React.MouseEventHandler<HTMLButtonElement>;
	readonly makeNoteStopEventHandler: (
		midiNumber: number
	) => React.MouseEventHandler<HTMLButtonElement>;
}): React.JSX.Element {
	return (
		<KeyStyle
			onPointerDown={props.makeNoteStartEventHandler(props.midiNumber)}
			onPointerUp={props.makeNoteStopEventHandler(props.midiNumber)}
		>
			{props.label}
		</KeyStyle>
	);
}
