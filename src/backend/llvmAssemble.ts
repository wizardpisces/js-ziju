
import ESTree from 'estree'
import { LLVMContext } from "../environment/context";
import { SYSCALL_MAP, SystemCall } from './common'
import { LLVMNamePointer } from '../environment/LLVM-Environment';

export * from '../environment/LLVM-Environment'

export function llvmIdentifierCompile(ast: ESTree.Identifier, context: LLVMContext, useNamePointer: LLVMNamePointer) {
    const { name } = ast
    /**
            * support kernel print starts with $$ is kernal call symbol
            * Is a reference, add value pointer to result
            */
    if ((name).startsWith('$$')) {
        const tmp = context.env.scope.symbol();
        const varNamePointer = context.env.scope.get(name);

        context.emit(1, `%${tmp.value} = add ${varNamePointer.type} %${varNamePointer.value}, 0`);
        context.emit(1, `%${useNamePointer.value} = alloca ${tmp.type}, align 4`);
        useNamePointer.type = tmp.type + '*';

        context.emit(
            1,
            `store ${tmp.type} %${tmp.value}, ${useNamePointer.type} %${useNamePointer.value}, align 4`);
        return;
    }

    // If is local, store to useNamePointer register similarly.
    const varNamePointer = context.env.scope.get(name);
    if (varNamePointer) {
        context.emit(1, `%${useNamePointer.value} = add ${varNamePointer.type} %${varNamePointer.value}, 0`);
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
export type dispatchExpressionCompileFunctionType = (expression: ESTree.Expression | ESTree.SpreadElement, context: LLVMContext, namePointer:LLVMNamePointer) => void
export function get_LLVM_SysCall_Map(dispatchExpressionLLVMCompile: dispatchExpressionCompileFunctionType) {
    type SysFunction = (ast: ESTree.CallExpression, context: LLVMContext, namePoitner: LLVMNamePointer) => void
    const sysCallMap = {
        write: 'console.log',
        exit: 'syscall/exit' // Todos: js 的 exit 编译成了啥
    }
    const registers = ['RDI', 'RSI', 'RDX', 'R10', 'R8', 'R9'];
    const wrappers: Record<string, SysFunction> = {};

    Object.keys(SYSCALL_MAP).forEach((key) => {
        wrappers[sysCallMap[key]] = (ast: ESTree.CallExpression, context: LLVMContext, namePointer: LLVMNamePointer) => {
            let args = ast.arguments;

            if (args.length > registers.length) {
                throw new Error(`[LLVM SYSCALL]: Too many arguments to syscall/${key}`);
            }
            
            const argTmps = args
                .map((arg) => {
                    const tmp = context.env.scope.symbol();
                    dispatchExpressionLLVMCompile(arg, context, tmp);
                    return tmp.type + ' %' + tmp.value;
                })
                .join(', ');
            const regs = ['rdi', 'rsi', 'rdx', 'r10', 'r8', 'r9'];
            const params = args.map((_, i) => `{${regs[i]}}`).join(',');
            const idTmp = context.env.scope.symbol().value;
            context.emit(1, `%${idTmp} = add i64 ${SYSCALL_MAP[key as keyof SystemCall]}, 0`);
            
            let assign = namePointer.type !== 'void' ? `%${namePointer.value} = ` : ''
            context.emit(
                1,
                `${assign}call ${namePointer.type} asm sideeffect "syscall", "=r,{rax},${params},~{dirflag},~{fpsr},~{flags}" (i64 %${idTmp}, ${argTmps})`
            );
        
        };
    });

    return wrappers;
}