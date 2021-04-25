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
  %sym13 = tail call i64 @printHelper(i64 %sym14)
  ret i64 %sym13
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

