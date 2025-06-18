import { createSolanaClient, createTransaction, getExplorerLink, getSignatureFromTransaction, signTransactionMessageWithSigners, type SolanaClusterMoniker } from "gill";
import { loadKeypairSignerFromFile } from "gill/node";
import { getAddMemoInstruction } from "gill/programs";

// global.__GILL_DEBUG__ = true;
global.__GILL_DEBUG_LEVEL__ = "debug";

const signer = await loadKeypairSignerFromFile(
    "junjMfTB26qPGEcUWQhjE8QRqFmcBgyNZQhhC6mFVUX.json"
);
const cluster: SolanaClusterMoniker = "devnet";
const { rpc, sendAndConfirmTransaction } = createSolanaClient({
    urlOrMoniker: cluster
});

const balance = await rpc.getBalance(signer.address).send();
const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

console.log(balance.value);
console.log(latestBlockhash);

const memoTx = getAddMemoInstruction({
    memo: "Hello, world!"
})

const tx = createTransaction({
    feePayer: signer,
    version: "legacy",
    instructions: [memoTx],
    latestBlockhash,
    computeUnitLimit: 7000,
    computeUnitPrice: 1000,
})
console.log("tx:");
console.log(tx);

const signedTx = await signTransactionMessageWithSigners(tx);
console.log("signedTx:");
console.log(signedTx);

let sig = getSignatureFromTransaction(signedTx);

console.log(getExplorerLink({
    transaction: sig,
    cluster
}))

const txHash = await sendAndConfirmTransaction(signedTx);
console.log("txHash:");
console.log(txHash);





