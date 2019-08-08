[//]: # (Readme partial used by an default readme page)

## Main features

*   recursive file operations
*   Typescript types included
*   exposes esm/cjs modules
*   always 100% test coverage

## Guide

*   [Installation](#installation "Installation")
*   [Basic usage](#basicusage "Basic usage")
*   [API documentation](#documentation "Documentation")

## Installation

<pre>npm install --save aii</pre>

or

<pre>yarn add aii</pre>

or

<pre>pnpm --save aii</pre>

## Basic usage

Aii main method replaces provided string or regex match with another text.

### Replace string or regex match with another string in all files below path

<pre>const Aii = require('aii@.0.3').Aii;
const aii = new Aii();

function async run(){
    await aii.replace('some-text', 'path');
}
run();</pre>
