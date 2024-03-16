import {CustomGeneratorProps, GlobalGeneratorProps, IContext, IEndpoint, RouterProps} from "./types";
import {CreateUpdateGenerator, CustomGenerator, DeleteGenerator, GetAllGenerator, GetGenerator} from "./generator";
import {notAuthorized, serverError} from "./errors";
import {CreateEndpoint, DeleteEndpoint, GetAllEndpoint, GetEnpoint, UpdateEndpoint} from "./endpoints";
import {Hono} from "hono";
import {PrismaClient} from "@prisma/client";
import {printError} from "./utils.js";
import chalk from "chalk";

export class Router {
    route: Hono
    config: RouterProps
    private static db: PrismaClient

    constructor(config: RouterProps) {
        this.config = config
        this.route = new Hono()
    }

    private authHandler(endpoint: IEndpoint, requireAuth: boolean, requireAdmin: boolean): (c: IContext) => Promise<any> {
        return async (c: IContext) => {
            if (requireAuth) {
                // @ts-ignore
                const res = await this.config.authMiddleware(c)
                if (!res) return notAuthorized(c)
                c = res
            }
            if (requireAdmin) {
                // @ts-ignore
                const res = await this.config.adminMiddleware(c)
                if (!res) return notAuthorized(c)
                c = res
            }
            return await endpoint(c)
        }
    }

    private handleMiddleware(config: GlobalGeneratorProps | CustomGeneratorProps, endpoint: IEndpoint) {
        if (config!.requireAuth && !this.config.authMiddleware) throw new Error("AuthOnly route requires authMiddleware")
        if (config!.requireAdmin && !this.config.adminMiddleware) throw new Error("AdminOnly route requires adminMiddleware")
        endpoint = this.authHandler(endpoint, config!.requireAuth, config!.requireAdmin)
        return endpoint
    }

    private customEndpointHandler(endpoint: IEndpoint) {
        return async (c: IContext) => {
            try {
                return await endpoint(c)
            } catch (e) {
                console.error(e)
                return serverError(c)
            }
        }
    }

    private checkTable() {
        if (!this.config.table) throw new Error("Table is required")
    }

    private get() {
        const args = GetGenerator(this.config)
        if (!args) return
        this.checkTable()
        if (!args.endpoint) args.endpoint = GetEnpoint(args, this.config.table!)
        else args.endpoint = this.customEndpointHandler(args.endpoint)
        this.route.get("/:id", this.handleMiddleware(args, args.endpoint))
    }

    private getAll() {
        const args = GetAllGenerator(this.config)
        if (!args) return
        this.checkTable()
        if (!args.endpoint) args.endpoint = GetAllEndpoint(args, this.config.table!)
        else args.endpoint = this.customEndpointHandler(args.endpoint)
        this.route.get("/", this.handleMiddleware(args, args.endpoint))
    }

    private create() {
        const args = CreateUpdateGenerator(this.config, this.config.create)
        if (!args) return
        this.checkTable()
        if (!args.endpoint) args.endpoint = CreateEndpoint(args, this.config.table!)
        else args.endpoint = this.customEndpointHandler(args.endpoint)
        this.route.post("/", this.handleMiddleware(args, args.endpoint))
    }

    private update() {
        const args = CreateUpdateGenerator(this.config, this.config.update)
        if (!args) return
        this.checkTable()
        if (!args.endpoint) args.endpoint = UpdateEndpoint(args, this.config.table!)
        else args.endpoint = this.customEndpointHandler(args.endpoint)
        this.route.put("/:id", this.handleMiddleware(args, args.endpoint))
    }

    private delete() {
        const args = DeleteGenerator(this.config)
        if (!args) return
        this.checkTable()
        if (!args.endpoint) args.endpoint = DeleteEndpoint(args, this.config.table!)
        else args.endpoint = this.customEndpointHandler(args.endpoint)
        this.route.delete("/:id", this.handleMiddleware(args, args.endpoint))
    }

    private custom() {
        const args = CustomGenerator(this.config)
        if (!args) return
        for (const arg of args)
            this.route[arg.method](arg.path, this.handleMiddleware(arg, this.customEndpointHandler(arg.endpoint)))
    }

    static prisma(): PrismaClient {
        if (!this.db) this.db = new PrismaClient()
        return this.db
    }

    export() {
        this.get()
        this.getAll()
        this.create()
        this.update()
        this.delete()
        this.custom()
        if (this.config.table && !Router.prisma()[this.config.table]) printError(`Table ${chalk.blue("'" + this.config.table + "'")} does not exist in prisma schema.`)
        return this.route
    }
}