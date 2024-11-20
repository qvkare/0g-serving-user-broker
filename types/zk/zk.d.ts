import { SignatureBuffer } from './crypto';
import { Request } from './request';
export type DoublePackedPubkey = [bigint, bigint];
export type PackedPrivkey = [bigint, bigint];
export type KeyPair = {
    packedPrivkey: PackedPrivkey;
    doublePackedPubkey: DoublePackedPubkey;
};
export declare function genKeyPair(): Promise<KeyPair>;
export declare function signData(data: Request[], packedPrivkey: PackedPrivkey): Promise<SignatureBuffer[]>;
export declare function verifySignature(data: Request[], signatures: Uint8Array[], doublePackedPubkey: DoublePackedPubkey): Promise<boolean[]>;
//# sourceMappingURL=zk.d.ts.map