import { createSolanaClient, getMinimumBalanceForRentExemption, createTransaction, generateKeyPairSigner, getExplorerLink, getSignatureFromTransaction, signTransactionMessageWithSigners, type SolanaClusterMoniker, type Blockhash, type KeyPairSigner } from "gill";
import { loadKeypairSignerFromFile } from "gill/node";
import { getAddMemoInstruction, getCreateAccountInstruction, getCreateMetadataAccountV3Instruction, getTokenMetadataAddress } from "gill/programs";
import { getInitializeMintInstruction, getMintSize, TOKEN_PROGRAM_ADDRESS, buildCreateTokenTransaction } from "gill/programs/token";

// global.__GILL_DEBUG__ = true;
global.__GILL_DEBUG_LEVEL__ = "debug";

const signer = await loadKeypairSignerFromFile(
    "junjMfTB26qPGEcUWQhjE8QRqFmcBgyNZQhhC6mFVUX.json"
);
const cluster: SolanaClusterMoniker = "devnet";
const { rpc, sendAndConfirmTransaction } = createSolanaClient({
    urlOrMoniker: cluster
});

const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
console.log(latestBlockhash);

const mint = await generateKeyPairSigner();
console.log("mint:", mint);

// use the easy way to create token
const tx2 = await buildCreateTokenTransaction({
    feePayer: signer,
    version: "legacy",
    decimals: 9,
    mint,
    metadata: {
        name: "OPOS",
        symbol: "OPOS",
        uri: "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/Climate/metadata.json",
        isMutable: true,
    },
    latestBlockhash,
})

const tx3 = await buildCreateTokenTransaction({
    feePayer: signer,
    version: "legacy",
    decimals: 9,
    mint,
    metadata: {
        name: "Life++ Exploration Community",
        symbol: "Life++",
        uri: "https://gateway.irys.xyz/TQfa5EGdunAjEfNl-W8mVJgQOjdmNJqzqe_lc3dsIVE",
        isMutable: true,
    },
    latestBlockhash,
})


const tx = await createTokenMint(mint, signer, latestBlockhash);
const signedTx = await signTransactionMessageWithSigners(tx3);
console.log("signedTx:");
console.log(signedTx);

await sendAndConfirmTransaction(signedTx);

console.log(getExplorerLink({
    transaction: getSignatureFromTransaction(signedTx),
    cluster
}))

async function createTokenMint(mint: KeyPairSigner, signer: KeyPairSigner, latestBlockhash: { blockhash: Blockhash; lastValidBlockHeight: bigint }) {
    const space = getMintSize();

    const metadata = await getTokenMetadataAddress(mint)

    const tx = createTransaction({
        feePayer: signer,
        version: "legacy",
        instructions: [
            getCreateAccountInstruction({
                space,
                lamports: getMinimumBalanceForRentExemption(space),
                newAccount: mint,
                payer: signer,
                programAddress: TOKEN_PROGRAM_ADDRESS,
            }),
            getInitializeMintInstruction({
                mint: mint.address,
                decimals: 9,
                mintAuthority: signer.address,
                freezeAuthority: signer.address,

            }, {
                programAddress: TOKEN_PROGRAM_ADDRESS,
            }),
            getCreateMetadataAccountV3Instruction({
                collectionDetails: null,
                isMutable: true,
                updateAuthority: signer,
                mint: mint.address,
                metadata,
                mintAuthority: signer,
                payer: signer,
                data: {
                    sellerFeeBasisPoints: 0,
                    collection: null,
                    creators: null,
                    uses: null,
                    name: "Climate",
                    symbol: "CLIMATE",
                    uri: "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/Climate/metadata.json",
                }
            })
        ],
        latestBlockhash,

    })
    return tx;
}