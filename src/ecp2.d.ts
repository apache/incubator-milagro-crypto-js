import {EcpCommon} from "./ecp-common";
import {FP2} from "./fp2";

export class ECP2 extends EcpCommon<ECP2> {

    constructor(input?: ECP2);

    setxy(xi: FP2, yi: FP2): void;

    setx(xi: FP2): void;

    copy(p: ECP2): void;

    getX(): FP2;

    getY(): FP2;

    affine(): void;

}
