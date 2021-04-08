import { Context } from '@/environment/context'
import ESTree from 'estree'
import { NodeTypes } from './ast';
import { BinaryExpression, dispatchExpressionEvaluation } from './expression';
import { Tree } from './Tree'
import { ExpressionStatement } from './expression'
import { VariableDeclaration } from './VariableDeclaration'
import { FunctionDeclaration } from './FunctionDeclaration';


export class BlockStatement extends Tree {
    ast!: ESTree.BlockStatement
    constructor(ast: ESTree.BlockStatement) {
        super(ast)
    }
    toCode(): string {// Todos: finish function toCode
        return ''
    }

    evaluate(context: Context): boolean {
        return this.ast.body.every((statement: ESTree.Statement) => dispatchStatementEvaluation(statement, context))
    }
}
export class ReturnStatement extends Tree {
    ast!: ESTree.ReturnStatement;
    constructor(ast: ESTree.ReturnStatement) {
        super(ast)
    }

    evaluate(context: Context): false {
        if (this.ast.argument) {
            let result = dispatchExpressionEvaluation(this.ast.argument, context)
            context.env.setReturnValue(result)
        }

        return false
    }
}

export class WhileStatement extends Tree {
    ast!: ESTree.WhileStatement;
    constructor(ast: ESTree.WhileStatement) {
        super(ast)
    }

    evaluate(context: Context): boolean {
        if (this.ast.test.type === NodeTypes.BinaryExpression) {
            let binaryExpression = new BinaryExpression(this.ast.test);

            while (binaryExpression.evaluate(context)) {
                if (this.ast.body.type === NodeTypes.BlockStatement) {
                    return new BlockStatement(this.ast.body).evaluate(context)
                }
            }
        }
        return true
    }
}
export class IfStatement extends Tree {
    ast!: ESTree.IfStatement;
    constructor(ast: ESTree.IfStatement) {
        super(ast)
    }

    evaluate(context: Context): boolean {
        if (this.ast.test.type === NodeTypes.BinaryExpression) {
            let binaryExpression = new BinaryExpression(this.ast.test);
            if (binaryExpression.evaluate(context)) {
                if (this.ast.consequent.type === NodeTypes.BlockStatement) {
                    return new BlockStatement(this.ast.consequent).evaluate(context)
                }
            } else {
                if (this.ast.alternate) {
                    if (this.ast.alternate.type === NodeTypes.BlockStatement) {
                        return new BlockStatement(this.ast.alternate).evaluate(context)
                    }
                }
            }
        }

        return true
    }
}

/**
 * statement which contains blockStatement evaluate should return boolean 
 * to skip latter evaluation when encounter return interruption
 */

export function dispatchStatementEvaluation(statement: ESTree.Statement, context: Context): boolean {

    switch (statement.type) {
        case NodeTypes.ExpressionStatement: new ExpressionStatement(statement).evaluate(context); break;
        case NodeTypes.FunctionDeclaration: new FunctionDeclaration(statement).evaluate(context); break;
        case NodeTypes.VariableDeclaration: new VariableDeclaration(statement).evaluate(context); break;
        case NodeTypes.WhileStatement: return new WhileStatement(statement).evaluate(context)
        case NodeTypes.IfStatement: return new IfStatement(statement).evaluate(context)
        case NodeTypes.ReturnStatement: return new ReturnStatement(statement).evaluate(context)
        default: throw Error('Unknown statement ' + statement)
    }
    
    return true;
}

export function dispatchStatementCompile(statement: ESTree.Statement, context: Context): boolean {

    switch (statement.type) {
        case NodeTypes.ExpressionStatement: new ExpressionStatement(statement).evaluate(context); break;
        case NodeTypes.FunctionDeclaration: new FunctionDeclaration(statement).evaluate(context); break;
        case NodeTypes.VariableDeclaration: new VariableDeclaration(statement).evaluate(context); break;
        case NodeTypes.WhileStatement: return new WhileStatement(statement).evaluate(context)
        case NodeTypes.IfStatement: return new IfStatement(statement).evaluate(context)
        case NodeTypes.ReturnStatement: return new ReturnStatement(statement).evaluate(context)
        default: throw Error('Unknown statement ' + statement)
    }

    return true;
}
