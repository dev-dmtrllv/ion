"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equals = void 0;
const equals = (a, b) => {
    if (typeof a === "undefined" || typeof b === "undefined") {
        return a === b;
    }
    for (const p in a) {
        const v = a[p];
        const w = b[p];
        if (typeof v !== typeof w) {
            return false;
        }
        else if (typeof v === "object" && !exports.equals(v, w)) {
            return false;
        }
        else if (Array.isArray(v) && !exports.equals(v, w)) {
            return false;
        }
        else if (v !== w) {
            return false;
        }
    }
    return true;
};
exports.equals = equals;
