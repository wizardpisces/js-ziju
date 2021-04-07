import { NodeTypes } from '../tree/ast';

export enum Kind {
    FunctionDeclaration = NodeTypes['FunctionDeclaration'],
    VariableDeclarator = NodeTypes['VariableDeclarator']
}

export class Variable {
    private _value: any
    kind: Kind = Kind.VariableDeclarator // set default as VariableDeclarator
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

let returnValue: any = undefined
class BaseEnvironment {
    public setReturnValue(value: any = undefined) {
        returnValue = value
    }

    public getReturnValue() {
        /**
         * return value can only be accessed once
         */
        let ret = returnValue
        returnValue = undefined
        return ret;
    }
}

export class Environment extends BaseEnvironment{
    vars: {
        [kind: string]: {
            [name: string]: Variable
        }
    }
    parent!: Environment | null
    constructor(parent: Environment | null) {
        super()
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

    public get(name: string, kind: Kind = Kind.VariableDeclarator) {
        let result = this.lookup(name, kind);

        if (result) {
            return result.vars[kind][name].value
        }

        return null;
    }

    public def(name: string, value: any = '', kind: Kind = Kind.VariableDeclarator) {
        if (!this.vars[kind]) {
            this.vars[kind] = {}
        }
        return this.vars[kind][name] = new Variable(kind, value);
    }
}