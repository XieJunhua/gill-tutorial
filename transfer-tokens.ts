import { createSolanaClient, getMinimumBalanceForRentExemption, createTransaction, generateKeyPairSigner, getExplorerLink, getSignatureFromTransaction, signTransactionMessageWithSigners, type SolanaClusterMoniker, type Blockhash, type KeyPairSigner, address } from "gill";
import { loadKeypairSignerFromFile } from "gill/node";
import { getAddMemoInstruction, getCreateAccountInstruction, getCreateMetadataAccountV3Instruction, getTokenMetadataAddress } from "gill/programs";
import { buildTransferTokensTransaction, getInitializeMintInstruction, getMintToInstruction, getMintSize, TOKEN_PROGRAM_ADDRESS, buildCreateTokenTransaction, getCreateAssociatedTokenIdempotentInstruction, getAssociatedTokenAccountAddress, buildMintTokensTransaction, getTransferInstruction } from "gill/programs/token";

// global.__GILL_DEBUG__ = true;
// global.__GILL_DEBUG_LEVEL__ = "debug";

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
const owner = address("mntLwqHMmcyQQfYw8p6Q7asVaSJmGdkpB55ZZauhABu");
const source = address("junjMfTB26qPGEcUWQhjE8QRqFmcBgyNZQhhC6mFVUX")

const ata = await getAssociatedTokenAccountAddress(

    mint,
    owner,
    TOKEN_PROGRAM_ADDRESS,
)
const sourceAta = await getAssociatedTokenAccountAddress(

    mint,
    source,
    TOKEN_PROGRAM_ADDRESS,
)

console.log(sourceAta)


const tx = await buildTransferTokensTransaction({
    feePayer: signer,
    version: "legacy",
    authority: signer,
    destination: owner,
    amount: 1000,
    latestBlockhash,
    mint,
})

const tx2 = createTransaction({
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
        getTransferInstruction({
            source: sourceAta,
            authority: signer,
            destination: ata,
            amount: 100000,
        }, {
            programAddress: TOKEN_PROGRAM_ADDRESS,
        })

    ],
    latestBlockhash
});

const signedTx = await signTransactionMessageWithSigners(tx);
console.log(getExplorerLink({
    transaction: getSignatureFromTransaction(signedTx),
    cluster
}))

await sendAndConfirmTransaction(signedTx);