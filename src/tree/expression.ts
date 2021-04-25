import ESTree from 'estree'
import { Tree } from './Tree'
import { NodeTypes } from './ast'
import { Context, LLVMContext, X86Context } from '../environment/context'
import { Kind } from '../environment/Environment'
import { get_X86_MASM_Math_Logic_Map, get_X86_MASM_SysCall_Map, identifierCompile } from '../backend/x86Assemble'
import { opAcMap } from './util'
import { LLVMNamePointer } from '../environment/LLVM-Environment'
import { llvmIdentifierCompile, get_LLVM_SysCall_Map} from '../backend/llvmAssemble'

const X86_MASM_Math_Logic_Map = get_X86_MASM_Math_Logic_Map(dispatchExpressionCompile)
const X86_MASM_SysCall_Map = get_X86_MASM_SysCall_Map(dispatchExpressionCompile)
const LLVM_SysCall_Map = get_LLVM_SysCall_Map(dispatchExpressionLLVMCompile)

const nullFn = () => { console.log('Null function called!!!') }

const internal = {
    console
}

export class Literal extends Tree {
    ast!: ESTree.Literal
    constructor(ast: ESTree.Literal) {
        super(ast)
    }
    toCode(): string {
        if (this.ast.value) {
            return this.ast.value.toString();
        }
        return ''
    }

    evaluate() {
        return this.ast.value
    }

    compile(context: X86Context, depth: number = 0) {
        if (Number.isInteger(this.ast.value)) {
            context.emit(depth, `PUSH ${this.ast.value}`);
        }
    }

    llvmCompile(context: LLVMContext, useNamePointer: LLVMNamePointer) {
        // If numeric literal, store to useNamePointer register by adding 0.
        if (Number.isInteger(this.ast.value)) {
            context.emit(1, `%${useNamePointer.value} = add i64 ${this.ast.value}, 0`);
        }
    }
}

export class Identifier extends Tree {
    constructor(ast: ESTree.Identifier) {
        super(ast)
    }

    toCode(): string {
        return this.ast.name
    }

    evaluate(context: Context) {
        return context.env.get(this.ast.name)
    }

    compile(context: X86Context, depth: number = 0) {
        identifierCompile(this.ast, context, depth)
    }

    llvmCompile(context: LLVMContext, useNamePointer: LLVMNamePointer) {
        llvmIdentifierCompile(this.ast, context, useNamePointer)
    }
}
export class BinaryExpression extends Tree {
    ast!: ESTree.BinaryExpression;
    constructor(ast: ESTree.BinaryExpression) {
        super(ast)
    }

    evaluate(context: Context): boolean | number {
        return opAcMap[this.ast.operator](dispatchExpressionEvaluation(this.ast.left, context), dispatchExpressionEvaluation(this.ast.right, context))

    }

    compile(context: X86Context, depth: number = 0) {
        return X86_MASM_Math_Logic_Map[this.ast.operator](this.ast, context, depth)
    }

    llvmCompile(context: LLVMContext, resultNamePointer: LLVMNamePointer) {
        let llvmOperatorMap = {
            '+': 'add',
            '-': 'sub',
            '*': 'mul',
            '/': 'udiv',
            '%': 'urem',
            '<': 'icmp slt',
            '>': 'icmp sgt',
            '=': 'icmp eq',
        };

        const arg1 = context.env.scope.symbol();
        const arg2 = context.env.scope.symbol();

        dispatchExpressionLLVMCompile(this.ast.left, context, arg1)
        dispatchExpressionLLVMCompile(this.ast.right, context, arg2)

        context.emit(
            1,
            `%${resultNamePointer.value} = ${llvmOperatorMap[this.ast.operator]} ${arg1.type} %${arg1.value}, %${arg2.value}`);
    }
}

export class AssignmentExpression extends Tree {
    ast!: ESTree.AssignmentExpression
    constructor(ast: ESTree.AssignmentExpression) {
        super(ast)
    }

    toCode(): string {
        return 'assignment expression code!'
    }

    evaluate(context: Context) {
        if (this.ast.operator === '=') {
            context.env.def((<ESTree.Identifier>this.ast.left).name, dispatchExpressionEvaluation(this.ast.right, context))
        }
    }
}

export class UpdateExpression extends Tree {
    ast!: ESTree.UpdateExpression
    constructor(ast: ESTree.UpdateExpression) {
        super(ast)
    }

    toCode(): string {
        return 'UpdateExpression code!'
    }

