#!/usr/bin/env node

import chalk from "chalk";
import {intro, log, outro} from "@clack/prompts";
import pckg from "../package.json" assert {type: "json"};
import {spawn} from "child_process";
import path from "path";
import {existsSync} from "fs";

function getEntryPoint() {
    if (process.argv.length < 3) {
        log.error("Missing entry point")
        process.exit(1)
    }
    if (!path.extname(process.argv[2])) {
        log.error("Please provide a valid entry point")
        process.exit(1)
    }

    if (!existsSync(process.argv[2])) {
        log.error("Entry point not found")
        process.exit(1)
    }
    return process.argv[2]
}

const bun = typeof Bun !== "undefined"
const version = pckg.version

console.clear()
intro(chalk.bgHex("#9b19c2").whiteBright(" Nimbly ") + " " + chalk.hex("#9b19c2")(`v${version}`))

const entryPoint = getEntryPoint()

if (bun) log.info("Runtime: " + chalk.bgBlueBright.whiteBright(" Bun ") + " v" + Bun.version)
else log.info("Runtime: " + chalk.bgGreenBright.whiteBright(" Node.js ") + " " + process.version)


const expose = process.argv.includes("--host")
const arg = expose ? " --host" : ""

const childProcess = spawn(bun ? "bun run --hot " + entryPoint + arg : "node " + entryPoint + arg, {
    shell: true,
    stdio: 'inherit',
    detached: true,
})

childProcess.on('close', (code) => {
    if (code && code !== 0)
        log.error(`Script exited with code ${code}.`);
});

process.on('SIGINT', () => {
    childProcess.kill();
    process.exit();
});

process.on('exit', (e) => {
    childProcess.kill()
    if (e === 0) outro(`See you soon! 🚀`);
})
