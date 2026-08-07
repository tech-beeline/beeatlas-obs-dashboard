/*
 * Copyright (c) 2024 PJSC VimpelCom
 */
import express from "express"
import { buildRoutes } from "../fs-router/index..mjs";






/**
 * 
 * @param {express.Application} app 
 */
export async function addApiRoutes(app) {

    const route_info = await buildRoutes(import.meta.dirname);
    app.use('/', route_info.router);
}

