/*
 * Copyright (c) 2024 PJSC VimpelCom
 */
import { NotImplemented } from "../../utils/errors.mjs";
import { CJDto } from "./model.mjs";


const CX_SERVICE_URL = process.env.CX_SERVICE_URL;
const formatCjPath = (id) => `${CX_SERVICE_URL}/api/cx/v1/product/cj/${id}`;



const CX_SERVICE_HEADER = (() => {
    try {
        const cx_header_string = process.env.CX_SERVICE_HEADER || "{}";
        return JSON.parse(cx_header_string);
    } catch (error) {
        throw Error(`read CX_SERVICE_HEADER failed: ${error.message}`, { cause: error });
    }
})();


/**
 * 
 * @param {*} id 
 * @returns {Promise<CJDto>}
 */
export async function getCjById(id) {
    if (!CX_SERVICE_URL) throw Error("CX_SERVICE_URL is not specified");

    const resp = await fetch(formatCjPath(id), { headers: CX_SERVICE_HEADER });
    if (!resp.ok) {
        throw Error(`get CJ by id failed: ${resp.status}: ${await resp.text()}`);
    }
    return resp.json();
}

export const CxService = {
    getCjById: getCjById
}