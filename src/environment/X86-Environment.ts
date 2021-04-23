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