import {log} from "@clack/prompts";
import chalk from "chalk";
import {networkInterfaces} from "os";

export function isDev() {
    return !(process.env.NODE_ENV === "production")
}

export function printDev(msg: string, space = false) {
    if (isDev()) {
        if (!space) console.log(chalk.gray("│  ") + msg)
        else log.message(msg, {})
    }
}

export function printWarn(msg: string) {
    console.log(chalk.yellow("▲ "), msg)
}

export function breakLine() {
    if (isDev()) console.log(chalk.gray("│"))
}

export function printError(msg: string) {
    log.error(msg)
    process.exit(1)
}

export function getEnv(): 'bun' | 'nodejs' {
    return typeof Bun !== "undefined" ? 'bun' : 'nodejs'
}

export function getIps(): string[] {
    return Object.values(networkInterfaces())
        .flat()
        .filter((iface) => iface && iface.family === "IPv4")
        .filter((iface) => iface!.address !== "127.0.0.1")
        .map((iface) => iface!.address)
}