    evaluate(context: Context) {
        if (this.ast.operator === '++') {
            if (this.ast.argument.type === NodeTypes.Identifier) {
                context.env.def(this.ast.argument.name, context.env.get(this.ast.argument.name) + 1)
            }
        }
    }
}

export class MemberExpression extends Tree {
    ast!: ESTree.MemberExpression
    constructor(ast: ESTree.MemberExpression) {
        super(ast)
    }
    toCode(): string {
        let code: string = ''
        switch (this.ast.object.type) {
            case NodeTypes.Identifier: code += new Identifier(this.ast.object).toCode()
        }
        if (this.ast.property) {
            code += '.';
            switch (this.ast.property.type) {
                case NodeTypes.Identifier: code += new Identifier(this.ast.property).toCode()
            }
        }

        return code;
    }
    evaluate(): Function {
        if (this.ast.object.type === NodeTypes.Identifier) {
            if (this.ast.property.type === NodeTypes.Identifier) {
                return internal[this.ast.object.name][this.ast.property.name]
            }
        }
        return nullFn
    }

    compile(context: X86Context, depth: number = 0) {
    }
}

export class CallExpression extends Tree {
    ast!: ESTree.CallExpression
    constructor(ast: ESTree.CallExpression) {
        super(ast)
    }
    toCode() {
        let code = ''
        switch (this.ast.callee.type) {
            case NodeTypes.MemberExpression: code += new MemberExpression(this.ast.callee).toCode(); break;
            default: throw Error('[toCode] unsupported callee type: ' + this.ast.callee.type)
        }
        code += '('
        this.ast.arguments.forEach((arg) => {
            switch (arg.type) {
                case NodeTypes.Literal: code += new Literal(arg).toCode()
            }
        });
        code += ')'
        return code;
    }

    evaluate(context: Context) {
        function transformArgs(args: ESTree.CallExpression['arguments'], context: Context) {
            return args.map((arg) => {
                return dispatchExpressionEvaluation(arg as ESTree.Expression, context)
            })
        }

        let fn: Function = nullFn,
            { callee } = this.ast

        switch (callee.type) {
            case NodeTypes.MemberExpression: fn = new MemberExpression(callee).evaluate();
                break;
            case NodeTypes.Identifier: fn = context.env.get(callee.name, Kind.FunctionDeclaration);
                break;
        }

        fn.apply(null, transformArgs(this.ast.arguments, context))
        let ret = context.env.getReturnValue()
        return ret
    }

    compile(context: X86Context, depth: number = 0) {

        function compileCall(ast: ESTree.CallExpression, context: X86Context, depth: number = 0) {
            let args = ast.arguments,
                scope = context.env,
                fun = ast.callee.type === NodeTypes.Identifier ? ast.callee.name : 'undefined-function';
            // Compile registers and store on the stack
            args.map((arg) => dispatchExpressionCompile(arg, context, depth));

            const fn = scope.lookup(fun);

            if (fn) {
                context.emit(depth, `CALL ${fn.name}`);
            } else {
                throw new Error('Attempt to call undefined function: ' + fun);
            }

            if (args.length > 1) {
                /**
                 * Drop the args
                 * reset stack pointer
                 */
                context.emit(depth, `ADD RSP, ${args.length * 8}`);
            }

            if (args.length === 1) {
                context.emit(depth, `MOV [RSP], RAX\n`);
            } else {
                context.emit(depth, 'PUSH RAX\n');
            }
        }

        switch (this.ast.callee.type) {

            case NodeTypes.Identifier:
                return compileCall(this.ast, context, depth)

            case NodeTypes.MemberExpression:
                return X86_MASM_SysCall_Map[new MemberExpression(this.ast.callee).toCode()](this.ast, context, depth);

            default: throw Error(`Unsupported callee type ${this.ast.callee.type} compile`);
        }
    }

