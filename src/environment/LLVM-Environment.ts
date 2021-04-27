export type LLVMNamePointer = { type: 'i64' | 'void' | 'i64*' | string, value: string };
type Locals = Record<string, LLVMNamePointer>;

export type LLVMNamePointerPartial = Partial<LLVMNamePointer> | string
export default class Scope {
    locals: Locals = {}
    constructor() {
        this.locals = {};
    }

    symbol(prefix: string | LLVMNamePointerPartial = 'sym'): LLVMNamePointer {
        const nth = Object.keys(this.locals).length + 1;
        if (typeof prefix === 'string') {
            return this.register(prefix + nth);
        } else {
            if (!prefix.value) {
                prefix.value = 'sym'
            }

            prefix.value = prefix.value + nth
            return this.register(prefix)
        }
    }

    get(name: string): LLVMNamePointer {
        return this.locals[name];
    }

    register(param: string | LLVMNamePointerPartial): LLVMNamePointer {
        let type:LLVMNamePointer['type'] = 'i64', name = '';

        if (typeof param === 'object') {
            name = param.value ? param.value : name;
            type = param.type ? param.type : type
        } else if(typeof param === 'string'){
            name = param
        }

        if(name === ''){
            name ='sym'
        }

        let safeName: string = name.replace('-', '_');
        let n = 1;
        while (this.locals[safeName]) {
            safeName = name + n++;
        }

        this.locals[name] = {
            value: safeName,
            type: type,
        };
        return this.locals[name];
    }

    copy(): Scope {
        const c = new Scope();
        c.locals = { ...this.locals };
        return c;
    }
}
export class LLVMEnvironment {
    scope!: Scope
    tail_call_enabled: boolean = false
    tailCallTree: string[]
    constructor() {
        this.scope = new Scope();
        this.tailCallTree = [];
    }

    copy() {
        const c = new LLVMEnvironment();
        c.tailCallTree = [...this.tailCallTree];
        c.scope = this.scope.copy();
        return c;
    }
}

