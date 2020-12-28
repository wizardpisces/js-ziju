import { 
    CodeGen,
    Interpreter 
} from './src'


let interpretJsCode = `
console.log('=== MemberExpression evaluated =========');
function fn(){
    console.log('=== FunctionDeclaration evaluated =====')
}
fn()
`

console.log(new CodeGen('console.log(1);').toCode());
new Interpreter(interpretJsCode).interpret()