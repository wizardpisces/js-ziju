import ESTree from 'estree'
import { Tree } from './Tree'
import { NodeTypes } from './ast'
import { Context, X86Context } from '../environment/context'
import { Kind } from '../environment/Environment'
import { X86NamePointer } from '../environment/X86Environment'
import { SYSCALL_MAP, SystemCall } from '../backend/x86Assemble'
import { opAcMap } from './util'

const nullFn = () => { console.log('Null function called!!!') }

const internal = {
    console
}

/**
 * TODOS: 多参数跟字符串的输出需要做处理，目前只支持不超过10的单参数log，eg: console.log(6)
 */

const X86_MASM_SysCall_Map = (function prepareSyscallWrappers() {
    type SysFunction = (ast: ESTree.CallExpression, context: X86Context, depth?: number) => void
    const sysCallMap = {
        write: 'console.log',
        exit: 'exit' // Todos: js 的 exit 编译成了啥
    }
    const registers = ['RDI', 'RSI', 'RDX', 'R10', 'R8', 'R9'];
    const wrappers: Record<string, SysFunction> = {};

    Object.keys(SYSCALL_MAP).forEach((key) => {
        wrappers[sysCallMap[key]] = (ast: ESTree.CallExpression, context: X86Context, depth: number = 0) => {
            let args = ast.arguments

            if (args.length > registers.length) {
                throw new Error(`Too many arguments to syscall/${key}`);
            }

            // Compile first
            args.forEach((arg) => dispatchExpressionCompile(arg, context, depth));

            // Then pop to avoid possible register contention
            args.forEach((_, i) =>
                context.emit(depth, `POP ${registers[args.length - i - 1]}`)
            );

            context.emit(depth, `MOV RAX, ${SYSCALL_MAP[key as keyof SystemCall]}`);
            context.emit(depth, 'SYSCALL');
            context.emit(depth, `PUSH RAX\n`);
        };
    });

    return wrappers;
})()

const X86_MASM_Math_Logic_Map = (function prepareArithmeticAndLogicalWrappers() {
    // General operatations
    const prepareGeneral = (instruction: string) => (ast: ESTree.BinaryExpression, context: X86Context, depth: number = 0) => {
        depth++;
        context.emit(depth, `# ${instruction.toUpperCase()}`);

        // Compile first argument
        dispatchExpressionCompile(ast.left, context, depth);

        // Compile second argument
        dispatchExpressionCompile(ast.right, context, depth);
        context.emit(depth, `POP RAX`);

        // Compile operation
        context.emit(depth, `${instruction.toUpperCase()} [RSP], RAX`);

        context.emit(depth, `# End ${instruction.toUpperCase()}`);
    };

    // Operations that use RAX implicitly
    const prepareRax = (instruction: string, outRegister = 'RAX') => (
        ast: ESTree.BinaryExpression,
        context: X86Context,
        depth: number = 0,
    ) => {
        depth++;
        context.emit(depth, `# ${instruction.toUpperCase()}`);

        // Compile first argument
        dispatchExpressionCompile(ast.left, context, depth);

        // Compile second argument
        dispatchExpressionCompile(ast.right, context, depth);

        // Must POP _after_ both have been compiled
        context.emit(depth, `POP RAX`);
        context.emit(depth, `XCHG [RSP], RAX`);

        // Reset RDX for DIV
        if (instruction.toUpperCase() === 'DIV') {
            context.emit(depth, `XOR RDX, RDX`);
        }

        // Compiler operation
        context.emit(depth, `${instruction.toUpperCase()} QWORD PTR [RSP]`);

        // Swap the top of the stack
        context.emit(depth, `MOV [RSP], ${outRegister}`);
    };

    const prepareComparison = (operator: string) => {
        return {
            [operator]: (ast: ESTree.BinaryExpression,
                context: X86Context,
                depth: number = 0,) => {
                depth++;
                context.emit(depth, `# ${operator}`);

                // Compile first argument, store in RAX
                dispatchExpressionCompile(ast.left, context, depth);

                // Compile second argument
                dispatchExpressionCompile(ast.right, context, depth);

                context.emit(depth, `POP RAX`);

                // Compile operation
                context.emit(depth, `CMP [RSP], RAX`);

                // Reset RAX to serve as CMOV* dest, MOV to keep flags (vs. XOR)
                context.emit(depth, `MOV RAX, 0`);

                // Conditional set [RSP]
                const operation = {
                    '>': 'CMOVA',
                    '>=': 'CMOVAE',
                    '<': 'CMOVB',
                    '<=': 'CMOVBE',
                    '==': 'CMOVE',
                    '!=': 'CMOVNE',
                }[operator];
                // CMOV* requires the source to be memory or register
                context.emit(depth, `MOV DWORD PTR [RSP], 1`);
                // CMOV* requires the dest to be a register
                context.emit(depth, `${operation} RAX, [RSP]`);
                context.emit(depth, `MOV [RSP], RAX`);
                context.emit(depth, `# End ${operator}`);
            },
        };
    };

    const logicalWrappers = {
        ...prepareComparison('>'),
        ...prepareComparison('>='),
        ...prepareComparison('<'),
        ...prepareComparison('<='),
        ...prepareComparison('=='),
        ...prepareComparison('!='),
    };

    const arithmaticWrappers = {
        '+': prepareGeneral('add'),
        '-': prepareGeneral('sub'),
        '&': prepareGeneral('and'),
        '|': prepareGeneral('or'),
        '=': prepareGeneral('mov'),
        '*': prepareRax('mul'),
        '/': prepareRax('div'),
        '%': prepareRax('div', 'RDX')
    };

    return {
        ...logicalWrappers,
        ...arithmaticWrappers
    }
})()

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
        let arg = this.ast.value
        if (Number.isInteger(arg)) {
            context.emit(depth, `PUSH ${arg}`);
            return;
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
        const name = this.ast.name;

        // support kernel print starts with $$ is address 
        if ((name).startsWith('$$')) {
            const { offset } = context.env.lookup(name) as X86NamePointer;
            // Copy the frame pointer so we can return an offset from it
            context.emit(depth, `MOV RAX, RBP`);
            const operation = offset < 0 ? 'ADD' : 'SUB';
            context.emit(depth, `${operation} RAX, ${Math.abs(offset * 8)} # ${name}`);
            context.emit(depth, `PUSH RAX`);
            return;
        }

        // js variable
        const { offset } = context.env.lookup(name) as X86NamePointer;
        if (offset) {
            const operation = offset < 0 ? '+' : '-';
            context.emit(
                depth,
                `PUSH [RBP ${operation} ${Math.abs(offset * 8)}] # ${name}`
            );
        } else {
            throw new Error(
                'Attempt to reference undefined variable or unsupported literal: ' +
                name,
            );
        }
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