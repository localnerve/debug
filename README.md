# @localnerve/debug

Tiny debug tool (~600 bytes) for terminal and browser inspired by [debug-js/debug](https://github.com/debug-js/debug) API.

![](https://img.shields.io/npm/v/@localnerve/debug/latest.svg)
![](https://github.com/localnerve/debug/workflows/ci/badge.svg)
![](https://img.shields.io/npm/dt/@localnerve/debug.svg)
![](https://img.shields.io/npm/l/@localnerve/debug.svg)

![](screen.jpg)

## Motivation

Forked from `@wbe/debug`, this was built in order to be as light as possible for terminal and browser,
as the same way as the great debug-js/debug tool, with a few added debug-js/debug parity features.
The package is less than 10k unpacked on disk, and published directly from Github with provenance.

## Installation

```shell script
$ npm i @localnerve/debug
```

## debug node

```shell
DEBUG=* node file.js
```

file.js:

```js
import debug from "@localnerve/debug"
const log = debug("namespace")
log("hello") // "namespace hello"
```

`process.env.DEBUG` value can be defined as a specific namespace too:

```shell
DEBUG=namespace-1 node file.js
```

Only debug function declaration with `namespace-1` declared as namespace will be printed in the console:

```js
import debug from "@localnerve/debug"
const log = debug("namespace-1")
log("hello") // "namespace-1 hello"
```

`process.env.DEBUG` value accept "one glob parameter level":

```shell
DEBUG=config:* node file.js
```

Every debug function declaration with namespace `config:{somestring}` will be logged.

## debug in browser

In the same way as nodejs usage, `debug` is browser compatible with the same API. The only difference is
we need to set the current namespace in localStorage.

Add on your browser localStorage:

```shell
localStorage.debug = "foo"
```

Use debug in javascript:

```js
// es6 import
import debug from "@localnerve/debug"
const log = debug("foo")
log("bar") // "foo bar"
```

## Examples

Install dependencies:

Start example:

```shell
# browser example
npm run dev:example-browser
# node example
npm run dev:example-dev
```

## Credits

Willy Brauner

## Licence

MIT
