import { Context, LLVMContext, X86Context } from '../environment/context'
import ESTree from 'estree'
import { NodeTypes } from './ast';
import { BinaryExpression, dispatchExpressionCompile, dispatchExpressionEvaluation, dispatchExpressionLLVMCompile } from './expression';
import { Tree } from './Tree'
import { ExpressionStatement } from './expression'
import { VariableDeclaration } from './VariableDeclaration'
import { Environment, Kind } from '../environment/Environment';
import { incGlobalCounter } from './util'
import { LLVMNamePointer } from '../backend/llvmAssemble'

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

    compile(context: X86Context, depth: number = 0) {
        let length = this.ast.body.length

        return this.ast.body.every((statement: ESTree.Statement, i: number) => {
            let result = dispatchStatementCompile(statement, context, depth)
            if (i < length - 1) {
                context.emit(depth, `POP RAX # Ignore non-final expression`);
            }
            return result
        })
    }
    llvmCompile(context: LLVMContext, namePointer: LLVMNamePointer) {
        return this.ast.body.every((statement: ESTree.Statement, i: number) => {
            const isLast = this.ast.body.length - 1 === i;

            /**
             * Todos: determine whether it is function definition last sentence
             * only affect this layer of tailCallTree
             */
            const contextClone = context.env.copy();
            contextClone.scope = context.env.scope;
            if (!isLast || statement.type!== NodeTypes.ReturnStatement) {
                contextClone.tailCallTree = [];
            }
            return dispathStatementLLVMCompile(statement, context, namePointer)
        })
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

    compile(context: X86Context, depth: number = 0) {
        if (this.ast.argument) {
            dispatchExpressionCompile(this.ast.argument, context, depth)
            /**
             * save whatever to RAX for return
             * TODOS: how to resolve function without a return
            */
            // context.emit(depth,'MOV RAX, [RSP]');

            // context.emit(depth, `POP RAX`);
        }

        return false;
    }

    llvmCompile(context:LLVMContext, retNamePointer:LLVMNamePointer){
        /**
         * Todos
         * js ret could contain any object
         * here we only considered simple expression yet
         */

        if (this.ast.argument) {
            if(this.ast.argument.type !== NodeTypes.CallExpression){
                context.env.tailCallTree = []
            }
            dispatchExpressionLLVMCompile(this.ast.argument, context, retNamePointer)
            context.emit(1, `ret ${retNamePointer.type} %${retNamePointer.value}`);
        }else{
            context.emit(1, `ret void`);
        }    

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
                return dispatchStatementEvaluation(this.ast.body, context)
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

    compile(context: X86Context, depth: number = 0): boolean {
        const { test, consequent, alternate } = this.ast
        context.emit(depth, '# If');
        // Compile test
        dispatchExpressionCompile(test, context, depth)

        let branch = `else_branch` + incGlobalCounter();
        // Must pop/use up argument in test
        context.emit(0, '');
        context.emit(depth, `POP RAX`);
        context.emit(depth, `TEST RAX, RAX`);
        context.emit(depth, `JZ .${branch}\n`);

        // Compile then section
        context.emit(depth, `# If then`);

        dispatchStatementCompile(consequent, context, depth)

        context.emit(depth, `JMP .after_${branch}\n`);

        // Compile else section
        context.emit(depth, `# If else`);
        context.emit(0, `.${branch}:`);
        if (alternate) {
            dispatchStatementCompile(alternate, context, depth)
        } else {
            context.emit(1, 'PUSH 0 # Null else branch');
        }

        context.emit(0, `.after_${branch}:`);
        context.emit(depth, '# End if');

        return true
    }

    llvmCompile(context:LLVMContext,namePointer:LLVMNamePointer){
        const { test, consequent, alternate } = this.ast

        const testVariable = context.env.scope.symbol();
        const result = context.env.scope.symbol('ifresult');
        // Space for result
        result.type = 'i64*';
        context.emit(1, `%${result.value} = alloca i64, align 4`);
        // Compile expression and branch
        dispatchExpressionLLVMCompile(test, context, testVariable);
        const trueLabel = context.env.scope.symbol('iftrue').value;
        const falseLabel = context.env.scope.symbol('iffalse').value;
        context.emit(
            1,
            `br i1 %${testVariable.value}, label %${trueLabel}, label %${falseLabel}`,
        );

        // Compile true section
        context.emit(0, trueLabel + ':');
        const trueTempNamePointer = context.env.scope.symbol();
        dispathStatementLLVMCompile(consequent, context, trueTempNamePointer);
        context.emit(
            1,
            `store ${trueTempNamePointer.type} %${trueTempNamePointer.value}, ${result.type} %${result.value}, align 4`,
        );
        const endLabel = context.env.scope.symbol('ifend').value;
        context.emit(1, 'br label %' + endLabel);
        context.emit(0, falseLabel + ':');
        if (alternate) {
            const elseTempNamePointer = context.env.scope.symbol();
            dispathStatementLLVMCompile(alternate, context, elseTempNamePointer);
            context.emit(
                1,
                `store ${elseTempNamePointer.type} %${elseTempNamePointer.value}, ${result.type} %${result.value}, align 4`,
            );
        }
        context.emit(1, 'br label %' + endLabel);

        // Compile cleanup
        context.emit(0, endLabel + ':');
        context.emit(
            1,
            `%${namePointer.value} = load ${namePointer.type}, ${result.type} %${result.value}, align 4`,
        );

        return true;
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
        if (id) {
            safe = context.env.assign(id.name);
        } else {
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
        params.forEach((param: ESTree.Pattern, i) => {
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
        new BlockStatement(body).compile(context, depth)

        // Save the return value
        // context.emit(0, '');
        context.emit(depth, `POP RAX`);
        context.emit(depth, `POP RBP\n`);

        context.emit(depth, 'RET\n');
    }

    llvmCompile(context: LLVMContext, _: LLVMNamePointer) {
        let { body, id, params } = this.ast,
            fn: LLVMNamePointer;

        // Add this function to outer context.scope
        if (id) {
            fn = context.env.scope.register(id.name);
        } else {
            throw Error('Do not support function name null yet!!')
        }

        // Copy outer env.scope so parameter mappings aren't exposed in outer env.scope.
        const childContext = context.env.copy();
        childContext.tailCallTree.push(fn.value);

        const safeParams: LLVMNamePointer[] = params.map((param: ESTree.Pattern) => {
            if (param.type === NodeTypes.Identifier) {
                // Store parameter mapped to associated local
                return childContext.scope.register(param.name);
            } else {
                throw Error('[llvmCompile]: Unknown param type ' + param.type)
            }
        });

        context.emit(
            0,
            `define i64 @${fn.value}(${safeParams
                .map((p: LLVMNamePointer) => `${p.type} %${p.value}`)
                .join(', ')}) {`,
        );

        // Pass childContext in for reference when body is compiled.
        const resultNamePointer:LLVMNamePointer = childContext.scope.symbol();

        new BlockStatement(body).llvmCompile({ ...context, env: childContext }, resultNamePointer)

        // context.emit(1, `ret ${resultNamePointer.type} %${resultNamePointer.value}`); // moved to ReturnStatement compile

        context.emit(0, '}\n');
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
        case NodeTypes.BlockStatement: return new BlockStatement(statement).evaluate(context)
        default: throw Error('Unknown statement ' + statement.type)
    }

    return true;
}

export function dispatchStatementCompile(statement: ESTree.Statement, context: X86Context, depth: number = 0): boolean {

    switch (statement.type) {
        case NodeTypes.ExpressionStatement: new ExpressionStatement(statement).compile(context, depth); break;
        case NodeTypes.FunctionDeclaration: new FunctionDeclaration(statement).compile(context, depth); break;
        // case NodeTypes.VariableDeclaration: new VariableDeclaration(statement).evaluate(context); break;
        // case NodeTypes.WhileStatement: return new WhileStatement(statement).evaluate(context)
        case NodeTypes.IfStatement: return new IfStatement(statement).compile(context, depth);
        case NodeTypes.ReturnStatement: return new ReturnStatement(statement).compile(context, depth);
        case NodeTypes.BlockStatement: return new BlockStatement(statement).compile(context, depth);
        default: throw Error('Unknown statement ' + statement.type)
    }

    return true;
}

export function dispathStatementLLVMCompile(statement: ESTree.Statement, context: LLVMContext, namePointer: LLVMNamePointer): boolean {

    switch (statement.type) {
        case NodeTypes.ExpressionStatement: new ExpressionStatement(statement).llvmCompile(context, namePointer); break;
        case NodeTypes.FunctionDeclaration: new FunctionDeclaration(statement).llvmCompile(context, namePointer); break;
        // case NodeTypes.VariableDeclaration: new VariableDeclaration(statement).evaluate(context); break;
        // case NodeTypes.WhileStatement: return new WhileStatement(statement).evaluate(context)
        case NodeTypes.IfStatement: return new IfStatement(statement).llvmCompile(context, namePointer);
        case NodeTypes.ReturnStatement: return new ReturnStatement(statement).llvmCompile(context, namePointer);
        case NodeTypes.BlockStatement: return new BlockStatement(statement).llvmCompile(context, namePointer);
        default: throw Error('Unknown statement ' + statement.type)
    }

    return true;
}