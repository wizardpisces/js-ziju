import ESTree from 'estree'
import { Tree } from './Tree'
import { Context } from './context'
import { NodeTypes } from './ast'
import { ExpressionStatement } from './OtherTree'
import { Environment } from '@/environment/Environment'

export class FunctionDeclaration extends Tree {
    ast!: ESTree.FunctionDeclaration
    constructor(ast: ESTree.FunctionDeclaration) {
        super(ast)
    }
    toCode(): string {// Todos: finish function toCode
        return ''
    }

    evaluate(context: Context) {
        let { body, id } = this.ast

        if (id) {
            context.env.def(id.name, function () {
                let env: Environment = context.env.extend()
                if (body.type === NodeTypes.BlockStatement) {
                    body.body.forEach((node) => {
                        if (node.type === NodeTypes.ExpressionStatement) {
                            new ExpressionStatement(node).evaluate({ ...context, env })
                        }
                    })
                }
            })
        }
    }
}
