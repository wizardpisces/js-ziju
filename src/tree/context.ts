import { Environment } from "../environment/Environment"

export type Context = {
    env: Environment
}

export function createContext(): Context {
    const context: Context = {
        env: new Environment(null),
    }

    return context
}
