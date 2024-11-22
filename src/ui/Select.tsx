import React from "react";

export function Select(props: {
	readonly value: string;
	readonly onChange: React.ChangeEventHandler<HTMLSelectElement>;
	readonly options: ReadonlyArray<string>;
}) {
	return (
		<select value={props.value} onChange={props.onChange}>
			{props.options.map((label, index) => (
				<option key={index} value={index}>
					{label}
				</option>
			))}
		</select>
	);
}
