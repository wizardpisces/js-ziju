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
  JZ .else_branch2

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

  JMP .after_else_branch2

  # If else
.else_branch2:
  PUSH 0 # Null else branch
.after_else_branch2:
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

add:
  PUSH RBP
  MOV RBP, RSP

    # ADD
    PUSH [RBP + 24] # a
    PUSH [RBP + 16] # b
    POP RAX
    ADD [RSP], RAX
    # End ADD
  POP RAX
  POP RBP

  RET

main:
  PUSH RBP
  MOV RBP, RSP

  PUSH 1
  PUSH 2
  CALL add
  ADD RSP, 16
  PUSH RAX

  PUSH 3
  CALL add
  ADD RSP, 16
  PUSH RAX

  CALL print
  MOV [RSP], RAX

  POP RAX # Ignore non-final expression
  PUSH 1
  PUSH 2
  CALL add
  ADD RSP, 16
  PUSH RAX

  PUSH 3
  PUSH 4
  CALL add
  ADD RSP, 16
  PUSH RAX

  CALL add
  ADD RSP, 16
  PUSH RAX

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
