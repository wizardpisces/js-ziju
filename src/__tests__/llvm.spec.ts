import {
    Assembler
} from '../index'
import { buildLLVM, readSourceWithKernal} from './utils'

describe('compiler llvm', () => {

    it('print', () => {
        let result = new Assembler(readSourceWithKernal('tests/llvm/print.js')).llvmCompile()

        expect(result.assembly).toMatchSnapshot()

        buildLLVM(result.assembly, 'print')
    });
   
    it('functionCall', () => {
        let result = new Assembler(readSourceWithKernal('tests/llvm/functionCall.js')).llvmCompile()

        expect(result.assembly).toMatchSnapshot()

        buildLLVM(result.assembly, 'functionCall')
    });

    it('fib', () => {
        let result = new Assembler(readSourceWithKernal('tests/llvm/fib.js')).llvmCompile()

        expect(result.assembly).toMatchSnapshot()

        buildLLVM(result.assembly, 'fib')
    });

    it('tail-fib', () => {
        let result = new Assembler(readSourceWithKernal('tests/llvm/tail-fib.js')).llvmCompile()

        expect(result.assembly).toMatchSnapshot()

        buildLLVM(result.assembly, 'tail-fib')
    });
});
