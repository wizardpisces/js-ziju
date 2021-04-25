import {
    Assembler
} from '../index'
import { buildLLVM, readSourceWithKernal } from './utils'

describe('compiler llvm', () => {
    it('print', () => {
        let result = new Assembler(readSourceWithKernal('tests/llvm/print.js')).llvmCompile()

        expect(result.assembly).toMatchSnapshot()

        buildLLVM(result.assembly, 'print')
    });
});
