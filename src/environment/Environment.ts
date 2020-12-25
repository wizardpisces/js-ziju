import { NodeTypes } from '../tree/ast';

export type Kind = NodeTypes.FunctionDeclaration

export class Variable {
    private _value: any
    kind: Kind = NodeTypes.FunctionDeclaration // set default as VARIABLE
    constructor(kind: Kind, val: any) {
        this.kind = kind;
        this._value = val;
    }
    get value() {
        return this._value;
    }
    set value(val: any) {
        this._value = val;
    }
}

export class Environment{
    vars: {
        [kind: string]: {
            [name: string]: Variable
        }
    }
    parent!: Environment | null
    constructor(parent: Environment | null) {
        this.vars = Object.create(parent ? parent.vars : null);
        this.parent = parent;
    }

    public extend() {
        return new Environment(this);
    }

    lookup(name: string, kind: Kind) {
        let scope: Environment | null = this;
        while (scope) {
            if (scope.vars[kind] && scope.vars[kind][name])
                return scope;
            scope = scope.parent;
        }
    }

    public get(name: string, kind: Kind = NodeTypes.FunctionDeclaration) {
        let result = this.lookup(name, kind);

        if (result) {
            return result.vars[kind][name].value
        }

        return null;
    }

    public def(name: string, value: any = '', kind: Kind = NodeTypes.FunctionDeclaration) {
        if (!this.vars[kind]) {
            this.vars[kind] = {}
        }
        return this.vars[kind][name] = new Variable(kind, value);
    }
}