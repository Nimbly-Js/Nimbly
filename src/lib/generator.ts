import {
    CommonProps,
    CreateUpdateGeneratorProps,
    CreateUpdateProps,
    CustomGeneratorProps,
    CustomProps,
    GlobalGeneratorProps,
    RouterProps
} from "./types";

function GlobalGenerator(config: RouterProps, route: CommonProps | boolean | undefined): GlobalGeneratorProps {
    if (!route) return null
    const result: GlobalGeneratorProps = {
        endpoint: null,
        args: {},
        idAttribute: config.idAttribute || "id",
        requireAuth: !!config.requireAuth,
        requireAdmin: !!config.requireAdmin
    }
    if (typeof route !== "boolean") {
        if (route.idAttribute) result.idAttribute = route.idAttribute
        result.endpoint = route.endpoint || null
        if (route.requireAuth) result.requireAuth = route.requireAuth
        if (route.requireAdmin) result.requireAdmin = route.requireAdmin
    }
    if (result.requireAdmin) result.requireAuth = true
    return result
}

function select(attributes: string[]): object {
    const result: any = {}
    for (const value of attributes) {
        result[value] = true
    }
    return result
}

export function GetGenerator(config: RouterProps): GlobalGeneratorProps {
    if (!config.get) return null
    const global = GlobalGenerator(config, config.get)
    if (!global) return null
    global.args = {where: {}}
    if (typeof config.get !== "boolean") {
        if (config.get.attributes) global.args.select = select(config.get.attributes)
    }
    return global
}

export function GetAllGenerator(config: RouterProps): GlobalGeneratorProps {
    if (!config.getAll) return null
    const global = GlobalGenerator(config, config.getAll)
    if (!global) return null
    if (typeof config.getAll !== "boolean") {
        if (config.getAll.max) global.args.take = config.getAll.max
        if (config.getAll.attributes) global.args.select = select(config.getAll.attributes)
        if (config.getAll.orderBy) global.args.orderBy = config.getAll.orderBy
    }
    return global
}

export function DeleteGenerator(config: RouterProps): GlobalGeneratorProps {
    if (!config.delete) return null
    const global = GlobalGenerator(config, config.delete)
    if (!global) return null
    global.args = {where: {}}
    return global
}

export function CreateUpdateGenerator(config: RouterProps, route?: CreateUpdateProps): CreateUpdateGeneratorProps {
    const global = GlobalGenerator(config, route)
    if (!global) return null
    return {
        schema: route!.schema,
        parse: route!.parse || null,
        returnAttributes: route!.returnAttributes || [],
        ...global
    }
}

function CustomGeneratorEndpoint(config: RouterProps, route: CustomProps): CustomGeneratorProps {
    const result: CustomGeneratorProps = {
        endpoint: route.endpoint,
        method: route.method || "get",
        path: route.path || "/",
        requireAuth: !!config.requireAuth,
        requireAdmin: !!config.requireAdmin
    }
    if (route.requireAuth) result.requireAuth = route.requireAuth
    if (route.requireAdmin) result.requireAdmin = route.requireAdmin
    return result
}

export function CustomGenerator(config: RouterProps): CustomGeneratorProps[] | null {
    if (!config.custom) return null
    const result: CustomGeneratorProps[] = []
    if (Array.isArray(config.custom)) {
        for (const value of config.custom) {
            result.push(CustomGeneratorEndpoint(config, value))
        }
    } else {
        result.push(CustomGeneratorEndpoint(config, config.custom))
    }
    return result

}