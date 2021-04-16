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

tailFib:
  PUSH RBP
  MOV RBP, RSP

  # If
    # ===
    PUSH [RBP + 16] # n
    PUSH 0
    POP RAX
    CMP [RSP], RAX
    MOV RAX, 0
    MOV DWORD PTR [RSP], 1
    CMOVE RAX, [RSP]
    MOV [RSP], RAX
    # End ===

  POP RAX
  TEST RAX, RAX
  JZ .else_branch2

  # If then
  PUSH [RBP + 32] # n1
  JMP .after_else_branch2

  # If else
.else_branch2:
  PUSH [RBP + 24] # n2
    # ADD
    PUSH [RBP + 32] # n1
    PUSH [RBP + 24] # n2
    POP RAX
    ADD [RSP], RAX
    # End ADD
    # SUB
    PUSH [RBP + 16] # n
    PUSH 1
    POP RAX
    SUB [RSP], RAX
    # End SUB
  CALL tailFib
  ADD RSP, 24
  PUSH RAX

.after_else_branch2:
  # End if
  POP RAX
  POP RBP

  RET

fibHelper:
  PUSH RBP
  MOV RBP, RSP

  PUSH 0
  PUSH 1
  PUSH [RBP + 16] # n
  CALL tailFib
  ADD RSP, 24
  PUSH RAX

  POP RAX
  POP RBP

  RET

main:
  PUSH RBP
  MOV RBP, RSP

  PUSH 5
  CALL fibHelper
  MOV [RSP], RAX

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
