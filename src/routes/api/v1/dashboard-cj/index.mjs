/*
 * Copyright (c) 2024 PJSC VimpelCom
 */
import express from "express"
import { arrayProp, jsonContent, objectSchema, stringProp } from "../../../utils.mjs";
import { DashboardCjService } from "../../../../services/index.mjs";

/**
 * 
 * @param {string} request 
 * @param {*} response 
 * @returns 
 */
export async function post(request, response) {
    const cj = request.body;
    return response.json(await DashboardCjService.publishCjDashboard(cj));
}

export const schemas = {};

schemas.StepRelation = objectSchema({
    rps: stringProp(),
    latency: stringProp(),
    errorRate: stringProp(),
    operation: stringProp(),
    interfaceCode: stringProp(),
    productAlias: stringProp(),
    productName: stringProp()
});

schemas.BIStepDto = objectSchema({
    relations: arrayProp("StepRelation")
})

schemas.BIDto = objectSchema({
    name: stringProp(),
    biSteps: arrayProp("BIStepDto")
})

schemas.StepDTO = objectSchema({
    name: stringProp(),
    bi: arrayProp("BIDto")
})
schemas.CJDto = objectSchema({
    name: stringProp("Название CJ"),
    steps: arrayProp("StepDTO")
})

schemas.PostDashboardCJResponse = objectSchema({ path: stringProp() })

export const spec = {
    post: {
        tags: ["Управление дашбордами наблюдаемост E2E процессов"],
        responses: {
            "200": jsonContent(`PostDashboardCJResponse`)
        },
        requestBody: jsonContent(`CJDto`)
    }
}