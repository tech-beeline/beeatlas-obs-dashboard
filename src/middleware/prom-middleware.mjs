/*
 * Copyright (c) 2024 PJSC VimpelCom
 */
import client from 'prom-client'
import Express from "express"

const register = new client.Registry()

const httpRequestDurationMicroseconds = new client.Histogram(
    {
        name: 'http_server_requests_seconds',
        help: 'Duration of HTTP requests in microseconds',
        labelNames: ['method', 'path', 'code', 'status', 'uri'],
    });



register.setDefaultLabels({
    system: 'FDMSHOWCASEAPP', container: 'obs-dashboard', interface: 'dashboard-api'
});

register.registerMetric(httpRequestDurationMicroseconds)
/**
 * 
 * @param {exporess.Request} req 
 * @param {*} res 
 * @param {*} next 
 */
export async function promMetrics(req, res, next) {
    res.setHeader('Content-Type', register.contentType)
    res.send(await register.metrics());
}

/**
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 * @param {*} next 
 */
export async function promMiddleware(req, res, next) {
    const end = httpRequestDurationMicroseconds.startTimer();
    res.on("finish", () => {
        const path = req.route?.path;
        const labels = {
            path: req.url,
            uri: req.url,
            status: res.statusCode,
            code: res.statusCode,
            method: req.method.toUpperCase()
        };
        end(labels);
    })
    next();
}
