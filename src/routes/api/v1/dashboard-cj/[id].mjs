/*
 * Copyright (c) 2024 PJSC VimpelCom
 */
import expess from 'express'
import { BadRequest } from "../../../../utils/errors.mjs";
import { jsonContent, pathParam } from "../../../utils.mjs";
import { DashboardCjService } from '../../../../services/index.mjs';

/**
 * 
 * @param {expess.Request} request 
 * @param {expess.Response} respone 
 */
export async function put(request, respone) {
    const id = request.params.id;
    if (!id) BadRequest('Id not specified');
    respone.json(await DashboardCjService.publishCjDashboardById(id));
}

export const spec = {
    put: {
        tags: ["Управление дашбордами наблюдаемост E2E процессов"],
        parameters: [
            pathParam("id")
        ],
        responses: {
            "200": jsonContent(`PostDashboardCJResponse`)
        },
        requestBody: {}
    }
}