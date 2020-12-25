import { Context } from './context'

export class LoggerUtil {
    constructor() {}
    onError(error: string) {
        console.error('[LoggerUtil]: '+error)
    }
}

@logger()
export class Tree {
    log!: LoggerUtil
    // todo : should be more specific
    ast: any
    constructor(ast: any) {
        this.ast = ast
        // console.log(this.constructor.name)
    }
    toCode(): string {
        return this.ast.value
    }

    evaluate(context?:Context) {

    }
}

export function logger() {
    return function (target:any) {
        target.prototype.log = new LoggerUtil()
    }
}
