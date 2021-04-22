import fs from 'fs'
import path from 'path'
import cp from 'child_process'

const kernel = fs.readFileSync(__dirname + '/kernel.js','utf-8');

export function readSource(src:string) {
    return fs.readFileSync(path.join(process.cwd(), src), 'utf8')
}

export function readSourceWithKernal(src){
    return kernel + '\n' + readSource(src)
}

export function build(program='',name='',buildDir = path.join(__dirname,'./asm-dist')) {
    fs.writeFileSync(`${buildDir}/${name}.asm`, program);
    cp.execSync(
        `gcc -mstackrealign -masm=intel -o ${buildDir}/${name} ${buildDir}/${name}.asm`,
    );

    // cp.execFileSync(`${buildDir}/${name}`)
}

export function buildLLVM(program = '', name = '', buildDir = path.join(__dirname, './llvm-dist')) {
    fs.writeFileSync(`${buildDir}/${name}.ll`, program);
    cp.execSync(`llc --x86-asm-syntax=intel -o ${buildDir}/${name}.s ${buildDir}/${name}.ll`);
    cp.execSync(`gcc -o ${buildDir}/${name} -masm=intel ${buildDir}/${name}.s`);

    cp.execSync(
        `gcc -mstackrealign -masm=intel -o ${buildDir}/${name} ${buildDir}/${name}.asm`,
    );
}