/*
 * Copyright (c) 2024 PJSC VimpelCom
 */
import { NotImplemented } from "../../utils/errors.mjs";
export { dashboardUIDFromUrl } from "./const.mjs"
import {
    DASHBOARD_API_PATH,
    DASHBOARD_BY_UID_PATH,
    DATASOURCE_BY_NAME_PATH,
    E2E_TEMAPLTE_UID,
    GRAFANA_HTTP_OPTIONS,
    GRAFANA_URL
} from "./const.mjs";
import {
    Dashboard,
    Meta
} from "./model.mjs";

export async function postDashboard(uid, dashboard, folderUid) {
    const body = {
        folderUid: folderUid,
        overwrite: true,
        dashboard: dashboard
    };
    const op = {
        ...GRAFANA_HTTP_OPTIONS,
        body: JSON.stringify(body),
        method: "POST"
    };
    op.headers["Content-Type"] = 'application/json';
    const res = await fetch(`${GRAFANA_URL}${DASHBOARD_API_PATH}`, op);;
    if (!res.ok) throw Error(`post dashbaord failed: ${await res.text()}`);
    return res.json();
}

/**
 * 
 * @param {string} uid 
 * @returns {Promise<{dashboard: Dashboard, meta: Meta}>}
 */
export async function getDashboard(uid) {
    const res = await fetch(`${GRAFANA_URL}${DASHBOARD_BY_UID_PATH}${uid}`, GRAFANA_HTTP_OPTIONS);
    if (!res.ok) throw Error(`get grafana dashboard failed: ${await res.text()}`);
    return res.json();
}

export async function getE2ETemplate() {
    return getDashboard(E2E_TEMAPLTE_UID);
}

export async function getDatasourceByName(name) {
    const res = await fetch(`${GRAFANA_URL}${DATASOURCE_BY_NAME_PATH}${name}`, GRAFANA_HTTP_OPTIONS);
    if (!res.ok) throw Error(`get datasource by name failed: ${await res.text()}`);
    return res.json();
}

export const GrafanaService = {
    getDashboard: getDashboard,
    getE2ETemplate: getE2ETemplate,
    postDashboard: postDashboard,
    getDatasourceByName: getDatasourceByName
}