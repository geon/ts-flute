// https://github.com/soulfresh/midi-parser
// Code adapted from class-based plain js.

// Midi message names
export const MessageTypes = {
	NOTE_ON: "noteon",
	NOTE_OFF: "noteoff",
	KEY_PRESSURE: "keypressure",
	CC: "controlchange",
	PROGRAM_CHANGE: "programchange",
	CHANNEL_PRESSURE: "channelpressure",
	PITCH_BEND: "pitchbend",
	UNKNOWN: "unknown",
} as const;

type MessageType = (typeof MessageTypes)[keyof typeof MessageTypes];

export interface MidiMessage {
	readonly type: MessageType;
	readonly number: number;
	readonly value: number;
	readonly channel: number;
	readonly timestamp: number;
}
