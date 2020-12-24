import ESTree from 'estree'
import { Tree } from './Tree'
import { NodeTypes } from './ast'
const nullFn = () => { }
const context = {
    console
}
export class Literal extends Tree {
    ast!: ESTree.Literal
    constructor(ast: ESTree.Literal) {
        super(ast)
    }
    toCode(): string {
        if (this.ast.value) {
            return this.ast.value.toString();
        }
        return ''
    }

    evaluate() {
        return this.ast.value
    }
}

export class Identifier extends Tree {
    constructor(ast: ESTree.Identifier) {
        super(ast)
    }

    toCode(): string {
        return this.ast.name
    }

    evaluate() {

    }
}

export class MemberExpression extends Tree {
    ast!: ESTree.MemberExpression
    constructor(ast: ESTree.MemberExpression) {
        super(ast)
    }
    toCode(): string {
        let code: string = ''
        switch (this.ast.object.type) {
            case NodeTypes.Identifier: code += new Identifier(this.ast.object).toCode()
        }
        if (this.ast.property) {
            code += '.';
            switch (this.ast.property.type) {
                case NodeTypes.Identifier: code += new Identifier(this.ast.property).toCode()
            }
        }

        return code;
    }
    evaluate(): Function {
        if (this.ast.object.type === NodeTypes.Identifier) {
            if (this.ast.property.type === NodeTypes.Identifier) {
                return context[this.ast.object.name][this.ast.property.name]
            }
        }
        return nullFn
    }
}

export class CallExpression extends Tree {
    ast!: ESTree.CallExpression
    constructor(ast: ESTree.CallExpression) {
        super(ast)
    }
    toCode() {
        let code = ''
        switch (this.ast.callee.type) {
            case NodeTypes.MemberExpression: code += new MemberExpression(this.ast.callee).toCode()
        }
        code += '('
        this.ast.arguments.forEach((arg) => {
            switch (arg.type) {
                case NodeTypes.Literal: code += new Literal(arg).toCode()
            }
        });
        code += ')'
        return code;
    }

    transformArgs() {
        return this.ast.arguments.map((arg) => {
            if (arg.type === NodeTypes.Literal) {
                return new Literal(arg).evaluate()
            }
        })
    }

    evaluate() {
        let fn: Function = nullFn;

        if (this.ast.callee.type === NodeTypes.MemberExpression) {
            fn = new MemberExpression(this.ast.callee).evaluate()
        }

        fn.apply(null, this.transformArgs())

        console.log(2)
    }
}

export class ExpressionStatement extends Tree {
    constructor(ast: ESTree.ExpressionStatement) {
        super(ast)
    }
    toCode(): string {
        let code = ''
        switch (this.ast.expression.type) {
            case 'CallExpression': code += new CallExpression(this.ast.expression).toCode()
        }
        return code;
    }
    evaluate() {
        switch (this.ast.expression.type) {
            case 'CallExpression': new CallExpression(this.ast.expression).evaluate()
        }
    }
}

export class Program extends Tree {
    constructor(ast: ESTree.Program) {
        super(ast)
    }

    toCode(): string {
        let code = ''
        for (const node of this.ast.body) {
            switch (node.type) {
                case 'ExpressionStatement': code += new ExpressionStatement(node).toCode(); break;
                default: console.error('[Program]: unknown node type: ' + node.type)
            }
        }
        return code;
    }

    evaluate() {
        for (const node of this.ast.body) {
            switch (node.type) {
                case 'ExpressionStatement': new ExpressionStatement(node).evaluate(); break;
                default: console.error('[Program]: unknown node type: ' + node.type)
            }
        }
    }
}

