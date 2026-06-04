import { styleText } from "node:util"
import debugOriginal from "debug"
import debugWbe from "@localnerve/debug"

// Enable logs for both libraries but redirect to null
// This allows the libraries to run their code paths but without the I/O overhead
// UPDATE: This actually only works on debugWbe, debug original's env is cached and we have to set it manually.
process.env.DEBUG = "*"

// Redirect console output during benchmarking
const originalConsoleLog = console.log
let originalStderrWrite = process.stderr.write

const disableConsoleOutput = () => {
  // Silence both standard error and standard output safely
  process.stderr.write = () => true as any
  console.log = () => {}
}

const restoreConsoleOutput = () => {
  process.stderr.write = originalStderrWrite
  console.log = originalConsoleLog
}

// Function to format numbers with commas for better readability
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

/**
 * Benchmark class to compare @wbe/debug vs debug performances
 */
class Benchmark {
  private readonly iterations: number
  private readonly warmupIterations: number
  private results: {
    debugOriginal: number
    debugWbe: number
  }
  private testMessages: any[]

  constructor(iterations: number = 100000, warmupIterations: number = 1000) {
    this.iterations = iterations
    this.warmupIterations = warmupIterations
    this.results = {
      debugOriginal: 0,
      debugWbe: 0,
    }

    // Create a variety of test messages to use in benchmarks
    this.testMessages = [
      "Simple string message",
      ["Array", "of", "strings"],
      { complex: "object", with: { nested: "properties" } },
      ["Mixed", 123, { type: "content" }],
    ]
  }

  /**
   * Run warmup phase to initialize both libraries
   */
  private warmup(): void {
    console.log(styleText("dim", "Warming up..."))

    // manually set debug original
    debugOriginal.enable(process.env.DEBUG ?? '');

    const logOriginal = debugOriginal("bench:original:warmup")
    const logWbe = debugWbe("bench:wbe:warmup")

    disableConsoleOutput()
    for (let i = 0; i < this.warmupIterations; i++) {
      logOriginal("warmup")
      logWbe("warmup")
    }
    restoreConsoleOutput()
  }

  /**
   * Benchmark the original debug library
   */
  private benchmarkOriginal(): void {
    console.log(
      styleText(["blue", "bold"],
        `\nBenchmarking ${styleText("underline", "original debug")} library...`
      )
    )

    const logOriginal = debugOriginal("bench:original")
    
    disableConsoleOutput()
    const start = process.hrtime.bigint()

    for (let i = 0; i < this.iterations; i++) {
      const msgIndex = i % this.testMessages.length
      logOriginal(this.testMessages[msgIndex])
    }

    const end = process.hrtime.bigint()
    restoreConsoleOutput()
    
    this.results.debugOriginal = Number(end - start) / 1_000_000 // Convert to ms
  }

  /**
   * Benchmark the @wbe/debug library
   */
  private benchmarkWbe(): void {
    console.log(
      styleText(["green", "bold"],
        `\nBenchmarking ${styleText("underline", "@wbe/debug")} library...`
      )
    )

    const logWbe = debugWbe("bench:wbe")
    
    disableConsoleOutput()
    const start = process.hrtime.bigint()

    for (let i = 0; i < this.iterations; i++) {
      const msgIndex = i % this.testMessages.length
      logWbe(this.testMessages[msgIndex])
    }

    const end = process.hrtime.bigint()
    restoreConsoleOutput()
    
    this.results.debugWbe = Number(end - start) / 1_000_000 // Convert to ms
  }

  /**
   * Display the benchmark results
   */
  private displayResults(): void {
    console.log("\n" + styleText(["yellow", "bold"], "=".repeat(50)))
    console.log(styleText(["yellow", "bold"], "          BENCHMARK RESULTS"))
    console.log(styleText(["yellow", "bold"], "=".repeat(50)) + "\n")

    const { debugOriginal, debugWbe } = this.results

    console.log(
      `Total iterations per library: ${styleText("bold",
        formatNumber(this.iterations)
      )}`
    )
    console.log(
      `Test messages: ${styleText("dim", JSON.stringify(this.testMessages))}\n`
    )

    // Calculate per-operation times
    const originalPerOp = debugOriginal / this.iterations
    const wbePerOp = debugWbe / this.iterations

    // Display the results for the original debug library
    console.log(styleText(["blue", "bold"], "Original debug:"))
    console.log(`  Total time: ${styleText("bold", (debugOriginal.toFixed(2) + " ms"))}`)
    console.log(
      `  Per operation: ${styleText("bold", originalPerOp.toFixed(6) + " ms")}\n`
    )

    // Display the results for @wbe/debug
    console.log(styleText(["green", "bold"], "@wbe/debug:"))
    console.log(`  Total time: ${styleText("bold", debugWbe.toFixed(2) + " ms")}`)
    console.log(`  Per operation: ${styleText("bold", wbePerOp.toFixed(6) + " ms")}\n`)

    // Display the difference
    const diff = debugWbe - debugOriginal
    console.log(
      `Absolute difference: ${styleText("bold", Math.abs(diff).toFixed(2) + " ms")}`
    )

    // Calculate which one is faster
    if (debugWbe < debugOriginal) {
      const percentFaster = ((debugOriginal / debugWbe - 1) * 100).toFixed(2)
      console.log(
        styleText(["green", "bold"],
          `@wbe/debug is ${percentFaster}% faster than original debug`
        )
      )
    } else {
      const percentFaster = ((debugWbe / debugOriginal - 1) * 100).toFixed(2)
      console.log(
        styleText(["blue", "bold"],
          `Original debug is ${percentFaster}% faster than @wbe/debug`
        )
      )
    }

    // Display a simple visualization of the results
    this.displayVisualization()
  }

  /**
   * Display a simple ASCII visualization of the benchmark results
   */
  private displayVisualization(): void {
    const { debugOriginal, debugWbe } = this.results
    const maxTime = Math.max(debugOriginal, debugWbe)

    // Calculate bar lengths (max 40 chars)
    const maxBarLength = 40
    const originalBarLength = Math.round(
      (debugOriginal / maxTime) * maxBarLength
    )
    const wbeBarLength = Math.round((debugWbe / maxTime) * maxBarLength)

    console.log("\n" + styleText(["yellow", "bold"], "Performance Comparison:"))

    // Original debug bar
    process.stdout.write(styleText(["blue", "bold"], "Original debug: "))
    process.stdout.write(styleText("blue", "█".repeat(originalBarLength)))
    console.log(` ${debugOriginal.toFixed(2)} ms`)

    // @wbe/debug bar
    process.stdout.write(styleText(["green", "bold"], "@wbe/debug:     "))
    process.stdout.write(styleText("green", "█".repeat(wbeBarLength)))
    console.log(` ${debugWbe.toFixed(2)} ms`)

    console.log("\n" + styleText(["yellow", "bold"], "=".repeat(50)))
  }

  /**
   * Run the complete benchmark
   */
  public async run(): Promise<void> {
    console.log(
      styleText("bold", "\n🚀 Starting Node.js benchmark: @wbe/debug vs debug")
    )
    console.log(
      styleText("dim", `Running with ${formatNumber(this.iterations)} iterations`)
    )

    // First warm up
    this.warmup()

    // Benchmark original debug
    this.benchmarkOriginal()

    // Benchmark @wbe/debug
    this.benchmarkWbe()

    // Display results
    this.displayResults()
  }
}

// Run the benchmark with 100,000 iterations
const benchmark = new Benchmark(100000)
benchmark.run().catch(console.error)
