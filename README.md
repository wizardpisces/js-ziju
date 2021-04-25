# 工程目的
编译原理学习工程

用工具可以制造工具，被制造出来的工具将来又可以制造新的工具。
编译器可以编译出新的编译器。

# Project Target:
Learning project for people who has interest in compiler

Tools can be used to make tools, and the manufactured tools can be used to make new tools in the future.
The compiler can compile a new compiler.
## 知识范围
* 高级语言(eg:javascript)如何编译成 x86 汇编
* 高级语言(eg:javascript)如何编译成 llvm
* 如何直接解释并运行高级语言(eg:javascript)

## what you will learn
* how to compile js to x86 assemby
* how to compile js to llvm
* how to interpret js source code
## How to Use

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

## Detail

Please reference jest test cases or you could make pr to add more info
## Refenrece

* [build a sass compiler from scratch](https://github.com/wizardpisces/tiny-sass-compiler)
* [making-system-calls-from-assembly-in-mac-os-x](https://filippo.io/making-system-calls-from-assembly-in-mac-os-x/)
* [compiler-basics-lisp-to-assembly](https://notes.eatonphil.com/compiler-basics-lisp-to-assembly.html)
* [ir-is-better-than-assembly](https://idea.popcount.org/2013-07-24-ir-is-better-than-assembly/)
