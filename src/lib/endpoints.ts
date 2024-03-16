import {CreateUpdateGeneratorProps, GlobalGeneratorProps, IContext, ParseError} from "./types";
import {badRequest, conflict, notFound, serverError, success} from "./errors";
import {ZodError} from "zod";
import chalk from "chalk";
import {Router} from "./router";
import {methodColor} from "./debug";

export function GetEnpoint(config: GlobalGeneratorProps, table: string) {
    return async (c: IContext) => {
        const query = {...config!.args}
        query.where[config!.idAttribute] = c.req.param("id")
        // @ts-ignore
        const data = await Router.prisma()[table].findFirst(query)
        if (!data) return notFound(c)
        return success(c, data)
    }
}

export function GetAllEndpoint(config: GlobalGeneratorProps, table: string) {
    return async (c: IContext) => {
        // @ts-ignore
        const data = await Router.prisma()[table].findMany(config.args)
        return success(c, data)
    }
}

function ReturnAttributes(attributes: string[], data: object) {
    if (attributes.length === 0) return null
    let result: any = {}
    for (const value of attributes) {
        // @ts-ignore
        result[value] = data[value]
    }
    return result
}

export function CreateEndpoint(config: CreateUpdateGeneratorProps, table: string) {
    return async (c: IContext) => {
        try {
            const data = await c.req.json()
            let parsed = config!.schema.parse(data)
            if (!parsed) return badRequest(c)
            if (config!.parse) parsed = await config!.parse(c, parsed)

            // @ts-ignore
            const returnData = ReturnAttributes(config!.returnAttributes, await Router.prisma()[table].create({data: parsed}))
            if (returnData) return success(c, returnData)
            return success(c)
        } catch (e: any) {
            if (e instanceof ZodError || e instanceof SyntaxError || e instanceof ParseError)
                return badRequest(c)
            if (e.code === "P2002")
                return conflict(c)
            console.error(e)
            return serverError(c)
        }
    }
}

export function UpdateEndpoint(config: CreateUpdateGeneratorProps, table: string) {
    return async (c: IContext) => {
        try {
            const data = await c.req.json()
            let parsed = config!.schema.parse(data)
            if (!parsed) return badRequest(c)
            if (config!.parse) parsed = await config!.parse(c, parsed)
            const query = {
                where: {
                    [config!.idAttribute]: c.req.param("id")
                },
                data: parsed,
            }
            // @ts-ignore
            const returnData = ReturnAttributes(config!.returnAttributes, await Router.prisma()[table].update(query))
            if (returnData) return success(c, returnData)
            return success(c)
        } catch (e: any) {
            if (e instanceof ZodError || e instanceof SyntaxError || e instanceof ParseError)
                return badRequest(c)
            if (e.code === "P2002")
                return conflict(c)
            console.error(e)
            return serverError(c)
        }
    }
}

export function DeleteEndpoint(config: GlobalGeneratorProps, table: string) {
    return async (c: IContext) => {
        try {

            const query = {
                where: {
                    [config!.idAttribute]: c.req.param("id")
                }
            }
            // @ts-ignore
            await Router.prisma()[table].delete(query)
            return success(c)
        } catch (e: any) {
            if (e.code === "P2025") return notFound(c)
            console.error(e)
            return serverError(c)
        }
    }
}

export async function DebugEndpoint(c: IContext, next: () => Promise<any>) {
    const start = Date.now()
    await next()
    const end = Date.now()
    let id: string | undefined = undefined
    try {
        id = c.req.param("id")
    } catch (e) {
    }
    let method = methodColor(c.req.method, id)
    const status = c.res.status < 400 ? chalk.green(c.res.status) : chalk.red(c.res.status)
    const date = new Date().toUTCString()
    const ms = end - start
    console.log(`${date} - ${method} Route: '${chalk.blue(c.req.path)}', Status: ${status}, Time: ${ms}ms`)
}