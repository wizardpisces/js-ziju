import os from 'os';
import ESTree from 'estree'
import { X86Context } from "@/environment/context";
export type Platform = 'darwin' | 'linux'
export type SystemCall = { 'write': number, 'exit': number }

export const SYSCALL_MAP: SystemCall = {
    darwin: {
        exit: 0x2000001,
        write: 0x2000004,
    },
    linux: {
        exit: 60,
        write: 1,
    }
}[os.platform() as Platform];

export function emitPrefix(context: X86Context) {
    context.emit(1, '.global _main\n');

    context.emit(1, '.text\n');
}

export function emitPostfix(context: X86Context) {
    context.emit(0, '_main:');
    context.emit(1, 'CALL main');
    context.emit(1, 'MOV RDI, RAX'); // Set exit arg
    context.emit(1, `MOV RAX, ${SYSCALL_MAP['exit']}`);
    context.emit(1, 'SYSCALL');
}

export type X86NamePointer = { name: string, offset: number }
export class X86Environment {
    localOffset: number
    map: Record<string, number>
    constructor() {
        this.localOffset = 1;
        this.map = {};
    }

    assign(name: string): string {
        const safe = name.replace('-', '_');
        this.map[safe] = this.localOffset++;
        return safe;
    }

    symbol(): number {
        return this.localOffset++;
    }

    lookup(name: string): X86NamePointer | null {
        const safe = name.replace('-', '_');
        if (this.map[safe]) {
            return { name: safe, offset: this.map[safe] };
        }

        return null;
    }

    copy(): X86Environment {
        const s = new X86Environment();
        // In the future we may need to store s.scopeOffset = this.scopeOffset + 1
        // so we can read outer-scoped values at runtime.
        s.map = { ...this.map };
        return s;
    }
}

export function identifierCompile(ast:ESTree.Identifier, context: X86Context, depth: number) {
    const { name } = ast
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

/**
 * TODOS: 多参数跟字符串的输出需要做处理，目前只支持不超过10的单参数log，eg: console.log(6)
 */
export type dispatchExpressionCompileFunctionType = (expression: ESTree.Expression | ESTree.SpreadElement, context: X86Context, depth?: number) => void

export function get_X86_MASM_SysCall_Map(dispatchExpressionCompile: dispatchExpressionCompileFunctionType) {
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
}

export function get_X86_MASM_Math_Logic_Map(dispatchExpressionCompile: dispatchExpressionCompileFunctionType) {
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
                    '===': 'CMOVE',
                    '!==': 'CMOVNE',
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
        ...prepareComparison('==='),
        ...prepareComparison('!=='),
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
}