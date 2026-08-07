/*
 * Copyright (c) 2024 PJSC VimpelCom
 */

export const GRAFANA_URL = process.env.GRAFANA_URL;
if (!GRAFANA_URL) throw Error('GRAFANA_URL not specified');

const DASHBOARD_UID_REGEXP = new RegExp(`${GRAFANA_URL}/d/(.*)/.*`)
const FOLDER_UID_REGEXP = new RegExp(`${GRAFANA_URL}/dashboards/f/(.*)/.*`)

export const DASHBOARD_BY_UID_PATH = "/api/dashboards/uid/";
export const DASHBOARD_API_PATH = "/api/dashboards/db";
export const DATASOURCE_BY_NAME_PATH = "/api/datasources/name/";

export function dashboardUIDFromUrl(url) {
    if (!url) return null;
    const r = url.match(DASHBOARD_UID_REGEXP);
    if (r && r.length > 1) return r[1];
    return null;
}


function folderUIDFromUrl(url) {
    if (!url) return null;
    const r = url.match(FOLDER_UID_REGEXP);
    if (r && r.length > 1) return r[1];
    return null;
}

const GRAFANA_ACCESS_TOKEN = process.env.GRAFANA_ACCESS_TOKEN;
const E2E_TEMPLATE_URL = process.env.E2E_TEMPLATE_URL;

if (!E2E_TEMPLATE_URL) throw Error('E2E_TEMPLATE_URL not specified');

export const E2E_TEMAPLTE_UID = dashboardUIDFromUrl(E2E_TEMPLATE_URL)
if (!E2E_TEMAPLTE_UID) throw Error("E2E_TEMAPLTE_UID is not specified");

// [ ] - Сделать rejectUnauthorized как опцию
export const GRAFANA_HTTP_OPTIONS = GRAFANA_ACCESS_TOKEN ?
    {
        headers: { 'Authorization': `Bearer ${GRAFANA_ACCESS_TOKEN}` }
    } :
    {};


const E2E_FOLDER = process.env.E2E_FOLDER;
export const E2E_FOLDER_UID = folderUIDFromUrl(E2E_FOLDER);