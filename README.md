## Project Target

用工具可以制造工具，被制造出来的工具将来又可以制造新的工具。
编译器可以编译出新的编译器。
Tools can be used to make tools, and the manufactured tools can be used to make new tools in the future.
The compiler can compile a new compiler.
## Js self compiling

两套流程：
Two sets of processes：

1. js source code -> compile to ast -> run ast
2. js source code -> compile to ast -> compile ast to assembly code -> compile assembly code to machine code -> run machine code

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

//example: fibonacci

interpretJsCode = `
function fibonacci(n) {
    let f0 = 0,
        f1 = 1,
        temp = f1,
        i = 0;

    while (i < n) {
        console.log(f1)
        temp = f1;
        f1 = f1 + f0;
        f0 = temp;
        i++;
    }

}
fibonacci(5)
`
new Interpreter(interpretJsCode).interpret()
/* output:
* 1 1 2 3 5
*/
```

### How to test (support node>=12)
```
npm install
```

```
npm run jest
```
## Refenrece

* [build a sass compiler from scratch](https://github.com/wizardpisces/tiny-sass-compiler)
* [making-system-calls-from-assembly-in-mac-os-x](https://filippo.io/making-system-calls-from-assembly-in-mac-os-x/)
* [compiler-basics-lisp-to-assembly](https://notes.eatonphil.com/compiler-basics-lisp-to-assembly.html)
* [ir-is-better-than-assembly](https://idea.popcount.org/2013-07-24-ir-is-better-than-assembly/)
