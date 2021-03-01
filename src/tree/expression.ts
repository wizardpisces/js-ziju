import ESTree from 'estree'
import { Tree } from './Tree'
import { NodeTypes } from './ast'
import { Context } from '../environment/context'
import { Kind } from '../environment/Environment'

const nullFn = () => { console.log('Null function called!!!') }
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

    evaluate(context: Context) {
        return context.env.get(this.ast.name)
    }
}


export class BinaryExpression extends Tree {
    ast!: ESTree.BinaryExpression;
    constructor(ast: ESTree.BinaryExpression) {
        super(ast)
    }

    evaluate(context: Context) {

        const opAcMap = {
            '==': (left: ESTree.Literal, right: ESTree.Literal) => left == right,
            '===': (left: ESTree.Literal, right: ESTree.Literal) => left === right,
            '!=': (left: ESTree.Literal, right: ESTree.Literal) => left != right,
            '>=': (left: ESTree.Literal, right: ESTree.Literal) => left >= right,
            '<=': (left: ESTree.Literal, right: ESTree.Literal) => left <= right,

            '>': (left: ESTree.Literal, right: ESTree.Literal) => left > right,
            '<': (left: ESTree.Literal, right: ESTree.Literal) => left < right,
        }
        
        return opAcMap[this.ast.operator](dispatchExpression(this.ast.left, context), dispatchExpression(this.ast.right, context))

    }
}

export class AssignmentExpression extends Tree {
    ast!: ESTree.AssignmentExpression
    constructor(ast: ESTree.AssignmentExpression) {
        super(ast)
    }

    toCode(): string {
        return 'assignment expression code!'
    }

    evaluate(context: Context) {
        if (this.ast.operator === '=') {
            context.env.def((<ESTree.Identifier>this.ast.left).name, dispatchExpression(this.ast.right, context))
        }
    }
}

export class UpdateExpression extends Tree {
    ast!: ESTree.UpdateExpression
    constructor(ast: ESTree.UpdateExpression) {
        super(ast)
    }

    toCode(): string {
        return 'assignment expression code!'
    }

    evaluate(context: Context) {
        if (this.ast.operator === '++') {
            if (this.ast.argument.type === NodeTypes.Identifier) {
                context.env.def(this.ast.argument.name, context.env.get(this.ast.argument.name) + 1)
            }
        }
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

    evaluate(context: Context) {
        let fn: Function = nullFn,
            { callee } = this.ast

        switch (callee.type) {
            case NodeTypes.MemberExpression: fn = new MemberExpression(callee).evaluate();
                break;
            case NodeTypes.Identifier: fn = context.env.get(callee.name, Kind.FunctionDeclaration);
                break;
        }

        fn.apply(null, this.transformArgs())
    }
}


export class ExpressionStatement extends Tree {
    constructor(ast: ESTree.ExpressionStatement) {
        super(ast)
    }
    toCode(): string {
        let code = ''
        switch (this.ast.expression.type) {
            case 'CallExpression': code += new CallExpression(this.ast.expression).toCode();
                break;
        }
        return code;
    }
    evaluate(context: Context) {
        switch (this.ast.expression.type) {
            case 'CallExpression': new CallExpression(this.ast.expression).evaluate(context)
            case 'AssignmentExpression': new AssignmentExpression(this.ast.expression).evaluate(context)
            case 'UpdateExpression': new UpdateExpression(this.ast.expression).evaluate(context)
                break;
        }
    }
}

export function dispatchExpression(expression: ESTree.Expression, context: Context) {
    if (expression.type === NodeTypes.Identifier) {
        return context.env.get(expression.name)
    } else if (expression.type === NodeTypes.Literal) {
        return expression.value
    } else if (expression.type === NodeTypes.BinaryExpression) {
        return new BinaryExpression(expression).evaluate(context)
    }

}