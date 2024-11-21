import React, { useState } from "react";
import { createSynth, Synth } from "./synth-api";
import { Claviature } from "./Claviature";
import { synths } from "./synths";
import { GithubRibbon } from "./github-ribbon";

const synthCache = new Map<string, Synth>();
async function getSynth(synthIndex: number): Promise<Synth> {
	const selectedSynth = synths[synthIndex];
	if (!selectedSynth) {
		throw new Error("Not a valid synth selection.");
	}

	let synth = synthCache.get(selectedSynth.workerUrl);
	if (!synth) {
		synth = await createSynth(
			selectedSynth.processorKey,
			selectedSynth.workerUrl
		);
		synthCache.set(selectedSynth.workerUrl, synth);
	}
	return synth;
}

function makeNoteStartEventHandler(
	synthIndex: number
): (note: number) => React.MouseEventHandler<HTMLButtonElement> {
	return (note: number) => async () => {
		(await getSynth(synthIndex)).postMessage({
			type: "noteon",
			number: note,
			value: 0,
			channel: 0,
			timestamp: 0,
		});
	};
}
function makeNoteStopEventHandler(
	synthIndex: number
): (note: number) => React.MouseEventHandler<HTMLButtonElement> {
	return (note: number) => async () => {
		(await getSynth(synthIndex)).postMessage({
			type: "noteoff",
			number: note,
			value: 0,
			channel: 0,
			timestamp: 0,
		});
	};
}

export function Ui(): JSX.Element {
	const [synthIndex, setSynthIndex] = useState(0);

	return (
		<div>
			<GithubRibbon
				text="Source on Github"
				href="https://github.com/geon/ts-flute"
			/>
			<select
				value={synthIndex}
				onChange={(event) => setSynthIndex(event.currentTarget.selectedIndex)}
			>
				{synths.map((synth, index) => (
					<option key={index} value={index}>
						{synth.name}
					</option>
				))}
			</select>
			<Claviature
				makeNoteStartEventHandler={makeNoteStartEventHandler(synthIndex)}
				makeNoteStopEventHandler={makeNoteStopEventHandler(synthIndex)}
			/>
		</div>
	);
}
