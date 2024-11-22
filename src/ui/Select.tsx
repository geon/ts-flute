import React from "react";

export function Select(props: {
	readonly value: string;
	readonly onChange: (selectedIndex: number) => void;
	readonly options: ReadonlyArray<string>;
}) {
	return (
		<select
			value={props.value}
			onChange={(event) => props.onChange(event.currentTarget.selectedIndex)}
		>
			{props.options.map((label, index) => (
				<option key={index} value={index}>
					{label}
				</option>
			))}
		</select>
	);
}
