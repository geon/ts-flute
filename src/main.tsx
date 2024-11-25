import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Root } from "./ui/Root.tsx";
import { Reset } from "styled-reset";
import { GlobalStyles } from "./ui/GlobalStyles.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<GlobalStyles />
		<Reset />
		<Root />
	</StrictMode>
);
