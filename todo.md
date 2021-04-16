# TODOS
* build to NASM
* implement vm to run NASM
* build to LLVM IR

## 目前实现的 MASM 汇编的问题:

目前函数体内只支持一个表达式， 多个就会出现内存问题
### 原因：
每个表达式都会往stack push一个值
如果没被 callExpression等表达式消化掉就会导致内存异常
#### 优点：
轻松支持多个参数传递
#### 缺点：
函数体内**只能支持一个表达式**，同时也是返回，最后一个表达式 push stack的值会在函数体最后的pop rax消化

### 如何 fix
implement
[x86 calling convention](https://en.wikipedia.org/wiki/X86_calling_conventions)
[The 64 bit x86 C Calling Convention](https://aaronbloomfield.github.io/pdr/book/x86-64bit-ccc-chapter.pdf)



# 尝试
Babel-parse, Babel-traverse, Babel-plugins, Babel-template, Babel-generator, Babel-register，动态编译

如何实现 traverse，如何理解 Path 是 node之上的抽象层