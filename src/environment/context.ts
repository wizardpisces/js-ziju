import { X86Environment } from "../backend/x86Assemble";
import { LLVMEnvironment } from "../backend/llvmAssemble";
import { Environment } from "./Environment"

interface BaseContext {
    env: Environment | X86Environment | LLVMEnvironment,
}

export interface Context extends BaseContext {
    env: Environment
}
export interface X86Context extends BaseContext {
    env: X86Environment,
    assembly: string,
    emit(depth: number, code: string): void
}
export interface LLVMContext extends BaseContext {
    env: LLVMEnvironment,
    assembly: string,
    emit(depth: number, code: string): void
}

const EnvironmentTypeMap = {
    interpret: new Environment(null),
    x86: new X86Environment(),
    llvm: new LLVMEnvironment()
}

function baseCreateContext(type: keyof typeof EnvironmentTypeMap = 'interpret'): X86Context | Context | LLVMContext {
    if (type === 'x86') {
        let context: X86Context = {
            env: EnvironmentTypeMap[type],
            assembly: '',
            emit(depth = 0, code: string) {
                context.assembly += '  '.repeat(depth) + code + '\n';
            }
        }
        return context
    } else if (type === 'llvm') {
        let context: LLVMContext = {
            env: EnvironmentTypeMap[type],
            assembly: '',
            emit(depth = 0, code: string) {
                context.assembly += '  '.repeat(depth) + code + '\n';
            }
        }
        return context
    } else{ // type === interpret
        let context: Context = {
            env: EnvironmentTypeMap[type]
        }
        return context
    }
}

export function createContext(): Context {
    return baseCreateContext('interpret') as Context
}

export function createX86Context(): X86Context {
    return baseCreateContext('x86') as X86Context
}

export function createLLVMContext(): LLVMContext {
    return baseCreateContext('llvm') as LLVMContext
}
