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
}
