import ESTree from 'estree'
import {parse} from 'acorn'
import { Program } from './tree.ts/Program'

export class CodeGen {
    json: any
    constructor(code:string){
        this.json = parse(code, { ecmaVersion: 2020 });
    }
    toCode(){
        return new Program(this.json as ESTree.Program).toCode()
    }
    // accept(visitor: Visitor) {
    //     visitor.visit()
    // }
    // visit() {

    // }
}