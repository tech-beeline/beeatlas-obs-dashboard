/*
 * Copyright (c) 2024 PJSC VimpelCom
 */
import { NotImplemented } from "../../utils/errors.mjs";
import { Container, Product } from "./model.mjs";

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL;
const getProductApiUrl = (cmdb) => `${PRODUCT_SERVICE_URL}/api/v1/product/${cmdb}/container?show-hidden=true`

/**
 * 
 * @param {string} code 
 * @returns {Promise<Container[]>}
 */
export async function getProductContainersByCode(code) {
    if (!PRODUCT_SERVICE_URL) throw Error(`PRODUCT_SERVICE_URL variable is not specified`);

    const resp = await fetch(getProductApiUrl(code));
    if (!resp.ok) throw Error(`Get product [cmdb=${code}] containers faild: status=${resp.status} text=${await resp.text()}`);

    return resp.json();
}

export const ProductService = {
    getProductContainersByCode: getProductContainersByCode
};