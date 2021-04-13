import {
  Assembler
} from '../index'
import { build, readSource } from './utils'

describe('compiler x86', () => {
  it('functionCall', () => {
    let result = new Assembler(readSource('tests/functionCall.js')).compile()

    expect(result.assembly).toMatchSnapshot()

    build(result.assembly,'functionCall')
  });
});
