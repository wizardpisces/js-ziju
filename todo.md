# Todos

1. compile to c++/v8
    * reference [jsc](https://github.com/eatonphil/jsc)
2. js emulator in js (go-amd64-emulator)[https://github.com/eatonphil/go-amd64-emulator/tree/944b590c4eee7ad726169096e2131a3f6e9808d9]
3. compile to LLVM IR
    * (Tail call optimization)[https://javascript.plainenglish.io/javascript-optimizations-tail-call-optimization-tco-471b4f8e4f37]
    * solution for function return type determination
    * string?
    * Lists and dynamic memory?
    * class ?
    * Self-hosting?
    * Foreign function calls?
4. compile to NASM and implement vm(reference [a-virtual-machine](http://craftinginterpreters.com/a-virtual-machine.html)) to run NASM

## Optimize

* tests/asm/fib 函数里面包含多条 Statement 生成的 x86 asm会运行出问题
* tests/llvm/fib if-else optimize
* use traverse visitor mode (reference here)[https://raw.githubusercontent.com/wizardpisces/tiny-sass-compiler/master/src/genCodeVisitor.ts] to refactor compile to code , use estree-walker

# 思考：
~~并不是所有的生成code都适合使用visitor模式来做，如果同一类型的expression在不同语境下生成不同code则不适合，例如: 
在生成 x86 Assembly 的过程中，同样的类型Identifier，在 CallExpression 是callee.type的类型，那么会触发普通的函数执行编译，但是在普通语境下，则是 push Stack操作~~

# 现阶段的问题
## 目前实现的 MASM 汇编的问题:

目前BlockStatement嵌套，并且包含多条Expression的时候会解析会有问题，因为嵌套后里面再有更多条Expression

### 如何 fix
implement
[x86 calling convention](https://en.wikipedia.org/wiki/X86_calling_conventions)
[The 64 bit x86 C Calling Convention](https://aaronbloomfield.github.io/pdr/book/x86-64bit-ccc-chapter.pdf)


