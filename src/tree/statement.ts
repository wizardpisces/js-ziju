import { Context } from '@/environment/context'
import ESTree from 'estree'
import { NodeTypes } from './ast';
import { BinaryExpression } from './expression';
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
        let env = context.env
        this.ast.body.forEach((node) => {
            if (node.type === NodeTypes.ExpressionStatement) {
                new ExpressionStatement(node).evaluate({ ...context, env })
            } else if (node.type === NodeTypes.VariableDeclaration) {
                new VariableDeclaration(node).evaluate({ ...context, env })
            } else if (node.type === NodeTypes.WhileStatement) {
                new WhileStatement(node).evaluate({ ...context, env })
            }
        })
    }
}

export class WhileStatement extends Tree {
    ast!: ESTree.WhileStatement;
    constructor(ast: ESTree.WhileStatement) {
        super(ast)
    }

    evaluate(context: Context) {
        if (this.ast.test.type === NodeTypes.BinaryExpression) {
            while (new BinaryExpression(this.ast.test).evaluate(context)){
                if(this.ast.body.type === NodeTypes.BlockStatement){
                    new BlockStatement(this.ast.body).evaluate(context)
                }
            }
        }
    }
}