    llvmCompile(context: LLVMContext, resultNamePointer: LLVMNamePointer) {
        /**
         * Todos enable tail call optimization
         * reference: https://llvm.org/docs/LangRef.html#call-instruction
         */

        function llvmCompileCall(ast: ESTree.CallExpression, context: LLVMContext, retNamePointer: LLVMNamePointer) {
            let args = ast.arguments,
                fun = ast.callee.type === NodeTypes.Identifier ? ast.callee.name : 'undefined-function';

            const funcNamePointer = context.env.scope.get(fun);
            if (funcNamePointer) {
                const safeArgs: string = args
                    .map((expr) => {
                        const useNamePointer: LLVMNamePointer = context.env.scope.symbol();
                        dispatchExpressionLLVMCompile(expr, context, useNamePointer);
                        return `${useNamePointer.type} %` + useNamePointer.value;
                    })
                    .join(', ');

                const isTailCall = context.env.tail_call_enabled && context.env.tailCallTree.includes(funcNamePointer.value);
                const maybeTail = isTailCall ? 'tail ' : '';

                context.emit(
                    1,
                    `%${retNamePointer.value} = ${maybeTail}call ${funcNamePointer.type} @${funcNamePointer.value}(${safeArgs})`,
                );
                // if (isTailCall) {
                //     context.emit(1, `ret ${retNamePointer.type} %${retNamePointer.value}`);
                // }
            } else {
                throw new Error('Attempt to call undefined function: ' + fun);
            }
        }

        switch (this.ast.callee.type) {

            case NodeTypes.Identifier:
                return llvmCompileCall(this.ast, context, resultNamePointer);

            case NodeTypes.MemberExpression:
                return LLVM_SysCall_Map[new MemberExpression(this.ast.callee).toCode()](this.ast, context, resultNamePointer);;

            default: throw Error(`Unsupported callee type ${this.ast.callee.type} compile`);
        }
    }
}

export class ExpressionStatement extends Tree {
    constructor(ast: ESTree.ExpressionStatement) {
        super(ast)
    }
    toCode(): string {
        let code = ''
        switch (this.ast.expression.type) {
            case 'CallExpression': code += new CallExpression(this.ast.expression).toCode();
                break;
        }
        return code;
    }
    evaluate(context: Context) {
        return dispatchExpressionEvaluation(this.ast.expression, context)
    }
    compile(context: X86Context, depth: number = 0) {
        return dispatchExpressionCompile(this.ast.expression, context, depth)
    }
    llvmCompile(context: LLVMContext, namePointer: LLVMNamePointer) {
        return dispatchExpressionLLVMCompile(this.ast.expression, context, namePointer)
    }
}

export function dispatchExpressionEvaluation(expression: ESTree.Expression, context: Context): any {
    switch (expression.type) {
        case NodeTypes.Identifier: return new Identifier(expression).evaluate(context)
        case NodeTypes.Literal: return new Literal(expression).evaluate()
        case NodeTypes.BinaryExpression: return new BinaryExpression(expression).evaluate(context)
        case NodeTypes.CallExpression: return new CallExpression(expression).evaluate(context)
        case NodeTypes.AssignmentExpression: return new AssignmentExpression(expression).evaluate(context)
        case NodeTypes.UpdateExpression: return new UpdateExpression(expression).evaluate(context)
        default: throw Error('Unsupported expression ' + expression)
    }
}

export function dispatchExpressionCompile(expression: ESTree.Expression | ESTree.SpreadElement, context: X86Context, depth: number = 0) {
    switch (expression.type) {
        case NodeTypes.Identifier: return new Identifier(expression).compile(context, depth);
        case NodeTypes.Literal: return new Literal(expression).compile(context, depth);
        case NodeTypes.BinaryExpression: return new BinaryExpression(expression).compile(context, depth);
        case NodeTypes.CallExpression: return new CallExpression(expression).compile(context, depth)
        // case NodeTypes.AssignmentExpression: return new AssignmentExpression(expression).evaluate(context)
        // case NodeTypes.UpdateExpression: return new UpdateExpression(expression).evaluate(context)
        default: throw Error('Unsupported expression ' + expression)
    }
}

export function dispatchExpressionLLVMCompile(expression: ESTree.Expression | ESTree.SpreadElement, context: LLVMContext, namePointer: LLVMNamePointer) {
    switch (expression.type) {
        case NodeTypes.Identifier: return new Identifier(expression).llvmCompile(context, namePointer);
        case NodeTypes.Literal: return new Literal(expression).llvmCompile(context, namePointer);
        case NodeTypes.BinaryExpression: return new BinaryExpression(expression).llvmCompile(context, namePointer);
        case NodeTypes.CallExpression: return new CallExpression(expression).llvmCompile(context, namePointer)
        // case NodeTypes.AssignmentExpression: return new AssignmentExpression(expression).evaluate(context)
        // case NodeTypes.UpdateExpression: return new UpdateExpression(expression).evaluate(context)
        default: throw Error('Unsupported expression ' + expression)
    }
}