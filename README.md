# Project Description
A compiler for a javascript language targeting LLVM IR, x86 assembly , self interpreting and more to come...

**not for production**

## A learning project for you to understand below list
* how a compiler work and how to build one
* how does code run from source
* how to build code to Assembly or LLVM IR

## Examples

### Interpret

```ts
import { 
    Interpreter 
} from './src'


let code = `
console.log('=== MemberExpression evaluated =========');
function fn(){
    console.log('=== FunctionDeclaration evaluated =====')
}
fn()
`

new Interpreter(code).interpret()

/* output:
* === MemberExpression evaluated =========
* === FunctionDeclaration evaluated =====
*/
```
### X86 MASM Assembly

```js
import {Assembler} from './src'

let kernalCode = `
function printChar($$c){
    console.log(1,$$c,1)
}

function printHelper(n) {
    if(n>9){
        printHelper(n / 10)
    }
    // 48 is the ASCII code for '0'
    printChar(48 + n % 10);
}

function print(n){
    printHelper(n)
    printChar(10); // 换行
}`

let code = `
function main(){
    print(231)
    print(4)
}`

let result = new Assembler(kernal+code).compile()

```
result.assembly
```assembly
  .global _main

  .text

printChar:
  PUSH RBP
  MOV RBP, RSP

  PUSH 1
  MOV RAX, RBP
  ADD RAX, 16 # $$c
  PUSH RAX
  PUSH 1
  POP RDX
  POP RSI
  POP RDI
  MOV RAX, 33554436
  SYSCALL
  PUSH RAX

  POP RAX
  POP RBP

  RET

printHelper:
  PUSH RBP
  MOV RBP, RSP

  # If
    # >
    PUSH [RBP + 16] # n
    PUSH 9
    POP RAX
    CMP [RSP], RAX
    MOV RAX, 0
    MOV DWORD PTR [RSP], 1
    CMOVA RAX, [RSP]
    MOV [RSP], RAX
    # End >

  POP RAX
  TEST RAX, RAX
  JZ .else_branch1

  # If then
    # DIV
    PUSH [RBP + 16] # n
    PUSH 10
    POP RAX
    XCHG [RSP], RAX
    XOR RDX, RDX
    DIV QWORD PTR [RSP]
    MOV [RSP], RAX
  CALL printHelper
  MOV [RSP], RAX

  JMP .after_else_branch1

  # If else
.else_branch1:
  PUSH 0 # Null else branch
.after_else_branch1:
  # End if
  POP RAX # Ignore non-final expression
    # ADD
    PUSH 48
      # DIV
      PUSH [RBP + 16] # n
      PUSH 10
      POP RAX
      XCHG [RSP], RAX
      XOR RDX, RDX
      DIV QWORD PTR [RSP]
      MOV [RSP], RDX
    POP RAX
    ADD [RSP], RAX
    # End ADD
  CALL printChar
  MOV [RSP], RAX

  POP RAX
  POP RBP

  RET

print:
  PUSH RBP
  MOV RBP, RSP

  PUSH [RBP + 16] # n
  CALL printHelper
  MOV [RSP], RAX

  POP RAX # Ignore non-final expression
  PUSH 10
  CALL printChar
  MOV [RSP], RAX

  POP RAX
  POP RBP

  RET

main:
  PUSH RBP
  MOV RBP, RSP

  PUSH 231
  CALL print
  MOV [RSP], RAX

  POP RAX # Ignore non-final expression
  PUSH 4
  CALL print
  MOV [RSP], RAX

  POP RAX
  POP RBP

  RET

_main:
  CALL main
  MOV RDI, RAX
  MOV RAX, 33554433
  SYSCALL

```

### LLVM
```js
import {Assembler} from './src'

let kernalCode = `
function printChar($$c){
    console.log(1,$$c,1)
}

function printHelper(n) {
    if(n>9){
        printHelper(n / 10)
    }
    // 48 is the ASCII code for '0'
    printChar(48 + n % 10);
}

