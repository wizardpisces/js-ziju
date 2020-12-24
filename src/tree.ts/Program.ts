import ESTree from 'estree'
import { Tree } from './Tree'

export class Identifier extends Tree {
    constructor(json: ESTree.Identifier) {
        super(json)
    }
    toCode(): string {
        return this.json.name
    }
}

export class MemberExpression extends Tree {
    json!: ESTree.MemberExpression
    constructor(json: ESTree.MemberExpression) {
        super(json)
    }
    toCode(): string {
        let code: string = ''
        switch (this.json.object.type) {
            case 'Identifier': code += new Identifier(this.json.object).toCode()
        }
        if (this.json.property) {
            code += '.';
            switch (this.json.property.type) {
                case 'Identifier': code += new Identifier(this.json.property).toCode()
            }
        }

        return code;
    }
}


export class Literal extends Tree {
    json!: ESTree.Literal
    constructor(json: ESTree.Literal) {
        super(json)
    }
    toCode():string {
        if(this.json.value){
            return this.json.value.toString();
        }
        return ''
    }
}

export class CallExpression extends Tree {
    json!: ESTree.CallExpression
    constructor(json: ESTree.CallExpression) {
        super(json)
    }
    toCode() {
        let code = ''
        switch (this.json.callee.type) {
            case 'MemberExpression': code += new MemberExpression(this.json.callee).toCode()
        }
        code += '('
        this.json.arguments.forEach((arg) => {
            switch (arg.type) {
                case 'Literal': code += new Literal(arg).toCode()
            }
        });
        code += ')'
        return code;
    }
}

export class ExpressionStatement extends Tree {
    constructor(json: ESTree.ExpressionStatement) {
        super(json)
    }
    toCode(): string {
        let code = ''
        switch (this.json.expression.type) {
            case 'CallExpression': code += new CallExpression(this.json.expression).toCode()
        }
        return code;
    }
}

export class Program extends Tree {
    constructor(json: ESTree.Program) {
        super(json)
    }
    toCode(): string {
        let code = ''
        for (const node of this.json.body) {
            switch (node.type) {
                case 'ExpressionStatement': code += new ExpressionStatement(node).toCode()
                default: console.error('[Program]: unknowb node type: '+node.type)
            }
        }
        return code;
    }
}