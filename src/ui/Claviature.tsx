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

const Spacer = styled.span``;
const KeyStyle = styled.div`
	height: 200px;
	border-radius: 10000px;
	box-sizing: border-box;

	box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 1) inset,
		1px 2px 2px 0px rgba(255, 255, 255, 0.5) inset,
		-1px -2px 2px 0px rgba(0, 0, 0, 0.3) inset;

	& > * {
		width: 100%;
		height: 100%;
		background: none;
		border: none;
		color: inherit;
	}
`;
const BlackKeys = styled.div``;
const WhiteKeys = styled.div``;
const gap = "20px";
const ClaviatureStyle = styled.div`
	box-sizing: border-box;
	padding: ${gap};

	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: stretch;
	gap: ${gap};

	${BlackKeys},
	${WhiteKeys} {
		width: 100%;
		display: flex;
		flex-direction: row;
		align-items: stretch;
		gap: ${gap};

		${KeyStyle}, ${Spacer} {
			flex-basis: 100%;
			/* flex: 1 1 auto; */
		}
	}
	${BlackKeys} > ${Spacer} {
		&:first-child,
		&:last-child {
			flex-basis: 50%;
		}
	}

	${BlackKeys} {
		${KeyStyle} {
			color: white;
			background: linear-gradient(0, #333, black, black);
		}
	}
	${WhiteKeys} {
		${KeyStyle} {
			color: black;
			background: linear-gradient(0, white, white, #eee);
		}
	}
`;

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
				<Spacer />
				{sharps.map((sharp, index) => {
					if (!sharp) {
						return <Spacer key={"_" + index} />;
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
		<KeyStyle>
			<button
				onPointerDown={props.makeNoteStartEventHandler(props.midiNumber)}
				onPointerUp={props.makeNoteStopEventHandler(props.midiNumber)}
				onPointerLeave={props.makeNoteStopEventHandler(props.midiNumber)}
			>
				{props.label}
			</button>
		</KeyStyle>
	);
}
