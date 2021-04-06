import { Environment } from "./Environment"

export type Context = {
    env: Environment,
    assembly: string,
    push(code: string): void
}

export function createContext(): Context {
    const context: Context = {
        env: new Environment(null),
        assembly:'',
        push(code: string) {
            context.assembly += code;
        }
    }

    return context
}
