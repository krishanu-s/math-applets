import { MObject } from "../base";
export declare class Parameter extends MObject {
    _value: number;
    callbacks: ((x: number) => void)[];
    constructor();
    set_value(x: number): this;
    get_value(): number;
    add_callback(callback: (x: number) => void): this;
    clear(): this;
    do_callbacks(): void;
}
//# sourceMappingURL=parameter.d.ts.map