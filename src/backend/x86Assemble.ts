import os from 'os';
import { X86Context } from "@/environment/context";
export type Platform = 'darwin' | 'linux'
export type SystemCall = { 'write': number, 'exit': number }

const SYSCALL_MAP: SystemCall = {
    darwin: {
        exit: 0x2000001,
        write: 0x2000004,
    },
    linux: {
        exit: 60,
        write: 1,
    }
}[os.platform() as Platform];

export function emitPrefix(context: X86Context) {
    context.emit(1, '.global _main\n');

    context.emit(1, '.text\n');
}

export function emitPostfix(context: X86Context) {
    context.emit(0, '_main:');
    context.emit(1, 'CALL main');
    context.emit(1, 'MOV RDI, RAX'); // Set exit arg
    context.emit(1, `MOV RAX, ${SYSCALL_MAP['exit']}`);
    context.emit(1, 'SYSCALL');
}

export type X86NamePointer = { name: string, offset: number }
export class X86Environment {
    localOffset: number
    map: Record<string, number>
    constructor() {
        this.localOffset = 1;
        this.map = {};
    }

    assign(name: string): string {
        const safe = name.replace('-', '_');
        this.map[safe] = this.localOffset++;
        return safe;
    }

    symbol(): number {
        return this.localOffset++;
    }

    lookup(name: string): X86NamePointer | null {
        const safe = name.replace('-', '_');
        if (this.map[safe]) {
            return { name: safe, offset: this.map[safe] };
        }

        return null;
    }

    copy(): X86Environment {
        const s = new X86Environment();
        // In the future we may need to store s.scopeOffset = this.scopeOffset + 1
        // so we can read outer-scoped values at runtime.
        s.map = { ...this.map };
        return s;
    }
}