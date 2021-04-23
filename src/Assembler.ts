import ESTree from 'estree'
// acorn: The return value will be an abstract syntax tree object as specified by the ESTree spec
import { parse } from 'acorn'
import { Program } from './tree/Program'
import {createLLVMContext, createX86Context } from './environment/context';

export class Assembler {
    ast: any
    constructor(code: string) {
        this.ast = parse(code, { ecmaVersion: 2020 });
    }
    compile() {
        let context = createX86Context();
        
        new Program(this.ast as ESTree.Program).compile(context)

        return {
            ast: this.ast,
            assembly: context.assembly
        }
    }
    llvmCompile() {
        let context = createLLVMContext();
        
        new Program(this.ast as ESTree.Program).llvmCompile(context)

        return {
            ast: this.ast,
            assembly: context.assembly
        }
    }
}