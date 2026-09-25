import assert from "node:assert"
import { afterEach, beforeEach, describe, it } from "node:test"
import debug from "../src/index.ts"

describe("debug in a browser environment", () => {
  const originalConsoleLog = console.log
  const originalDateNow = Date.now
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, "window")
  const localStorageDescriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage")
  let debugSetting: string | null = null
  let consoleLogCalls: any[][] = []

  beforeEach(() => {
    debugSetting = null
    consoleLogCalls = []
    Object.defineProperty(globalThis, "window", { configurable: true, value: {} })
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: { getItem: (key: string) => key === "debug" ? debugSetting : null },
    })
    console.log = (...args: any[]) => {
      consoleLogCalls.push(args)
    }
  })

  afterEach(() => {
    console.log = originalConsoleLog
    Date.now = originalDateNow
    if (windowDescriptor) {
      Object.defineProperty(globalThis, "window", windowDescriptor)
    } else {
      delete (globalThis as { window?: unknown }).window
    }
    if (localStorageDescriptor) {
      Object.defineProperty(globalThis, "localStorage", localStorageDescriptor)
    } else {
      delete (globalThis as { localStorage?: unknown }).localStorage
    }
  })

  it("uses browser formatting, elapsed time, and localStorage debug settings", () => {
    Date.now = () => 10_000
    debugSetting = "browser:test"

    const testDebug = debug("browser:test")
    testDebug("message", { value: 1 })

    assert.strictEqual(consoleLogCalls.length, 1)
    assert.strictEqual(consoleLogCalls[0][0], "%cbrowser:test %cmessage %o %c+0ms")
    assert.match(consoleLogCalls[0][1], /^color: rgb\(\d+, \d+, \d+\);$/)
    assert.strictEqual(consoleLogCalls[0][2], "color: inherit")
    assert.deepStrictEqual(consoleLogCalls[0][3], { value: 1 })

    Date.now = () => 12_500
    testDebug("later")
    assert.strictEqual(consoleLogCalls[1][0], "%cbrowser:test %clater %c+2s")

    debugSetting = "*"
    debug("browser:without-elapsed", false)("plain")
    assert.strictEqual(consoleLogCalls[2][0], "%cbrowser:without-elapsed %cplain")

    debugSetting = "other"
    testDebug("filtered")
    assert.strictEqual(consoleLogCalls.length, 3)

    debugSetting = "*"
    for (let index = 0; index <= 1_000; index++) {
      debug(`browser:cleanup:${index}`)("cleanup")
    }
    assert.strictEqual(consoleLogCalls.length, 1_004)
  })
})