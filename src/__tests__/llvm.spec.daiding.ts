import {
    Assembler
} from '../index'
import { build, readSourceWithKernal } from './utils'

describe('compiler llvm', () => {
    it('print', () => {
        let result = new Assembler(readSourceWithKernal('tests/llvm/print.js')).compile()

        expect(result.assembly).toMatchSnapshot()

        build(result.assembly, 'print')
    });
});
