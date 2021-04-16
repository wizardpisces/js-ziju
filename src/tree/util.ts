export const opAcMap = {
    // '=': (left, right) => left = right,
    '||': (left, right) => left || right,
    '&&': (left, right) => left && right,

    '==': (left, right) => left == right,
    '!=': (left, right) => left != right,
    '>=': (left, right) => left >= right,
    '<=': (left, right) => left <= right,

    '>': (left, right) => left > right,
    '<': (left, right) => left < right,

    '+': (left, right) => left + right,
    '-': (left, right) => left - right,
    '/': (left, right) => left / right,
    '*': (left, right) => left * right,
    '%': (left, right) => left % right,

};

let GLOBAL_COUNTER = 0

export function incGlobalCounter(){
    return ++GLOBAL_COUNTER
}

export function getGlobalCounter(){
    return GLOBAL_COUNTER
}