	.section	__TEXT,__text,regular,pure_instructions
	.macosx_version_min 10, 12
	.intel_syntax noprefix
	.globl	_printChar                      ## -- Begin function printChar
	.p2align	4, 0x90
_printChar:                             ## @printChar
	.cfi_startproc
## %bb.0:
	mov	qword ptr [rsp - 8], rdi
	lea	rsi, [rsp - 8]
	mov	eax, 33554436
	mov	edi, 1
	mov	edx, 1
	## InlineAsm Start
	syscall
	## InlineAsm End
	ret
	.cfi_endproc
                                        ## -- End function
	.globl	_printHelper                    ## -- Begin function printHelper
	.p2align	4, 0x90
_printHelper:                           ## @printHelper
	.cfi_startproc
## %bb.0:
	push	r14
	.cfi_def_cfa_offset 16
	push	rbx
	.cfi_def_cfa_offset 24
	push	rax
	.cfi_def_cfa_offset 32
	.cfi_offset rbx, -24
	.cfi_offset r14, -16
	mov	rbx, rdi
	cmp	rdi, 10
	movabs	r14, -3689348814741910323
	jl	LBB1_2
## %bb.1:                               ## %iftrue11
	mov	rax, rbx
	mul	r14
	mov	rdi, rdx
	shr	rdi, 3
	call	_printHelper
LBB1_2:                                 ## %ifend17
	mov	rax, rbx
	mul	r14
	shr	rdx, 2
	and	rdx, -2
	lea	rax, [rdx + 4*rdx]
	sub	rbx, rax
	or	rbx, 48
	mov	rdi, rbx
	call	_printChar
	add	rsp, 8
	pop	rbx
	pop	r14
	ret
	.cfi_endproc
                                        ## -- End function
	.globl	_print                          ## -- Begin function print
	.p2align	4, 0x90
_print:                                 ## @print
	.cfi_startproc
## %bb.0:
	push	rax
	.cfi_def_cfa_offset 16
	call	_printHelper
	mov	edi, 10
	call	_printChar
	pop	rax
	ret
	.cfi_endproc
                                        ## -- End function
	.globl	_tailFib                        ## -- Begin function tailFib
	.p2align	4, 0x90
_tailFib:                               ## @tailFib
	.cfi_startproc
## %bb.0:
	push	rax
	.cfi_def_cfa_offset 16
	mov	rax, rdi
	test	rdx, rdx
	jne	LBB3_2
## %bb.1:                               ## %iftrue17
	pop	rcx
	ret
LBB3_2:                                 ## %iffalse18
	add	rax, rsi
	dec	rdx
	mov	rdi, rsi
	mov	rsi, rax
	call	_tailFib
	pop	rcx
	ret
	.cfi_endproc
                                        ## -- End function
	.globl	_fibHelper                      ## -- Begin function fibHelper
	.p2align	4, 0x90
_fibHelper:                             ## @fibHelper
	.cfi_startproc
## %bb.0:
	push	rax
	.cfi_def_cfa_offset 16
	mov	rdx, rdi
	mov	esi, 1
	xor	edi, edi
	call	_tailFib
	pop	rcx
	ret
	.cfi_endproc
                                        ## -- End function
	.globl	_main                           ## -- Begin function main
	.p2align	4, 0x90
_main:                                  ## @main
	.cfi_startproc
## %bb.0:
	push	rax
	.cfi_def_cfa_offset 16
	mov	edi, 10
	call	_fibHelper
	mov	rdi, rax
	call	_print
	pop	rax
	ret
	.cfi_endproc
                                        ## -- End function
.subsections_via_symbols
