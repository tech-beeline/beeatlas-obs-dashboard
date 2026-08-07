/*
 * Copyright (c) 2024 PJSC VimpelCom
 */
export class Operation {
    name;
    type;
    /**@type {{rps, errorRate, latency}} */
    sla;
    id;
}

export class Interface {
    code;
    id;
    name;
    /** @type {Operation[]} */
    operations;
}
export class Container {
    id;
    name;
    code;
    /**@type {Interface[]} */
    interfaces;
}

export class Product {

}