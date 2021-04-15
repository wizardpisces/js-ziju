import cp from 'child_process'

describe('compiler x86', () => {
    it('test', () => {
        cp.execSync(
            `nasm -f macho64 ${__dirname}/asm-dist/nasm.asm && ld ${__dirname}/asm-dist/nasm.o -o ${__dirname}/asm-dist/nasm.out && ${__dirname}/asm-dist/nasm.out`,
        );
    });
});
