import os from 'os';

export type Platform = 'darwin' | 'linux'
export type SystemCall = { 'write': number, 'exit': number }

export const SYSCALL_MAP: SystemCall = {
    darwin: {
        exit: 0x2000001,
        write: 0x2000004,
    },
    linux: {
        exit: 60,
        write: 1,
    }
}[os.platform() as Platform];