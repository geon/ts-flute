import React from "react";
import { createSynth, Synth } from "./synth-api";
// import * as panFluteSynth from "./synths/pan-flute";
import * as squareWaveSynth from "./synths/square-wave";
import { Claviature } from "./Claviature";

let synth: Synth | undefined;
async function getSynth(): Promise<Synth> {
	if (!synth) {
		synth = await createSynth(
			squareWaveSynth.processorKey,
			squareWaveSynth.workerUrl
		);
	}
	return synth;
}

function makeNoteStartEventHandler(
	note: number
): React.MouseEventHandler<HTMLButtonElement> {
	return async () => {
		(await getSynth()).postMessage({
			type: "noteon",
			number: note,
			value: 0,
			channel: 0,
			timestamp: 0,
		});
	};
}
function makeNoteStopEventHandler(
	note: number
): React.MouseEventHandler<HTMLButtonElement> {
	return async () => {
		(await getSynth()).postMessage({
			type: "noteoff",
			number: note,
			value: 0,
			channel: 0,
			timestamp: 0,
		});
	};
}

export function Ui(): JSX.Element {
	return (
		<div>
			<p>
				Source code:{" "}
				<a href="https://github.com/geon/ts-flute">github.com/geon/ts-flute</a>
			</p>
			<Claviature
				makeNoteStartEventHandler={makeNoteStartEventHandler}
				makeNoteStopEventHandler={makeNoteStopEventHandler}
			/>
		</div>
	);
}
