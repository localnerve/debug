import { defineConfig } from "tsup"
import { spawn } from "child_process"

export default defineConfig({
  entry: { index: "src/index.ts" },
  splitting: false,
  clean: true,
  dts: true,
  target: "es2020",
  format: ["esm"],
  name: "debug",
  minify: "terser",
  terserOptions: {
    compress: true,
  },
  async onSuccess() {
    const process = spawn("npm", ["run", "size"], { shell: true })
    process.stdout.on("data", (data) => console.log(data.toString()))
  },
})
