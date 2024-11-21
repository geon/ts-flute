import React from "react";
import styled from "styled-components";

// Adapted from https://github.com/simonwhitaker/github-fork-ribbon-css/blob/gh-pages/gh-fork-ribbon.css
const GithubRibbonStyle = styled.a`
	width: 12.1em;
	height: 12.1em;
	position: absolute;
	overflow: hidden;
	top: 0;
	right: 0;
	z-index: 9999;
	pointer-events: none;
	font-size: 13px;
	text-decoration: none;
	text-indent: -999999px;

	&.fixed {
		position: fixed;
	}

	&:hover,
	&:active {
		background-color: rgba(0, 0, 0, 0);
	}

	&:before,
	&:after {
		/* The right and left classes determine the side we attach our banner to */
		position: absolute;
		display: block;
		width: 15.38em;
		height: 1.54em;

		top: 3.23em;
		right: -3.23em;

		box-sizing: content-box;

		transform: rotate(45deg);
	}

	&:before {
		content: "";

		/* Add a bit of padding to give some substance outside the "stitching" */
		padding: 0.38em 0;

		/* Set the base colour */
		background-color: #a00;

		/* Set a gradient: transparent black at the top to almost-transparent black at the bottom */
		background-image: linear-gradient(
			to bottom,
			rgba(0, 0, 0, 0),
			rgba(0, 0, 0, 0.15)
		);

		/* Add a drop shadow */
		box-shadow: 0 0.15em 0.23em 0 rgba(0, 0, 0, 0.5);

		pointer-events: auto;
	}

	&:after {
		/* Set the text from the data-ribbon attribute */
		content: attr(data-ribbon);

		/* Set the text properties */
		color: #fff;
		font: 700 1em "Helvetica Neue", Helvetica, Arial, sans-serif;
		line-height: 1.54em;
		text-decoration: none;
		text-shadow: 0 -0.08em rgba(0, 0, 0, 0.5);
		text-align: center;
		text-indent: 0;

		/* Set the layout properties */
		padding: 0.15em 0;
		margin: 0.15em 0;

		/* Add "stitching" effect */
		border-width: 0.08em 0;
		border-style: dotted;
		border-color: #fff;
		border-color: rgba(255, 255, 255, 0.7);
	}

	&.left-top,
	&.left-bottom {
		right: auto;
		left: 0;
	}

	&.left-bottom,
	&.right-bottom {
		top: auto;
		bottom: 0;
	}

	&.left-top:before,
	&.left-top:after,
	&.left-bottom:before,
	&.left-bottom:after {
		right: auto;
		left: -3.23em;
	}

	&.left-bottom:before,
	&.left-bottom:after,
	&.right-bottom:before,
	&.right-bottom:after {
		top: auto;
		bottom: 3.23em;
	}

	&.left-top:before,
	&.left-top:after,
	&.right-bottom:before,
	&.right-bottom:after {
		transform: rotate(-45deg);
	}
`;

export function GithubRibbon(props: {
	readonly text: string;
	readonly href: string;
}) {
	return (
		<GithubRibbonStyle href={props.href} data-ribbon={props.text}>
			{props.text}
		</GithubRibbonStyle>
	);
}
