import {IContext} from "./types";

export function notAuthorized(c: IContext) {
    return c.json({error: "Not Authorized"}, 401)
}

export function badRequest(c: IContext) {
    return c.json({error: "Bad Request"}, 400)
}

export function serverError(c: IContext) {
    return c.json({error: "Server Error"}, 500)
}

export function notFound(c: IContext) {
    return c.json({error: "Not Found"}, 404)
}

export function success(c: IContext, data?: any) {
    return c.json(data ? {
        data
    } : {
        message: "Success"
    }, 200)
}

export function conflict(c: IContext) {
    return c.json({error: "Conflict"}, 409)
}