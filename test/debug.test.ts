import assert from 'node:assert'
import { describe, it, beforeEach, afterEach } from "node:test"
import debug from "../src/index.ts"

describe("debug", () => {
  // Mock console.log
  const originalConsoleLog = console.log
  let consoleLogCalls: any[][] = []

  beforeEach(() => {
    // Reset mock calls before each test
    consoleLogCalls = []
    console.log = (...args: any[]) => {
      consoleLogCalls.push(args)
      return originalConsoleLog(...args)
    }
  })

  afterEach(() => {
    // Restore original console.log
    console.log = originalConsoleLog
    // Clear process.env.DEBUG
    delete process.env.DEBUG
  })

  it("should log only if we add DEBUG={namespace} as env var", () => {
    // Test when DEBUG equals the namespace
    process.env.DEBUG = "test-namespace"
    const testDebug = debug("test-namespace")
    testDebug("Test message")
    assert.strictEqual(consoleLogCalls.length, 1)
    assert.strictEqual(consoleLogCalls[0][1], "Test message")

    // Test when DEBUG equals *
    process.env.DEBUG = "*"
    const testDebugWildcard = debug("any-namespace")
    testDebugWildcard("Wildcard test")
    assert.strictEqual(consoleLogCalls.length, 2)
    assert.strictEqual(consoleLogCalls[1][1], "Wildcard test")

    // Test when DEBUG uses wildcard prefix (namespace:*)
    process.env.DEBUG = "prefix:*"
    const testDebugPrefix = debug("prefix:something")
    testDebugPrefix("Prefix test")
    assert.strictEqual(consoleLogCalls.length, 3)
    assert.strictEqual(consoleLogCalls[2][1], "Prefix test")

    // Test when DEBUG doesn't match
    process.env.DEBUG = "different-namespace"
    const testNoDebug = debug("test-namespace")
    testNoDebug("Should not log")
    assert.strictEqual(consoleLogCalls.length, 3) // Count shouldn't increase
  })

  it("should log only logs from a spectific namespace", () => {
    // Create multiple debug loggers with different namespaces
    const debug1 = debug("namespace1")
    const debug2 = debug("namespace2")
    const debug3 = debug("namespace3")

    // Set DEBUG to only match one namespace
    process.env.DEBUG = "namespace2"

    // Call all loggers
    debug1("Message from namespace1")
    debug2("Message from namespace2")
    debug3("Message from namespace3")

    // Verify only namespace2 logged a message
    assert.strictEqual(consoleLogCalls.length, 1)
    assert.strictEqual(consoleLogCalls[0][1], "Message from namespace2")
  })

  it("should not handle undefined namespace", () => {
    process.env.DEBUG = "*"
    const testDebug = debug(undefined)
    testDebug("Test with undefined namespace")
    assert.strictEqual(consoleLogCalls.length, 1)
  })

  it("should log multiple arguments correctly", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    process.env.DEBUG = "test-namespace"
    const testDebug = debug("test-namespace")
    testDebug("First argument", "Second argument", { key: "value" }, 123)
    assert.strictEqual(consoleLogCalls.length, 1)
    assert.strictEqual(consoleLogCalls[0][1], "First argument")
    assert.strictEqual(consoleLogCalls[0][2], "Second argument")
    assert.deepStrictEqual(consoleLogCalls[0][3], { key: "value" })
    assert.strictEqual(consoleLogCalls[0][4], 123)
  })

  it("should not log when DEBUG is not set", () => {
    // DEBUG is already deleted in afterEach
    const testDebug = debug("test-namespace")
    testDebug("Should not log")
    assert.strictEqual(consoleLogCalls.length, 0)
  })

  it("should handle multiple debug namespaces", () => {
    process.env.DEBUG = "one,two,three,fo*,five:*,seven";
    const debug1 = debug("one")
    const debug2 = debug("two")
    const debug3 = debug("three")
    const debug4 = debug("four")
    const debug5 = debug("fort")
    const debug51 = debug("free");
    const debug6 = debug("five:five-test")
    const debug7 = debug("five:five-six")
    const debug71 = debug("fiver:seven-one")
    const debug8 = debug("seven")
    
    debug1("Should log one")
    debug2("Should log two")
    debug3("Should log three")
    debug4("Should log four")
    debug5("Should log fort")
    debug51("Should not log free")
    debug6("Should log five")
    debug7("Should log six")
    debug71("Should not log a similar colon:splat prefix")
    debug8("Should log seven")

    assert.strictEqual(consoleLogCalls.length, 8)
    assert.match(consoleLogCalls[0][0], /one/)
    assert.strictEqual(consoleLogCalls[0][1], "Should log one")
    assert.match(consoleLogCalls[1][0], /two/)
    assert.strictEqual(consoleLogCalls[1][1], "Should log two")
    assert.match(consoleLogCalls[2][0], /three/)
    assert.strictEqual(consoleLogCalls[2][1], "Should log three")
    assert.match(consoleLogCalls[3][0], /four/)
    assert.strictEqual(consoleLogCalls[3][1], "Should log four")
    assert.match(consoleLogCalls[4][0], /fort/)
    assert.strictEqual(consoleLogCalls[4][1], "Should log fort")
    assert.match(consoleLogCalls[5][0], /five/)
    assert.strictEqual(consoleLogCalls[5][1], "Should log five")
    assert.match(consoleLogCalls[6][0], /six/)
    assert.strictEqual(consoleLogCalls[6][1], "Should log six")
    assert.match(consoleLogCalls[7][0], /seven/)
    assert.strictEqual(consoleLogCalls[7][1], "Should log seven")
  })
})
