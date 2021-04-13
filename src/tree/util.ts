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