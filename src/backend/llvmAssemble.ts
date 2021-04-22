export type NamePointer = { type: string, value: string };
type Locals = Record<string, NamePointer>;

export default class Scope {
    locals: Locals = {}
    constructor() {
        this.locals = {};
    }

    symbol(prefix = 'sym'): NamePointer {
        const nth = Object.keys(this.locals).length + 1;
        return this.register(prefix + nth);
    }

    get(name: string): NamePointer {
        return this.locals[name];
    }

    register(name: string): NamePointer {
        let safeName: string = name.replace('-', '_');
        let n = 1;
        while (this.locals[safeName]) {
            safeName = name + n++;
        }

        this.locals[name] = {
            value: safeName,
            type: 'i64',
        };
        return this.locals[name];
    }

    copy(): Scope {
        const c = new Scope();
        c.locals = { ...this.locals };
        return c;
    }
}

export class Context {
    scope!: Scope
    tailCallTree: string[]
    constructor() {
        this.scope = new Scope();
        this.tailCallTree = [];
    }

    copy() {
        const c = new Context();
        c.tailCallTree = [...this.tailCallTree];
        c.scope = this.scope.copy();
        return c;
    }
}

