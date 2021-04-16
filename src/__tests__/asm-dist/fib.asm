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

fib:
  PUSH RBP
  MOV RBP, RSP

  # If
    # <
    PUSH [RBP + 16] # n
    PUSH 2
    POP RAX
    CMP [RSP], RAX
    MOV RAX, 0
    MOV DWORD PTR [RSP], 1
    CMOVB RAX, [RSP]
    MOV [RSP], RAX
    # End <

  POP RAX
  TEST RAX, RAX
  JZ .else_branch1

  # If then
  PUSH [RBP + 16] # n
  JMP .after_else_branch1

  # If else
.else_branch1:
    # ADD
      # SUB
      PUSH [RBP + 16] # n
      PUSH 1
      POP RAX
      SUB [RSP], RAX
      # End SUB
    CALL fib
    MOV [RSP], RAX

      # SUB
      PUSH [RBP + 16] # n
      PUSH 2
      POP RAX
      SUB [RSP], RAX
      # End SUB
    CALL fib
    MOV [RSP], RAX

    POP RAX
    ADD [RSP], RAX
    # End ADD
.after_else_branch1:
  # End if
  POP RAX
  POP RBP

  RET

main:
  PUSH RBP
  MOV RBP, RSP

  PUSH 5
  CALL fib
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
