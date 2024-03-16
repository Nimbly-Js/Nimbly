import {describe, expect, it} from "bun:test";
import {GetAllGenerator} from "../src/lib/generator";

describe('Get All Generator', () => {
    it("basic", () => {
        const config = GetAllGenerator({
            table: "test",
            getAll: true
        })
        expect(config).toEqual({
            endpoint: null,
            args: {},
            idAttribute: "id",
            requireAuth: false,
            requireAdmin: false
        })
    })

    it("custom id", () => {
        const config = GetAllGenerator({
            table: "test",
            idAttribute: "test",
            getAll: {
                idAttribute: "custom"
            }
        })
        expect(config).toEqual({
            endpoint: null,
            args: {},
            idAttribute: "custom",
            requireAuth: false,
            requireAdmin: false
        })
    })

    it("custom endpoint", () => {
        const config = GetAllGenerator({
            table: "test",
            getAll: {
                endpoint: async (c) => {
                }
            }
        })
        expect(config).toEqual({
            endpoint: expect.any(Function),
            args: {},
            idAttribute: "id",
            requireAuth: false,
            requireAdmin: false
        })
    })

    it("custom attributes", () => {
        const config = GetAllGenerator({
            table: "test",
            getAll: {
                attributes: ["id", "name"]
            }
        })
        expect(config).toEqual({
            endpoint: null,
            args: {
                select: {
                    id: true,
                    name: true
                }
            },
            idAttribute: "id",
            requireAuth: false,
            requireAdmin: false
        })
    })

    it("custom max", () => {
        const config = GetAllGenerator({
            table: "test",
            getAll: {
                max: 10
            }
        })
        expect(config).toEqual({
            endpoint: null,
            args: {take: 10},
            idAttribute: "id",
            requireAuth: false,
            requireAdmin: false
        })
    })

    it("custom auth", () => {
            const config = GetAllGenerator({
                table: "test",
                getAll: {
                    requireAuth: true
                }
            })
            expect(config).toEqual({
                endpoint: null,
                args: {},
                idAttribute: "id",
                requireAuth: true,
                requireAdmin: false
            })
        }
    )

    it("custom admin", () => {
        const config = GetAllGenerator({
            table: "test",
            getAll: {
                requireAdmin: true
            }
        })
        expect(config).toEqual({
            endpoint: null,
            args: {},
            idAttribute: "id",
            requireAuth: true,
            requireAdmin: true
        })
    })

    it("all", () => {
        const config = GetAllGenerator({
            table: "test",
            idAttribute: "test",
            getAll: {
                endpoint: async (c) => {
                },
                attributes: ["id", "name"],
                max: 10,
                requireAuth: true,
                requireAdmin: true
            }
        })
        expect(config).toEqual({
            endpoint: expect.any(Function),
            args: {take: 10, select: {id: true, name: true}},
            idAttribute: "test",
            requireAuth: true,
            requireAdmin: true
        })
    })
})