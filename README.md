## Js self compiling

包含两套流程：

1. js source code -> compile to ast -> run ast
2. js source code -> compile to ast -> compile to assembly code -> run assembly code on virtual machine (compile assembly code to machine code -> run machine code)

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
```
npm run example
```
## Refenrece

* [build a sass compiler from scratch](https://github.com/wizardpisces/tiny-sass-compiler)
* [compiler-basics-lisp-to-assembly](https://notes.eatonphil.com/compiler-basics-lisp-to-assembly.html)
* https://idea.popcount.org/2013-07-24-ir-is-better-than-assembly/
