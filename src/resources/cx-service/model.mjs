/*
 * Copyright (c) 2024 PJSC VimpelCom
 */
export class StepRelation {
    interfaceCode;
    interfaceId;
    interefaceName;
    operation;
    operationId;
    productAlias;
    productId;
    productName;
    tcCode;
    tcName;
    rps;
    latency;
    errorRate;
}

export class BIStepDto {
    id;
    errorRate;
    latency;
    name;
    /**@type {Array<StepRelation>} */
    relations;
}

export class BIDto {
    /**@type {string} */
    name;
    /**@type {Array<BIStepDto>} */
    biSteps;
    /**@type {StepRelation[]} */
    operations;
}

export class CJStep {
    /**@type {string} */
    name;
    /**@type {Array<BIDto>} */
    bi;
}

export class CJDto {
    id;
    bpmn;
    createdDate;
    /**@type {string} */
    name;
    /**@type {string} */
    uniqueIdent;
    /** @type {Array<CJStep>} */
    steps;
}