import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Root } from "./ui/Root.tsx";
import { createGlobalStyle } from "styled-components";
import { Reset } from "styled-reset";

const GlobalStyles = createGlobalStyle`
  html {
  }
`;

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<GlobalStyles />
		<Reset />
		<Root />
	</StrictMode>
);
