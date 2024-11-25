import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
	html {
		/* Prevent dragging and long pressing from selecting on mobile Safari. */
		user-select: none;
		-webkit-user-select: none;

		/* Prevents scrolling and bounce on mobile Safari. */
		overflow: hidden;
	}
`;
