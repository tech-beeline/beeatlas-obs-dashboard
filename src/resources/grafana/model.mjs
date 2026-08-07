/*
 * Copyright (c) 2024 PJSC VimpelCom
 */
export class Meta {

};


export class Target {
    refId;
    datasource;
    expr;
    query;
    rawSql;
    panelId;
    expression;
}

export class Panel {
    type;
    title;
    /** @type {{x,y,h,w}} */
    gridPos;
    id;
    /**@type { { types}} */
    datasource;
    /** @type {Array<Target>} */
    targets;
    /**@type {string} */
    description;
    /** @type {boolean} */
    collapsed;
    /**@type {Array<Panel>} */
    panels;
}

export class Variable {
    /**@type { {value, text}} */
    current;
    name;
}

export class Templating {
    /** @type {Array<Variable>} */
    list;
}
export class Dashboard {
    /**@type {Array<Panel>} */
    panels = [];
    title;
    uid;
    /**@type { Templating} */
    templating;
}