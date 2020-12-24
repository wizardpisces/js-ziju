export class Tree {
    // todo : should be more specific
    json: any
    constructor(json: any) {
        this.json = json
    }
    toCode():string{
        return this.json.value
    }
}