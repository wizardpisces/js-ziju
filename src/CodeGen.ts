import ESTree from 'estree'
import {parse} from 'acorn'
import { Program } from './tree/Program'

export class CodeGen {
    ast: any
    constructor(code:string){
        this.ast = parse(code, { ecmaVersion: 2020 });
    }
    toCode(){
        return new Program(this.ast as ESTree.Program).toCode()
    }
    // accept(visitor: Visitor) {
    //     visitor.visit()
    // }
    // visit() {

    // }
}