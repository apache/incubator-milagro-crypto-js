import {BIG} from "./big";
import {ECP2} from "./ecp2";
import {EcpCommon} from "./ecp-common";

export class ECP extends EcpCommon<ECP> {

    public constructor(input?: ECP);

    static generator(): ECP;

    static fromBytes(array: Uint8Array): ECP;

    static mapit(hash: Uint8Array): ECP;

    public setxy(x: BIG, y: BIG): void;

    public setx(x: BIG): void;

    public copy(p: ECP): void;

    public neg(): void;

    public inf(): void;

    public affine(): void;

    public getX(): BIG;

    public getY(): BIG;

    public getS(): boolean;

    public sub(p: ECP|ECP2): void;

    public getX(): ECP;

    public toBytes(destination: Uint8Array, compress: boolean): void;

}
