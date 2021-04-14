import { Context, X86Context } from '@/environment/context'
import ESTree from 'estree'
import { NodeTypes } from './ast';
import { BinaryExpression, dispatchExpressionCompile, dispatchExpressionEvaluation } from './expression';
import { Tree } from './Tree'
import { ExpressionStatement } from './expression'
import { VariableDeclaration } from './VariableDeclaration'
import { Environment, Kind } from '../environment/Environment';

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

    compile(context:X86Context,depth:number=0){
        return this.ast.body.every((statement: ESTree.Statement) => dispatchStatementCompile(statement, context, depth))
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

    compile(context:X86Context,depth:number=0){
        if (this.ast.argument) {
            dispatchExpressionCompile(this.ast.argument, context, depth)
        }

        /**
         * save whatever to RAX for return
         * TODOS: how to resolve function without a return
         */
        // context.emit(depth,'MOV RAX, [RSP]');

        // context.emit(depth, `POP RAX`);

        return false;
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

export class FunctionDeclaration extends Tree {
    ast!: ESTree.FunctionDeclaration
    constructor(ast: ESTree.FunctionDeclaration) {
        super(ast)
    }
    toCode(): string {// Todos: finish function toCode
        return ''
    }

    evaluate(context: Context) {
        let { body, id, params } = this.ast

        if (id) {
            let makeFunction = function () {
                let env: Environment = context.env.extend()

                params.forEach((param, i) => {
                    if (param.type === NodeTypes.Identifier && arguments[i]) {
                        env.def(param.name, arguments[i])
                    }
                })

                if (body.type === NodeTypes.BlockStatement) {
                    new BlockStatement(body).evaluate({ ...context, env })
                }
            }

            context.env.def(id.name, makeFunction, Kind.FunctionDeclaration)
        }
    }

    compile(context: X86Context, depth: number = 0) {
        depth++;
        let { body, id, params } = this.ast
        let safe = 'defaultFunctionName'
        
        // Add this function to outer scope
        if(id){
            safe = context.env.assign(id.name);
        }else{
            throw Error('Do not support function name null yet!!')
        }

        // Copy outer scope so parameter mappings aren't exposed in outer scope.
        const childScope = context.env.copy();

        context.emit(0, `${safe}:`);
        context.emit(depth, `PUSH RBP`);
        context.emit(depth, `MOV RBP, RSP\n`);

        // Copy params into local scope
        // NOTE: context doesn't actually copy into the local stack, it
        // just references them from the caller. They will need to
        // be copied in to support mutation of arguments if that's
        // ever a desire.
        params.forEach((param:ESTree.Pattern, i) => {
            if (param.type === NodeTypes.Identifier) {
                /**
                 * keep param offset from RBP when invoked, 
                 * which will be used to fetch real value in function body(compiled in BlockStatement)
                 */
                childScope.map[param.name] = -1 * (params.length - i - 1 + 2);
            } else {
                throw Error('Unknown param type ' + param.type)
            }
        });

        context.env = childScope
        // Pass childScope in for reference when body is compiled.
        new BlockStatement(body).compile(context,depth)

        // Save the return value
        // context.emit(0, '');
        context.emit(depth, `POP RAX`);
        context.emit(depth, `POP RBP\n`);

        context.emit(depth, 'RET\n');
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

export function dispatchStatementCompile(statement: ESTree.Statement, context: X86Context, depth:number=0): boolean {

    switch (statement.type) {
        case NodeTypes.ExpressionStatement: new ExpressionStatement(statement).compile(context, depth); break;
        case NodeTypes.FunctionDeclaration: new FunctionDeclaration(statement).compile(context, depth); break;
        // case NodeTypes.VariableDeclaration: new VariableDeclaration(statement).evaluate(context); break;
        // case NodeTypes.WhileStatement: return new WhileStatement(statement).evaluate(context)
        // case NodeTypes.IfStatement: return new IfStatement(statement).evaluate(context)
        case NodeTypes.ReturnStatement: return new ReturnStatement(statement).compile(context,depth);
        default: throw Error('Unknown statement ' + statement)
    }

    return true;
}
