import vm from "./vm";
import asm from "./asm";

export let code = `// Loads value 10 in R0 
// and calls Fibonacci routine

MOVV R0, 10
CALL 6
HALT

// This is the Fibonacci routing
// Expects number of Fibonacci 
// numbers in register R0

PUSH R0
MOVV R0, 0
MOVV R1, 1
MOVV R3, 1
PRINT R1

MOVR R2, R0
ADD R2, R1
PRINT R2
MOVR R0, R1
MOVR R1, R2
MOVV R2, 1
ADD R3, R2
POP R2
PUSH R2
JL R3, R2, 19
POP R0
RET
`;

let output = ''

export function assemble(code) {
    let bytes = asm.assemble(code);
    return bytes.toString();
}

export function run(txtBytes) {
    let bytes = getBytes(txtBytes);

    vm.init(bytes, (txt) => output += txt + '\n');
    vm.run();
    return output;
}

function getBytes(txt) {
    let bytes = txt.split(",");

    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(bytes[i]);
    }

    return bytes;
}

// vm.reset();

// vm.loadOS();
// vm.loadData(program);
// vm.schedule();

// run(assemble(code))

export function execute(txtBytes){
    let bytes = asm.assemble(txtBytes);
    vm.init(bytes, (txt:string|number) => output += txt + '\n');
    vm.run();
    return vm
}