function print(n){
    printHelper(n)
    printChar(10); // 换行
}`

let code = `
function main(){
    print(311)
    // print(4)
}`

let result = new Assembler(kernal+code).llvmCompile()

```
result.assembly
```llvm
define i64 @printChar(i64 %$$c) {
  %sym5 = add i64 1, 0
  %sym7 = add i64 %$$c, 0
  %sym6 = alloca i64, align 4
  store i64 %sym7, i64* %sym6, align 4
  %sym8 = add i64 1, 0
  %sym9 = add i64 33554436, 0
  %sym4 = call i64 asm sideeffect "syscall", "=r,{rax},{rdi},{rsi},{rdx},~{dirflag},~{fpsr},~{flags}" (i64 %sym9, i64 %sym5, i64* %sym6, i64 %sym8)
}

define i64 @printHelper(i64 %n) {
  %ifresult8 = alloca i64, align 4
  %sym9 = add i64 %n, 0
  %sym10 = add i64 9, 0
  %sym7 = icmp sgt i64 %sym9, %sym10
  br i1 %sym7, label %iftrue11, label %iffalse12
iftrue11:
  %sym15 = add i64 %n, 0
  %sym16 = add i64 10, 0
  %sym14 = udiv i64 %sym15, %sym16
  %sym13 = call i64 @printHelper(i64 %sym14)
  store i64 %sym13, i64* %ifresult8, align 4
  br label %ifend17
iffalse12:
  br label %ifend17
ifend17:
  %sym6 = load i64, i64* %ifresult8, align 4
  %sym19 = add i64 48, 0
  %sym21 = add i64 %n, 0
  %sym22 = add i64 10, 0
  %sym20 = urem i64 %sym21, %sym22
  %sym18 = add i64 %sym19, %sym20
  %sym6 = call i64 @printChar(i64 %sym18)
}

define i64 @print(i64 %n) {
  %sym9 = add i64 %n, 0
  %sym8 = call i64 @printHelper(i64 %sym9)
  %sym10 = add i64 10, 0
  %sym8 = call i64 @printChar(i64 %sym10)
}

define i64 @main() {
  %sym10 = add i64 311, 0
  %sym9 = call i64 @print(i64 %sym10)
}
```

### How to test (support node>=12)
```
npm install
```

```
npm run jest
```

## Detail

Further info could reference test cases
## Refenrece
### Project
  * [build a sass compiler from scratch](https://github.com/wizardpisces/tiny-sass-compiler)
### LLVM
* Manual
  * [LLVM](https://llvm.org/docs/LangRef.html)
### NASM
* Tutorial
  * [NASM](https://cs.lmu.edu/~ray/notes/nasmtutorial/)
### MASM X86 Assembly
* Manual
  * [X86-assembly-instructions](https://www.aldeid.com/wiki/X86-assembly/Instructions/mov)
* Tutorial
  * [NASM](https://cs.lmu.edu/~ray/notes/nasmtutorial/)
* Article
  * [introduction-to-x64-assembly](https://software.intel.com/content/www/us/en/develop/articles/introduction-to-x64-assembly.html)
### Common
* Project
  * [Estree](https://github.com/estree/estree/blob/master/es2015.md)
* Tools
  * [online llvm compiler](http://ellcc.org/demo/index.cgi)
  * [compiler explorer](https://godbolt.org/)
  * [ast explorer](https://astexplorer.net/#/gist/244e2fb4da940df52bf0f4b94277db44/e79aff44611020b22cfd9708f3a99ce09b7d67a8)
* Article
  * [compiler-basics-lisp-to-assembly](https://notes.eatonphil.com/compiler-basics-lisp-to-assembly.html)
  * [vm-arch](https://www.codeproject.com/Articles/461052/Stack-Based-vs-Register-Based-Virtual-Machine-Arch)
  * [making-system-calls-from-assembly-in-mac-os-x](https://filippo.io/making-system-calls-from-assembly-in-mac-os-x/)
  * [ir-is-better-than-assembly](https://idea.popcount.org/2013-07-24-ir-is-better-than-assembly/)
  * [编程达到一个高的境界就是自制脚本语言](https://cloud.tencent.com/developer/news/305527)
