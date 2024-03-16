import {Hono} from "hono";
import {ApplicationSettings} from "./types";
import {notFound} from "./errors";
import {readdirSync} from "fs";
import {join} from "path";
import chalk from "chalk";
import {config} from "dotenv";
import {methodColor} from "./debug";
import {breakLine, getEnv, getIps, isDev, printDev, printError, printWarn} from "./utils.js";
import {log, outro} from "@clack/prompts";
import {DebugEndpoint} from "./endpoints.js";

config()

const defaultSettings: ApplicationSettings = {
    port: 3000,
    host: "localhost",
    routesPath: "./src/routes"
}
export default class Application {
    private server: Hono;
    private readonly settings: ApplicationSettings;
    private loaded: boolean = false

    constructor(server: Hono, settings: ApplicationSettings) {
        this.server = server;
        this.settings = {...defaultSettings, ...settings}
        if (isDev()) server.use(DebugEndpoint)
        server.notFound(notFound)
        this.loader()
    }

    private async loader() {
        breakLine()
        const routes = readdirSync(this.settings.routesPath!)
        let count = 0
        for (const route of routes) {
            const filename = route.split(".")[0]
            const routeName = filename.replace(/\s/g, "").toLowerCase()
            const path = this.settings.routesPath + "/" + route
            const absPath = join(process.cwd(), path)
            let router: Hono = await import(absPath)
            // @ts-ignore
            if (router.default) router = router.default
            if (!router) printError("Router must export a Router class using router.export()")
            if (!router.routes || router.routes.length === 0) {
                printWarn(`File ${chalk.blue(path)} skipped because it does not export any routes.`)
                continue
            }
            const endpoints: any = {}
            for (const route of router.routes) {
                const name = methodColor(route.method, route.path === "/:id" ? "id" : undefined)
                if (endpoints[name]) endpoints[name]++
                else endpoints[name] = 1
            }
            const methods = Object.keys(endpoints).map((key) => {
                const count = endpoints[key]
                return key + (count > 1 ? ` x${count}` : "")
            })
            //const methods = router.routes.map((route: any) => methodColor(route.method, route.path === "/:id" ? "id" : undefined))
            this.server.route("/" + routeName, router)
            printDev(`File ${chalk.blue(path)} imported and routed to ${chalk.green("'/" + routeName + "'")}. Actions: ${methods.join(", ")}`)
            count++
        }
        breakLine()
        printDev(chalk.green(count + " route(s) imported."))
        this.loaded = true
    }

    public async serve() {
        while (!this.loaded) await new Promise((r) => setTimeout(r, 100))

        const expose = process.argv.includes("--host")
        let ips = expose ? getIps() : []
        if (ips.length === 0) ips.push(this.settings.host!)

        log.success(`${chalk.bold.whiteBright("Running on")} http://${ips[0]}:${this.settings.port}/`)
        if (!expose) printDev("Use --host to expose")
        printDev("Press Ctrl+C to stop the server.")

        const serve = getEnv() === "bun" ? Bun.serve : (await import('@hono/node-server')).serve

        const config = {
            host: ips[0],
            port: this.settings.port,
            fetch: this.server.fetch
        }

        try {
            serve(config)
        } catch (e: any) {
            log.error(`Failed to start server: ${e}`)
        }

        if (isDev()) outro("Your logs will appear below. Happy coding! 🎉")
    }
}