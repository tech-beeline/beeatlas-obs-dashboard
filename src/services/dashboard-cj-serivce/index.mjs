/*
 * Copyright (c) 2024 PJSC VimpelCom
 */
import { getCjById } from "../../resources/cx-service/index.mjs";
import { NotImplemented } from "../../utils/errors.mjs";
import { GrafanaService, ProductService } from "../../resources/index.mjs";
import { BIDto, CJDto, StepRelation } from "../../resources/cx-service/model.mjs";
import { Dashboard, Panel, Target } from "../../resources/grafana/model.mjs";
import { dashboardUIDFromUrl, E2E_FOLDER_UID, E2E_TEMAPLTE_UID, GRAFANA_URL } from "../../resources/grafana/const.mjs";
import { Operation } from "../../resources/product-service/model.mjs";


const DEFAULT_METRIC_SOURCE = process.env.DEFAULT_METRIC_SOURCE;
const DEFAULT_METRIC_SOURCE_UID = dashboardUIDFromUrl(DEFAULT_METRIC_SOURCE);

const BI_TITLE = "{bi-title}";
const START_BI_STEP_TITLE = "1. {bi-step-title}";
const END_BI_STEP_TITLE = "{bi-step-end}";

const LATENCY_TRASHOLD_TARGET = "LatencyThreshold";
const RPS_TRASHOLD_TARGET = "RPSThreshold";
const ERROR_RATE_TRASHOLD_TARGET = "ErrorThreshold";
/**
 * 
 * @param {CJDto} cj 
 * @returns {Array<BIDto>}
 */
function buildBiList(cj) {
    const bi_list = [];
    for (const step of cj.steps) {
        console.log(step.name);
        for (const bi of step.bi) {
            //console.log(`${step.name}/${bi.name}`);
            for (const bi_step of bi.biSteps) {
                console.log(`${step.name}/${bi.name}/${bi_step.name}`);
                const operation_list = bi_step.relations.filter(r => r.operation);
                if (operation_list.length) {
                    operation_list.forEach(o => o.name = `${bi_step.name}[${o.operation}]`);
                    bi_step.operation_list = operation_list;
                }
            }
            bi.biSteps = bi.biSteps.filter(b => b.operation_list);
            if (bi.biSteps.length) {
                bi.operations = bi.biSteps.reduce((a, v) => (a.push(...v.operation_list), a), []);
                bi.FQName = `${step.name}/${bi.name}`;
                bi_list.push(bi);
            }
        }
    }
    return bi_list;
}

/**
 * 
 * @param {Dashboard} dashboard 
 */
async function metricSourceFromDashboard(dashboard, sources_cache = {}) {
    const datasource_var = dashboard.templating.list.find(v => v.name === "DATASOURCE");
    if (!sources_cache[datasource_var.current.value]) {
        sources_cache[datasource_var.current.value] = await GrafanaService.getDatasourceByName(datasource_var.current.value);
    }

    return {
        datasource: sources_cache[datasource_var.current.value],
        targets: dashboard.panels[0]?.targets
    };
}
const caseInsensitive = (str) => str.replaceAll(/[a-zA-Z]/g, (s) => `[${s.toLowerCase()}${s.toUpperCase()}]`);

export function queryFromTemplate(template, operation) {
    const [http_method, path] = operation.split(' ').filter(it => it.length);
    const uri_regex = path?.split('/')
        .map(a => a.startsWith('{') && a.endsWith('}') ? `([^\\/]+)` : caseInsensitive(a))
        .join('\\/');
    let variables = {
        REGEX_URI: uri_regex, "REGEX_URI:raw": uri_regex,
        URI: path,
        METHOD: http_method
    };

    let ret = template;
    for (let v in variables) {
        ret = ret.replaceAll("${" + v + "}", variables[v]).replaceAll(`$${v}`, variables[v]);
    }
    return ret;
}
const TARGET_QUERY_FIELDS = ["expr", "rawSql", "query"];
/**
 * 
 * @param {Panel} panel 
 * @param {Target[]} template 
 * @param {*} operation 
 */
function applyTargets(panel, targets_template, operation) {
    const REF_ID_MAP = {
        A75: "P75", A95: "P95", B: "R", C: "ERR"
    }

    for (const t of targets_template) {
        const s = panel.targets.find(i => i.refId === (REF_ID_MAP[t.refId] || t.refId));
        if (s) {
            const refid = s.refId;
            Object.assign(s, t);
            s.refId = refid;
            for (const n of TARGET_QUERY_FIELDS) {
                if (t[n])
                    s[n] = queryFromTemplate(t[n], operation)
            }
            s.datasource = panel.datasource;
        }
    }
}

/**
 * 
 * @param {Panel} panel 
 * @param {*} latency 
 * @param {*} rps 
 * @param {*} error_rate 
 */
function applySLA(panel, latency, rps, error_rate) {
    const latency_target = panel.targets?.find(t => t.refId === LATENCY_TRASHOLD_TARGET);
    if (latency_target)
        latency_target.expression = `${latency}`;

    const rps_target = panel.targets?.find(t => t.refId === RPS_TRASHOLD_TARGET);
    if (rps_target)
        rps_target.expression = `${rps}`;

    const error_rate_target = panel.targets?.find(t => t.refId === ERROR_RATE_TRASHOLD_TARGET);
    if (error_rate_target)
        error_rate_target.expression = `${error_rate}`;

}

