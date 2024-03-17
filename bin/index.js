#!/usr/bin/env node

import chalk from "chalk";
import {intro, log, outro} from "@clack/prompts";
import pckg from "../package.json" assert {type: "json"};
import {spawn} from "child_process";
import {extname, join} from "path";
import {existsSync, readdirSync} from "fs";

const bun = typeof Bun !== "undefined"
const version = pckg.version
const expose = process.argv.includes("--host")
let childProcess = null

function getEntryPoint() {
    if (!extname(process.argv[2])) {
        log.error("Please provide a valid entry point")
        process.exit(1)
    }

    if (!existsSync(process.argv[2])) {
        log.error("Entry point not found")
        process.exit(1)
    }
    return process.argv[2]
}

function getFiles() {
    if (process.argv.length < 4) {
        log.error("Please provide a routes folder")
        process.exit(1)
    }

    if (!existsSync(process.argv[3])) {
        log.error("Routes folder not found")
        process.exit(1)
    }

    const files = readdirSync(process.argv[3]).filter(file => file.endsWith('.ts') || file.endsWith('.js'))
    if (files.length === 0) {
        log.error("No files found in routes folder")
        process.exit(1)
    }

    return files
}

function runServer() {
    const entryPoint = getEntryPoint()
    const arg = expose ? " --host" : ""

    childProcess = spawn(bun ? "bun run --hot " + entryPoint + arg : "node " + entryPoint + arg, {
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
}

function addEndpoint(keys, method, obj) {
    if (keys.length === 0) return method;
    const key = keys.shift();
    if (!obj[key]) obj[key] = addEndpoint(keys, method, {});
    else obj[key] = addEndpoint(keys, method, obj[key]);
    return obj;
}

function printObjectTree(obj, routesInfos, depth = 0, last = false) {
    const count = last && depth > 1 ? depth - 1 : depth
    const indent = chalk.grey('│  '.repeat(count)) + (last ? "   " : "")
    Object.entries(obj).forEach(([key, value], index, array) => {
        const isLast = index === array.length - 1
        const infos = depth === 0 ? (routesInfos[key].requireAdmin ? " ⭐" : (routesInfos[key].requireAuth ? " 🔒" : " 🚫")) : ""
        key = depth === 0 ? chalk.bgCyanBright.whiteBright(`${key}`) : (typeof value !== "string" ? chalk.bgYellow.whiteBright(`${key}`) : chalk.bgMagenta.whiteBright(`${key}`));
        const lineBranch = chalk.grey((depth !== 0 && isLast) ? '└─ ' : '├─ ');
        if (typeof value === 'object' && value !== null) {
            console.log(`${indent}${lineBranch}${key}${infos}`);
            printObjectTree(value, routesInfos, depth + 1, isLast);
        } else
            console.log(`${indent}${lineBranch}${key} ${value}`);
        if (depth === 0 && !isLast) console.log(chalk.grey("│"));
    });
}

function parseEndpoint(endpoint, path) {
    const hasParams = path[path.length - 1].includes(":")
    let custom = false
    const res = {
        action: "",
        text: "",
    }
    if (endpoint.method === "GET")
        res.action = hasParams ? "GET ONE" : "GET"
    else if (endpoint.method === "POST")
        res.action = "CREATE"
    else if (endpoint.method === "PUT")
        res.action = "UPDATE"
    else if (endpoint.method === "DELETE")
        res.action = "DELETE"
    else {
        custom = true
        res.action = "CUSTOM"
    }
    res.action = chalk.bgMagenta.whiteBright(" " + res.action + " ")
    res.text = (custom ? chalk.white(`(${endpoint.method}) `) : "") + (endpoint.config.requireAdmin ? "⭐ " : (endpoint.config.requireAuth ? "🔒 " : "🚫"))
    return res
}

async function analyze() {
    const files = getFiles()
    let routes = {}
    let routesInfos = {}
    log.info("⭐: Admin only, 🔒: Authentication required, 🚫: No authentication required")
    console.log(chalk.grey("│  " + chalk.bgCyanBright.whiteBright(" Route ") + ", " + chalk.bgYellow.whiteBright(" Path ") + ", " + chalk.bgMagenta.whiteBright(" Action ") + "\n│"))
    for (const file of files) {
        const routeName = file.split(".")[0].replace(/\s/g, "").toLowerCase()
        const filePath = join(process.cwd(), process.argv[3], file)
        let router = await import(filePath)
        if (!router || !router.default) continue
        router = router.default
        for (const r of router.routes) {
            let p = (routeName + r.path).split("/").filter(p => p !== "")
            const endpoint = parseEndpoint(r, p)
            p.push(endpoint.action)
            routes = addEndpoint(p, endpoint.text, routes)
            if (r.config)
                routesInfos[routeName] = {
                    requireAuth: r.config.config.requireAuth || false,
                    requireAdmin: r.config.config.requireAdmin || false
                }
        }
    }
    printObjectTree(routes, routesInfos)
}

function main() {
    console.clear()
    intro(chalk.bgHex("#9b19c2").whiteBright(" Nimbly ") + " " + chalk.hex("#9b19c2")(`v${version}`))

    if (bun) log.info("Runtime: " + chalk.bgBlueBright.whiteBright(" Bun ") + " v" + Bun.version)
    else log.info("Runtime: " + chalk.bgGreenBright.whiteBright(" Node.js ") + " " + process.version)

    if (process.argv.length < 3) {
        log.error("Missing arguments")
        process.exit(1)
    }

    if (process.argv[2] === "analyze") analyze()
    else runServer()
}

main()

process.on('exit', (e) => {
    if (childProcess) childProcess.kill()
    if (e === 0) outro(`See you soon! 🚀`);
})