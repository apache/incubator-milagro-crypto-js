import {BIG} from "./big";

export abstract class EcpCommon<T> {

    is_infinity(): boolean;

    add(p: T): void;

    copy(a: T): void;

    mul(a: BIG): T;

    equals(p: T): boolean;

}

