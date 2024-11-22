import React, { useState } from "react";
import { Claviature } from "./Claviature";
import { synths } from "../synths";
import { GithubRibbon } from "./github-ribbon";
import { Select } from "./Select";
import { makeMidiMessageFromMidiArray } from "../midi-message";
import { getSynth } from "../synth-api";

export function Root(): JSX.Element {
	const [synthIndex, setSynthIndex] = useState(0);

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
										(await getSynth(synthIndex)).postMessage(message);
								  };
						});
					}}
				/>
				Enable MIDI in
			</label>
			<Select
				value={synthIndex.toString()}
				onChange={setSynthIndex}
				options={synths.map((x) => x.name)}
			/>
			<Claviature
				makeNoteStartEventHandler={(note: number) => async () => {
					(await getSynth(synthIndex)).postMessage({
						type: "noteon",
						number: note,
						value: 0,
						channel: 0,
						timestamp: 0,
					});
				}}
				makeNoteStopEventHandler={(note: number) => async () => {
					(await getSynth(synthIndex)).postMessage({
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
