/*
 * Copyright (c) 2024 PJSC VimpelCom
 */
import Express from "express";

export async function errorHandler(err, request, response, next) {
    console.error(err);
    response.status(err.status || 500).json({ message: err.message });
    next();
}

export { promMetrics, promMiddleware } from "./prom-middleware.mjs";