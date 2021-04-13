import { X86Environment } from "../backend/x86Assemble";
import { Environment } from "./Environment"

interface BaseContext {
    env: Environment | X86Environment,
}

export interface Context extends BaseContext {
    env: Environment
}
export interface X86Context extends BaseContext {
    env: X86Environment,
    assembly: string,
    emit(depth: number, code: string): void
}

const EnvironmentTypeMap = {
    interpret: new Environment(null),
    x86: new X86Environment()
}

function baseCreateContext(type: keyof typeof EnvironmentTypeMap = 'interpret'): X86Context | Context {
    if (type === 'x86') {
        let context: X86Context = {
            env: EnvironmentTypeMap[type],
            assembly: '',
            emit(depth = 0, code: string) {
                context.assembly += ' '.repeat(depth) + code + '\n';
            }
        }
        return context
    }

    let context: Context = {
        env: new Environment(null)
    }
    
    return context
}

export function createContext(): Context {
    return baseCreateContext('interpret') as Context
}

export function createX86Context(): X86Context {
    return baseCreateContext('x86') as X86Context
}
