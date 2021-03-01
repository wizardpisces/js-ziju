import ESTree from 'estree'
import { Tree } from './Tree'
import { NodeTypes } from './ast'
import { FunctionDeclaration } from './FunctionDeclaration'
import { Context } from '../environment/context'
import { ExpressionStatement } from './expression'

export class Program extends Tree {
    constructor(ast: ESTree.Program) {
        super(ast)
    }

    toCode(): string {
        let code = ''
        for (const node of this.ast.body) {
            switch (node.type) {
                case NodeTypes.ExpressionStatement: code += new ExpressionStatement(node).toCode();
                    break;
                default:
                    this.log.onError('[Program]: unknown node type: ' + node.type)
            }
        }
        return code;
    }

    evaluate(context: Context) {
        for (const node of this.ast.body) {
            switch (node.type) {
                case NodeTypes.ExpressionStatement: new ExpressionStatement(node).evaluate(context);
                    break;
                case NodeTypes.FunctionDeclaration: new FunctionDeclaration(node).evaluate(context);
                    break;
                default:
                    this.log.onError('[Program]: unknown node type: ' + node.type)
            }
        }
    }
}
