/*
 * Copyright (c) 2024 PJSC VimpelCom
 */
import express from 'express';
import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';


const HTTP_METHODS = ["post", "get", "put"];


/**
 * 
 * @param {string} url 
 */
const buildSwaggerPath = (url) => url.split(/[\\\/]/)
    .map(s => s.startsWith('[') && s.endsWith(']') ? `{${s.substring(1, s.length - 1)}}` : s)
    .join('/');

/**
 * 
 * @param {string} url 
 */
const buildExpressPath = (url) => url.split(/[\\\/]/)
    .map(s => s.startsWith('[') && s.endsWith(']') ? `:${s.substring(1, s.length - 1)}` : s)
    .join('/');


export async function buildRoutes(dir) {

    const router = express.Router();

    const paths = {
    };

    const swagger_schemas = {}

    const swagger_document = {
        openapi: "3.0.3",
        info: {
            title: "Управление техническими возможностями",
            description: "Управление техническими возможностями и их реализацией",
            version: "0.1",
            contact: {
                email: "dev@local"
            }
        },
        paths: paths,
        components: {
            schemas: swagger_schemas
        }
    };

    const files = fs.readdirSync(dir, { recursive: true, withFileTypes: true }).filter(e => e.isFile() && e.parentPath);

    for (const f of files) {
        const p = path.relative(dir, f.parentPath).replaceAll('\\', '/');

        if (!p.length)
            continue;

        const module = await import(`file://${f.parentPath}/${f.name}`);

        const module_spec = module.spec;
        if (module.schemas)
            Object.assign(swagger_schemas, module.schemas);


        for (const m of HTTP_METHODS) {
            const handler = module[m];
            if (handler) {

                const filename = path.parse(f.name).name;
                const handler_path = filename === "index" ? `/${p}` : `/${p}/${filename}`;

                const swagger_path = buildSwaggerPath(handler_path);

                const endpoints = paths[swagger_path] || (paths[swagger_path] = {});
                endpoints[m] = {};
                endpoints[m].tags = module_spec?.[m]?.tags;
                endpoints[m].requestBody = module_spec?.[m]?.requestBody || undefined;
                endpoints[m].responses = module_spec?.[m]?.responses ?? {};
                endpoints[m].parameters = module_spec?.[m]?.parameters ?? undefined;

                router[m](buildExpressPath(handler_path), handler);
            }
        }
    }

    router.get("/api-docs/swagger.json", (req, res) => res.json(swagger_document));
    router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swagger_document));

    return { router: router, swagger: swagger_document }
}