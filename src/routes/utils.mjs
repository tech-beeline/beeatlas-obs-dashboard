/*
 * Copyright (c) 2024 PJSC VimpelCom
 */
export function jsonContent(schema) {
    if (typeof (schema) === "string") {
        schema = { "$ref": `#/components/schemas/${schema}` }
    };
    return {
        content: {
            "application/json": {
                schema: schema
            }
        }
    }
}

export function stringProp(description, example) {
    return { type: "string", description: description || undefined, example: example || undefined };
}

export function objectSchema(properties) { return { type: "object", properties: properties } };

export function arrayProp(items, description, example) {
    if (typeof (items) === "string") items = { $ref: `#/components/schemas/${items}` };
    return {
        type: "array",
        items: items,
        description: description || undefined,
        example: example || undefined
    }
}


export function pathParam(name, description, example) {
    return {
        name: name,
        in: "path",
        description: description ?? undefined,
        example: example ?? undefined
    };
}