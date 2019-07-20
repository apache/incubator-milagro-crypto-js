import {AES} from "./aes";

export class CTX {
    public constructor(curve: string);
    public AES: typeof AES;
}
