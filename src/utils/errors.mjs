/*
 * Copyright (c) 2024 PJSC VimpelCom
 */
export function NotImplemented(message) {
    throw Error(message ?? "not implemented");
}

export function BadRequest(message) {
    const error = new Error(message)
    error.status = 404;
    throw error;
}