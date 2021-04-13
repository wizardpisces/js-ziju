import ESTree from 'estree'
import { Tree } from './Tree'
import { NodeTypes } from './ast'
import { Context, X86Context } from '../environment/context'
import { ExpressionStatement } from './expression'
import { dispatchStatementCompile, dispatchStatementEvaluation} from './statement'
import { emitPostfix, emitPrefix } from '../backend/x86Assemble'

export class Program extends Tree {
    ast!: ESTree.Program
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

    /**
     * ignore ModuleDeclaration for now
     */
    evaluate(context: Context) {
        this.ast.body.forEach(node=>{
            dispatchStatementEvaluation(node as ESTree.Statement,context)
        })
    }

    compile(context:X86Context){

        emitPrefix(context)

        this.ast.body.forEach(node => {
            dispatchStatementCompile(node as ESTree.Statement, context, 0)
        })

        emitPostfix(context)
    }
}
