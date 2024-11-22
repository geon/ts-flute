import React, { useState } from "react";
import { Claviature } from "./Claviature";
import { getSynth, synthImplementations } from "../synths";
import { GithubRibbon } from "./github-ribbon";
import { Select } from "./Select";
import { makeMidiMessageFromMidiArray } from "../midi-message";

export function Root(): JSX.Element {
	const [synthIndex, setSynthIndex] = useState(0);
	const synthImplementation = synthImplementations[synthIndex];
	if (!synthImplementation) {
		throw new Error("Not a valid synth selection.");
	}

	return (
		<div>
			<GithubRibbon
				text="Source on Github"
				href="https://github.com/geon/ts-flute"
			/>
			<label>
				<input
					type="checkbox"
					onChange={async (event) => {
						const enabled = event.currentTarget.checked;
						const midiAccess = await navigator.requestMIDIAccess();
						midiAccess.inputs.forEach((entry) => {
							entry.onmidimessage = !enabled
								? () => undefined
								: async (event) => {
										const message = makeMidiMessageFromMidiArray(
											event.data,
											event.timeStamp
										);
										(await getSynth(synthImplementation)).postMessage(message);
								  };
						});
					}}
				/>
				Enable MIDI in
			</label>
			<Select
				value={synthIndex.toString()}
				onChange={setSynthIndex}
				options={synthImplementations.map((x) => x.name)}
			/>
			<Claviature
				makeNoteStartEventHandler={(note: number) => async () => {
					(await getSynth(synthImplementation)).postMessage({
						type: "noteon",
						number: note,
						value: 0,
						channel: 0,
						timestamp: 0,
					});
				}}
				makeNoteStopEventHandler={(note: number) => async () => {
					(await getSynth(synthImplementation)).postMessage({
						type: "noteoff",
						number: note,
						value: 0,
						channel: 0,
						timestamp: 0,
					});
				}}
			/>
		</div>
	);
}
