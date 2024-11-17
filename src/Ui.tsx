import React from "react";
import { setupSynth, Synth, postMessage } from "./syth-api";

let synth: Synth | undefined;

const middleCMidiNumber = 60;

export function Ui(): JSX.Element {
	return (
		<button
			onMouseDown={async () => {
				if (!synth) {
					synth = await setupSynth();
				}

				postMessage(synth, {
					type: "noteon",
					number: middleCMidiNumber,
					value: 0,
					channel: 0,
					timestamp: 0,
				});
			}}
			onMouseUp={async () => {
				if (!synth) {
					synth = await setupSynth();
				}

				postMessage(synth, {
					type: "noteoff",
					number: 0,
					value: 0,
					channel: 0,
					timestamp: 0,
				});
			}}
		>
			play
		</button>
	);
}
