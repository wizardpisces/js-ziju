# Todos
* 3111 > 10 number is not printable yet
* compile to LLVM IR
* compile to c++/v8
    * reference [jsc](https://github.com/eatonphil/jsc)
* compile to NASM and implement vm(reference [a-virtual-machine](http://craftinginterpreters.com/a-virtual-machine.html)) to run NASM

# 现阶段的问题
## 目前实现的 MASM 汇编的问题:

目前BlockStatement嵌套，并且包含多条Expression的时候会解析会有问题，因为嵌套后里面再有更多条Expression

### 如何 fix
implement
[x86 calling convention](https://en.wikipedia.org/wiki/X86_calling_conventions)
[The 64 bit x86 C Calling Convention](https://aaronbloomfield.github.io/pdr/book/x86-64bit-ccc-chapter.pdf)


