import {ECP2} from "./ecp2";
import {FP12} from "./fp12";
import {ECP} from "./ecp";

export class PAIR {

    public ate(p1: ECP2, q1: ECP): FP12;

    public fexp(p: FP12): FP12;

}
