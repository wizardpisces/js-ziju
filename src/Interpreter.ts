import ESTree from 'estree'
// acorn: The return value will be an abstract syntax tree object as specified by the ESTree spec
import { parse } from 'acorn'
import { Program } from './tree/Program'
import { createContext } from './environment/context';

export class Interpreter {
    ast: any
    constructor(code: string) {
        this.ast = parse(code, { ecmaVersion: 2020 });
    }
    interpret() {
        let context = createContext();
        new Program(this.ast as ESTree.Program).evaluate(context)
        
        return {
            ast: this.ast,
            assembly: context.assembly
        }
    }
    // accept(visitor: Visitor) {
    //     visitor.visit()
    // }
    // visit() {

    // }
}