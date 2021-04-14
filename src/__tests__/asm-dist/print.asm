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

print:
  PUSH RBP
  MOV RBP, RSP

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

main:
  PUSH RBP
  MOV RBP, RSP

  PUSH 3
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
