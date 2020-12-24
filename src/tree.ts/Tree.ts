@run
export class Tree {
    // todo : should be more specific
    ast: any
    constructor(ast: any) {
        this.ast = ast
    }
    toCode():string{
        return this.ast.value
    }

    evaluate(){
        
    }
}

function run(target){

}