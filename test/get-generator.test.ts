import {describe, expect, it} from "bun:test";
import {GetGenerator} from "../src/lib/generator";

describe('Get Generator', () => {
    it("basic", () => {
        const config = GetGenerator({
            table: "test",
            get: true
        })
        expect(config).toEqual({
            endpoint: null,
            args: {where: {}},
            idAttribute: "id",
            requireAuth: false,
            requireAdmin: false
        })
    })

    it("custom id", () => {
        const config = GetGenerator({
            table: "test",
            idAttribute: "test",
            get: {
                idAttribute: "custom"
            }
        })
        expect(config).toEqual({
            endpoint: null,
            args: {where: {}},
            idAttribute: "custom",
            requireAuth: false,
            requireAdmin: false
        })
    })

    it("custom endpoint", () => {
        const config = GetGenerator({
            table: "test",
            get: {
                endpoint: async (c) => {
                }
            }
        })
        expect(config).toEqual({
            endpoint: expect.any(Function),
            args: {where: {}},
            idAttribute: "id",
            requireAuth: false,
            requireAdmin: false
        })
    })

    it("custom attributes", () => {
        const config = GetGenerator({
            table: "test",
            get: {
                attributes: ["id", "name"]
            }
        })
        expect(config).toEqual({
            endpoint: null,
            args: {where: {}, select: {id: true, name: true}},
            idAttribute: "id",
            requireAuth: false,
            requireAdmin: false
        })
    })

    it("auth required", () => {
        const config = GetGenerator({
            table: "test",
            get: {
                requireAuth: true
            }
        })
        expect(config).toEqual({
            endpoint: null,
            args: {where: {}},
            idAttribute: "id",
            requireAuth: true,
            requireAdmin: false
        })
    })

    it("admin required", () => {
        const config = GetGenerator({
            table: "test",
            get: {
                requireAdmin: true
            }
        })
        expect(config).toEqual({
            endpoint: null,
            args: {where: {}},
            idAttribute: "id",
            requireAuth: true,
            requireAdmin: true
        })
    })

    it("all", () => {
        const config = GetGenerator({
            table: "test",
            idAttribute: "test",
            requireAdmin: true,
            get: {
                idAttribute: "custom",
                endpoint: async (c) => {
                },
                attributes: ["id", "name"],
            }
        })
        expect(config).toEqual({
            endpoint: expect.any(Function),
            args: {where: {}, select: {id: true, name: true}},
            idAttribute: "custom",
            requireAuth: true,
            requireAdmin: true
        })
    })
})