function gridPosByIndex(i, y_pos, max_width = 24, h = 2, w = 1) {
    return {
        h: h, w: w, x: w * (i % max_width), y: y_pos + Math.floor(i / max_width) * h
    }
}

/**
 * 
 * @param {Dashboard} dashboard 
 */
function getDetailsPanels(dashboard) {
    const bi_panel = dashboard.panels.find(p => p.title === BI_TITLE);
    const panels = (bi_panel && bi_panel.collapsed && bi_panel.panels) || dashboard.panels;

    let f = false;
    const result = [];
    for (const p of panels) {
        if (p.title == END_BI_STEP_TITLE)
            return result;
        if (p.title == START_BI_STEP_TITLE)
            f = true;
        if (f)
            result.push(p);
    }
    return result;
}
/**
 * 
 * @param {CJDto} cj 
 */
export async function publishCjDashboard(cj) {

    const [e2e_template, default_source_dashboard] = await Promise.all([
        GrafanaService.getE2ETemplate(),
        GrafanaService.getDashboard(DEFAULT_METRIC_SOURCE_UID)
    ]);

    const bi_list = buildBiList(cj);

    if (!default_source_dashboard) throw Error('default_source is null');
    const default_source = await metricSourceFromDashboard(default_source_dashboard.dashboard);

    const title_template = e2e_template.dashboard.panels.find(p => p.title === "#cj-title");
    const dashboard = new Dashboard();
    dashboard.title = cj.name;
    if (title_template)
        dashboard.panels.push({ ...title_template, title: cj.name });

    const stat_template = e2e_template.dashboard.panels.find(p => p.title === "{bi-step-stat}");
    if (!stat_template) throw Error("panel template {bi-step-stat} not found");

    const bi_title_panel = e2e_template.dashboard.panels.find(p => p.title === BI_TITLE);
    const step_panels = getDetailsPanels(e2e_template.dashboard);

    let id = 10;
    for (const bi of bi_list) {
        for (const operation of bi.operations) {
            /**@type {Panel} */
            const stat_panel = JSON.parse(JSON.stringify(stat_template));
            stat_panel.datasource = { type: default_source.datasource.type, uid: default_source.datasource.uid };
            stat_panel.description = bi.FQName + "-" + operation.name;
            stat_panel.title = `${id - 9}`;
            stat_panel.gridPos = gridPosByIndex(id - 10,
                title_template.gridPos.y + title_template.gridPos.h)

            applyTargets(stat_panel, default_source.targets, operation.operation);
            applySLA(stat_panel,
                operation.latency || -1,
                operation.rps || -1,
                operation.errorRate || -1);

            dashboard.panels.push(stat_panel);
            operation.stat = stat_panel;
            stat_panel.id = id++;
        }
    }

    const step_h = step_panels[step_panels.length - 1].gridPos.y
        + step_panels[step_panels.length - 1].gridPos.h
        - step_panels[0].gridPos.y;

    for (const bi of bi_list) {
        /**@type {Panel} */
        const bi_panel = { ...bi_title_panel, title: bi.FQName, panels: [], id: id++ };
        dashboard.panels.push(bi_panel);

        for (let i = 0; i < bi.operations.length; i++) {
            for (const template of step_panels) {
                const operation = bi.operations[i];
                /**@type {Panel} */
                const panel = JSON.parse(JSON.stringify(template));
                panel.id = id++;
                panel.gridPos.y += i * step_h;
                if (panel.title === START_BI_STEP_TITLE)
                    panel.title = operation.name;
                for (const t of panel.targets || []) {
                    t.panelId = operation.stat.id;
                }
                bi_panel.panels.push(panel);
            }
        }
    }


    const result = await GrafanaService.postDashboard(null, dashboard, E2E_FOLDER_UID);
    result.path = `${GRAFANA_URL}${result.url}`;
    console.log( result);
    return result;

}

/**
 * 
 * @param {*} operations 
 * @param {StepRelation} relation 
 */
function updateSLAFromProduct(operations, relation) {
    /**@type {Operation} */
    const op = operations[relation.operationId];
    if (op?.sla) {
        Object.assign(relation, op.sla);
    }
}
/**
 * 
 * @param {CJDto} cj 
 */
async function updateSLA(cj) {
    const products = {};
    for (const step of cj.steps) {
        for (const bi of step.bi) {
            for (const bi_step of bi.biSteps) {
                for (const rel of bi_step.relations?.filter(r => r.operationId) ?? []) {
                    /** @type {{handlers :[]}} */
                    const p = products[rel.productAlias] || (products[rel.productAlias] = { handlers: [] });
                    p.handlers.push((p) => updateSLAFromProduct(p, rel));
                }
            }
        }
    }

    await Promise.all(
        Object.entries(products).map(async ([code, { handlers }]) => {
            const containers = await ProductService.getProductContainersByCode(code);
            const operation_map = {};
            for (const c of containers) {
                for (const api of c.interfaces) {
                    for (const op of api.operations) {
                        operation_map[op.id] = op;
                    }
                }
            }

            for (const h of handlers) {
                h(operation_map);
            }
        })
    );
}

export async function publishCjDashboardById(id) {
    const cj = await getCjById(id);
    await updateSLA(cj);
    return await publishCjDashboard( cj);
}

export const DashboardCjService = {
    publishCjDashboard: publishCjDashboard,
    publishCjDashboardById: publishCjDashboardById
}