import {Context} from "hono";
import {ZodObject} from "zod";

export type IMiddleware = (c: IContext) => Promise<IContext | null>
export type IEndpoint = (c: IContext) => Promise<any>
export type IParser = (c: IContext, data: object) => Promise<object>

export interface IContext extends Context {
    user?: any
    end?: (code: number, data?: any) => Response
}

export type CommonProps = {
    idAttribute?: string
    requireAuth?: boolean
    requireAdmin?: boolean
    endpoint?: IEndpoint
}

type CommonGetProps = CommonProps & {
    orderBy?: object
    attributes?: string[]
}

type GetAllProps = CommonGetProps & {
    max?: number
}

export type CreateUpdateProps = CommonProps & {
    schema: ZodObject<any>
    returnAttributes?: string[]
    parse?: IParser
}

export type RouterProps = {
    table?: string
    idAttribute?: string
    authMiddleware?: IMiddleware
    adminMiddleware?: IMiddleware
    requireAuth?: boolean
    requireAdmin?: boolean
    get?: boolean | CommonGetProps
    getAll?: boolean | GetAllProps
    create?: CreateUpdateProps
    update?: CreateUpdateProps
    delete?: boolean | CommonProps,
    custom?: CustomProps | CustomProps[]
}

type Method = "get" | "post" | "put" | "delete"

export type CustomProps = {
    method?: Method
    path?: string
    endpoint: IEndpoint,
    requireAuth?: boolean
    requireAdmin?: boolean
}

export type CustomGeneratorProps = {
    endpoint: IEndpoint
    requireAuth: boolean
    requireAdmin: boolean
    method: Method
    path: string
}

export type GlobalGeneratorProps = {
    idAttribute: string
    endpoint: IEndpoint | null
    args: any
    requireAuth: boolean
    requireAdmin: boolean
} | null

export type CreateUpdateGeneratorProps = GlobalGeneratorProps & {
    schema: ZodObject<any>
    returnAttributes: string[]
    parse: IParser | null
} | null

export class ParseError extends Error {
    constructor() {
        super("Parsing error")
    }
}

export type ApplicationSettings = {
    host?: string
    port?: number
    routesPath?: string
}