## Js self compiling

generate js source code by js's ast tree

interpret js by js'ast tree

### How to Use

```ts
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
/* output: 
* console.log(1)
*/

new Interpreter(interpretJsCode).interpret()
/* output:
* === MemberExpression evaluated =========
* === FunctionDeclaration evaluated =====
*/
```

### How to run (support node>=12)

```
npm install
npm run test
```

## Refenrece

* [build a sass compiler from scratch](https://github.com/wizardpisces/tiny-sass-compiler)
