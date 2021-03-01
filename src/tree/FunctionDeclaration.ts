import ESTree from 'estree'
import { Tree } from './Tree'
import { Context } from '../environment/context'
import { NodeTypes } from './ast'
import { Environment, Kind } from '../environment/Environment'
import { BlockStatement } from './statement'

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
                    new BlockStatement(body).evaluate({...context, env})
                }
            }, Kind.FunctionDeclaration)
        }
    }
}
