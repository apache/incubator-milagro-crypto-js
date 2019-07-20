import {AES} from "./aes";

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
}
