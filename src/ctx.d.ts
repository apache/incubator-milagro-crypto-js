import {AES} from "./aes";
import {BIG, DBIG} from "./big";
import {FP} from "./fp";
import {FP2} from "./fp2";
import {FP4} from "./fp4";
import {FP12} from "./fp12";
import {FP8} from "./fp8";
import {ECP} from "./ecp";
import {ECP2} from "./ecp2";
import {PAIR} from "./pair";
import {RomField} from "./rom_field";

export enum CtxOption {
    ED25519 = "ED25519",
    C25519 = "C25519",
    SECP256K1 = "SECP256K1",
    NIST256 = "NIST256",
    NIST384 = "NIST384",
    ANSSI = "ANSSI",
    HIFIVE = "HIFIVE",
    GOLDILOCKS = "GOLDILOCKS",
    NIST521 = "NIST521",
    NUMS256W = "NUMS256W",
    NUMS256E = "NUMS256E",
    NUMS384W = "NUMS384W",
    NUMS384E = "NUMS384E",
    NUMS512W = "NUMS512W",
    NUMS512E = "NUMS512E",
    FP256BN = "FP256BN",
    FP512BN = "FP512BN",
    BN254 = "BN254",
    BN254CX = "BN254CX",
    BLS383 = "BLS383",
    BLS24 = "BLS24",
    BLS48 = "BLS48",
    BLS381 = "BLS381",
    BLS461 = "BLS461",
    RSA2048 = "RSA2048",
    RSA3072 = "RSA3072",
    RSA4096 = "RSA4096"
}

export class CTX {
    public constructor(input_param?: CtxOption);
    public AES: typeof AES;
    public BIG: typeof BIG;
    public DBIG: typeof DBIG;
    public FP: typeof FP;
    public FP2: typeof FP2;
    public FP4: typeof FP4;
    public FP8: typeof FP8;
    public FP12: typeof FP12;
    public ECP: typeof ECP;
    public ECP2: typeof ECP2;

    public PAIR: PAIR;
    public ROM_FIELD: RomField;
}
