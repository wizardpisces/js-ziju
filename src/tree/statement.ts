import { Context } from '@/environment/context'
import ESTree from 'estree'
import { NodeTypes } from './ast';
import { BinaryExpression, dispatchExpression } from './expression';
import { Tree } from './Tree'
import { ExpressionStatement } from './expression'
import { VariableDeclaration } from './VariableDeclaration'


export class BlockStatement extends Tree {
    ast!: ESTree.BlockStatement
    constructor(ast: ESTree.BlockStatement) {
        super(ast)
    }
    toCode(): string {// Todos: finish function toCode
        return ''
    }

    evaluate(context: Context) {
        let statements = this.ast.body;
        for(let i=0,len=statements.length;i<len;i++){
            let statement = statements[i];
            if (statement.type === NodeTypes.ExpressionStatement) {
                new ExpressionStatement(statement).evaluate(context)
            } else if (statement.type === NodeTypes.VariableDeclaration) {
                new VariableDeclaration(statement).evaluate(context)
            } else if (statement.type === NodeTypes.WhileStatement) {
                new WhileStatement(statement).evaluate(context)
            } else if (statement.type === NodeTypes.ReturnStatement) {
                /**
                 * interrupt when encounter returnStatement
                 */
                return new ReturnStatement(statement).evaluate(context)
            } else {
                throw Error('Unknown statement ' + statement)
            }
        }

    }
}

export class WhileStatement extends Tree {
    ast!: ESTree.WhileStatement;
    constructor(ast: ESTree.WhileStatement) {
        super(ast)
    }

    evaluate(context: Context) {
        if (this.ast.test.type === NodeTypes.BinaryExpression) {
            let binaryExpression = new BinaryExpression(this.ast.test);
            
            while (binaryExpression.evaluate(context)){
                if(this.ast.body.type === NodeTypes.BlockStatement){
                    new BlockStatement(this.ast.body).evaluate(context)
                }
            }
        }
    }
}

export class ReturnStatement extends Tree {
    ast!: ESTree.ReturnStatement;
    constructor(ast: ESTree.ReturnStatement) {
        super(ast)
    }

    evaluate(context: Context) {
        if (this.ast.argument){
            let result = dispatchExpression(this.ast.argument,context)
            context.env.setReturnValue(result)
        }
    }
}

