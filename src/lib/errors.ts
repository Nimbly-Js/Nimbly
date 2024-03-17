import {IContext} from "./types";
import {STATUS_CODES} from "http";

export function generic(c: IContext) {
    return (code: number, data?: any) => c.json({
        success: code < 400,
        data: code < 400 ? data || null : null,
        error: code >= 400 ? {
            code,
            message: STATUS_CODES[code]
        } : null
    }, {
        status: code
    })
}

export function notAuthorized(c: IContext) {
    return generic(c)(401)
}

export function badRequest(c: IContext) {
    return generic(c)(400)
}

export function serverError(c: IContext) {
    return generic(c)(500)
}

export function notFound(c: IContext) {
    return generic(c)(404)
}

export function success(c: IContext, data?: any) {
    return generic(c)(200, data)
}

export function conflict(c: IContext) {
    return generic(c)(409)
}