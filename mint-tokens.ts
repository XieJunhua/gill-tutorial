import { createSolanaClient, getMinimumBalanceForRentExemption, createTransaction, generateKeyPairSigner, getExplorerLink, getSignatureFromTransaction, signTransactionMessageWithSigners, type SolanaClusterMoniker, type Blockhash, type KeyPairSigner, address } from "gill";
import { loadKeypairSignerFromFile } from "gill/node";
import { getAddMemoInstruction, getCreateAccountInstruction, getCreateMetadataAccountV3Instruction, getTokenMetadataAddress } from "gill/programs";
import { getInitializeMintInstruction, getMintToInstruction, getMintSize, TOKEN_PROGRAM_ADDRESS, buildCreateTokenTransaction, getCreateAssociatedTokenIdempotentInstruction, getAssociatedTokenAccountAddress, buildMintTokensTransaction } from "gill/programs/token";

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

const mint = address("HQs8dFBuXHRp3mq7adcdsCyXKvzNtSMyp11A5nirrJn1");
// const owner = signer.address;
const owner = address("AAX2xqhj3oy7BpNsKBzQv9xm7YUWJ4rjkXQhwnk6wHni");


const ata = await getAssociatedTokenAccountAddress(
    mint,
    owner,
    TOKEN_PROGRAM_ADDRESS,
)

const tx = createTransaction({
    feePayer: signer,
    version: "legacy",
    instructions: [
        getCreateAssociatedTokenIdempotentInstruction({
            mint,
            owner,
            payer: signer,
            tokenProgram: TOKEN_PROGRAM_ADDRESS,
            ata,
        }),
        getMintToInstruction({
            mint,
            mintAuthority: signer,
            amount: 1000000000,
            token: ata,
        }, {
            programAddress: TOKEN_PROGRAM_ADDRESS,
        })
    ],
    latestBlockhash
});

const tx2 = await buildMintTokensTransaction({
    feePayer: signer,
    version: "legacy",
    latestBlockhash,
    amount: 1000000000,
    destination: owner,
    mintAuthority: signer,
    mint,
})

const signedTx = await signTransactionMessageWithSigners(tx2);
console.log(getExplorerLink({
    transaction: getSignatureFromTransaction(signedTx),
    cluster
}))

await sendAndConfirmTransaction(signedTx);