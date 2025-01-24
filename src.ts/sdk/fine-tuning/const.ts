/**
 * MESSAGE_FOR_ENCRYPTION_KEY is a fixed message used to derive the encryption key.
 *
 * Background:
 * To ensure a consistent and unique encryption key can be generated from a user's Ethereum wallet,
 * we utilize a fixed message combined with a signing mechanism.
 *
 * Purpose:
 * - This string is provided to the Ethereum signing function to generate a digital signature based on the user's private key.
 * - The produced signature is then hashed (using SHA-256) to create a consistent 256-bit encryption key from the same wallet.
 * - This process offers a way to protect data without storing additional keys.
 *
 * Note:
 * - The uniqueness and stability of this message are crucial; do not change it unless you fully understand the impact
 *   on the key derivation and encryption process.
 * - Because the signature is derived from the wallet's private key, it ensures that different wallets cannot produce the same key.
 */
export const MESSAGE_FOR_ENCRYPTION_KEY = 'MESSAGE_FOR_ENCRYPTION_KEY'

export const ZG_RPC_ENDPOINT_TESTNET = 'https://evmrpc-testnet.0g.ai'

export const INDEXER_URL_STANDARD =
    'https://indexer-storage-testnet-standard.0g.ai'
export const INDEXER_URL_TURBO = 'https://indexer-storage-testnet-turbo.0g.ai'

export const MODEL_HASH_MAP: {
    [key: string]: { [key: string]: string }
} = {
    'distilbert-base-uncased': {
        turbo: '0x7f2244b25cd2219dfd9d14c052982ecce409356e0f08e839b79796e270d110a7',
        standard: '',
        description:
            'This model is a distilled version of the BERT base model. The code for the distillation process can be found here. This model is uncased: it does not make a difference between english and English. URL: https://huggingface.co/distilbert/distilbert-base-uncased',
    },
    // TODO: remove
    'mock-model': {
        turbo: '0xf463fe8c26e7dbca20716eb3c81ac1f3ea23a6c5dbe002bf46507db403c71578',
        standard: '',
        description: '',
    },
}
