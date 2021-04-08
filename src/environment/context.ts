import { Environment } from "./Environment"

export type Context = {
    env: Environment,
    assembly: string,
    emit(depth: number, code: string): void
}

export function createContext(): Context {
    const context: Context = {
        env: new Environment(null),
        assembly: '',
        emit(depth = 0, code: string) {
            context.assembly += ' '.repeat(depth) + code + '\n';
        }
    }

    return context
}
