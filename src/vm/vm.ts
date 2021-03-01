// r0, r1, r2, r3
let regs = [0, 0, 0, 0];

let stack:number[] = [];

let program = [];

let pc = 0;

let halted = false;

let callback

export function init(prg, cb) {
    program = prg;

    pc = 0;
    halted = false;
    stack = [];
    callback = cb;
}

export function run() {
    while (!halted) {
        runone();
    }
}

function runone() {
    if (halted)
        return;

    let instr = program[pc],
        rdst: number, rsrc: number, val: number, addr: number, r1: number, r2: number, reg: number;

    switch (instr) {
        // movr rdst, rsrc
        case 10:
            pc++;
            rdst = program[pc++];
            rsrc = program[pc++];
            regs[rdst] = regs[rsrc];
            break;

            // movv rdst, val
        case 11:
            pc++;
            rdst = program[pc++];
            val = program[pc++];
            regs[rdst] = val;
            break;

            // add rdst, rsrc
        case 20:
            pc++;
            rdst = program[pc++];
            rsrc = program[pc++];
            regs[rdst] += regs[rsrc];
            break;

            // sub rdst, rsrc
        case 21:
            pc++;
            rdst = program[pc++];
            rsrc = program[pc++];
            regs[rdst] -= regs[rsrc];
            break;

            // push rsrc
        case 30:
            pc++;
            rsrc = program[pc++];
            stack.push(regs[rsrc]);
            break;

            // pop rdst
        case 31:
            pc++;
            rdst = program[pc++];
            if(stack.length){
                abort('Pop rdst error')
            }
            regs[rdst] = stack.pop() as number;
            break;

            // jp addr
        case 40:
            pc++;
            addr = program[pc++];
            pc = addr;
            break;

            // jl r1, r2, addr
        case 41:
            pc++;
            r1 = program[pc++];
            r2 = program[pc++];
            addr = program[pc++];
            if (regs[r1] < regs[r2])
                pc = addr
            break;

            // call addr
        case 42:
            pc++;
            addr = program[pc++];
            stack.push(pc);
            pc = addr;
            break;

            // ret
        case 50:
            pc++;
            if(!stack.length) abort('Ret addr unknown!')
            addr = stack.pop() as number;
            pc = addr;
            break;

            // print reg
        case 60:
            pc++;
            reg = program[pc++];
            println(regs[reg]);
            break;

            // halt
        case 255:
            pc++;
            halted = true;
            break;

        default:
            println("Error in bytecode, instr unknown:" +instr);
            halted = true;
            break;
    }

    if (pc >= program.length) {
        halted = true;
    }

}

function abort(msg:string){
    throw Error(msg)
}

function println(txt:string | number) {
    console.log(txt)
    callback(txt)
}

export default {
    init,
    run
}