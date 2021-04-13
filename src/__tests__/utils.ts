import fs from 'fs'
import path from 'path'
import cp from 'child_process'

export function readSource(src) {
    return fs.readFileSync(path.join(process.cwd(), src), 'utf8')
}

export function build(program='',name='',buildDir = 'asm-dist') {
    fs.writeFileSync(`${buildDir}/${name}.asm`, program);
    cp.execSync(
        `gcc -mstackrealign -masm=intel -o ${buildDir}/${name} ${buildDir}/${name}.asm`,
    );
}
