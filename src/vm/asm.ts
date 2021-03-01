let instructions = {
    MOVR: 10,
    MOVV: 11,
    ADD: 20,
    SUB: 21,
    PUSH: 30,
    POP: 31,
    JP: 40,
    JL: 41,
    CALL: 42,
    RET: 50,
    PRINT: 60,
    HALT: 255
}

let registers = {
    R0: 0,
    R1: 1,
    R2: 2,
    R3: 3
}

export function assemble(code) {
    let tokens = getTokens(code);
    let bytes = getBytecode(tokens);

    return bytes;
}

function getBytecode(tokens) {
    let bytes = [];

    for (let line of tokens) {
        for (let i = 0; i < line.length; i++) {
            let token = line[i].trim().toUpperCase();

            // First token in a line is assumed to be an instruction
            if (i == 0) {
                token = instructions[token];
                bytes.push(token ? token : -1);
            } else {
                // If operand start with R is assumed to be a register
                if (token.startsWith("R"))
                    token = registers[token];

                bytes.push(parseInt(token));
            }
        }
    }

    return bytes;
}

function getTokens(code) {
    let arLines = code.split(/\r?\n/);

    // Remove comments and empty lines
    for (let i = arLines.length - 1; i >= 0; i--) {
        let txt = arLines[i].trim();
        if (!txt || txt.startsWith("//")) {
            arLines.splice(i, 1);
            continue;
        }

        // Split each line by " " or ,
        arLines[i] = txt.split(/[\s,]+/);
    }

    return arLines;
}

export default {
    assemble
}