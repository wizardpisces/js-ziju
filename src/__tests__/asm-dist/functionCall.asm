  .global _main

  .text

log:
  PUSH RBP
  MOV RBP, RSP

  PUSH 1
  PUSH [RBP + 16] # a
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

add:
  PUSH RBP
  MOV RBP, RSP

  PUSH [RBP + 24] # a
  CALL log
  MOV [RSP], RAX

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

  POP RAX
  POP RBP

  RET

_main:
  CALL main
  MOV RDI, RAX
  MOV RAX, 33554433
  SYSCALL
