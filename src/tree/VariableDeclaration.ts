import { Context } from '@/environment/context'
import ESTree from 'estree'
import { NodeTypes } from './ast';
import { Tree } from './Tree'


export class VariableDeclarator extends Tree {
    ast!: ESTree.VariableDeclarator;
    constructor(ast: ESTree.VariableDeclarator) {
        super(ast)
    }

    evaluate(context: Context) {
        if (this.ast.id.type === NodeTypes.Identifier) {
            if (this.ast.init!.type === NodeTypes.Literal) {
                context.env.def(this.ast.id.name, (<ESTree.Literal>this.ast.init).value)
            } else if (this.ast.init!.type === NodeTypes.Identifier) {
                context.env.def(this.ast.id.name, context.env.get((<ESTree.Identifier>this.ast.init).name))
            }
        }
    }
}

export class VariableDeclaration extends Tree {
    ast!: ESTree.VariableDeclaration;
    constructor(ast: ESTree.VariableDeclaration) {
        super(ast)
    }

    evaluate(context: Context) {
        let declarations = this.ast.declarations

        for (let i = 0, len = declarations.length; i < len; i++) {
            if (declarations[i].type === NodeTypes.VariableDeclarator) {
                new VariableDeclarator(declarations[i]).evaluate(context)
            }
        }
    }
}
