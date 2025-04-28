# Transaction Construction, Offline Signature, Analysis, and Broadcasting for Fractal

## 1. Introduction

This document details the process for constructing a transaction, signing it offline using a private key, analyzing the resulting signed transaction data, and broadcasting it to the Fractal network. The process utilizes the Partially Signed Bitcoin Transaction (PSBT) format, which is standard for Bitcoin and many of its forks, ensuring compatibility and security.

The provided example uses JavaScript (Node.js environment) with a library similar to `bitcoinjs-lib`, adapted for the Fractal network parameters if necessary.

## 2. Prerequisites

- **Node.js:** Environment to run the JavaScript demo.
- **fractal JavaScript Library:** A library capable of handling fractal addresses, transactions, and signing (e.g., a fork-specific version of `bitcoinjs-lib` or a compatible library). The example assumes a library structure similar to `bitcoinjs-lib`.
- **Private Key:** The private key (usually in WIF format) controlling the input funds (UTXOs).
- **UTXO Information:** Details of the Unspent Transaction Output(s) to be spent, including `txid`, `vout` (index), and `value` (amount in satoshis). For SegWit inputs (like P2WPKH), the `witnessUtxo` (containing `script` and `value`) is required instead of the full non-witness UTXO transaction details.

## 3. Process Overview

The process involves the following key steps:

1.  **Setup:** Import necessary libraries and define constants (network parameters, private key, UTXO details).
2.  **Transaction Construction (using PSBT):** Create a new PSBT object, add inputs (referencing the UTXOs to be spent), and add outputs (defining recipients and amounts).
3.  **Offline Signing:** Sign the inputs within the PSBT using the corresponding private key. **This step should be performed in a secure, offline environment.**
4.  **Finalization:** Finalize the PSBT, which combines the signatures and script information to create a valid, network-ready transaction.
5.  **Signed Transaction Data Analysis:** Extract the finalized transaction in its raw hexadecimal format. This hex string _is_ the signed transaction data.
6.  **Transaction Broadcasting:** Transmit the raw transaction hex to the fractal network via a connected node or public API.

## 4. Step-by-Step Guide & JavaScript Demo

Below is a JavaScript example demonstrating steps 1 through 5. Step 6 (Broadcasting) is described conceptually as it requires interaction with a network node or API.

```javascript
// Step 1: Setup
// Import necessary components from the adapted bitcoinjs-lib or equivalent
const bitcoin = require("bitcoinjs-lib");
const ECPairFactory = require("ecpair");
const ecc = require("tiny-secp256k1");

const ECPair = ECPairFactory.ECPairFactory(ecc);

// --- Configuration ---
// Replace with your fork's specific network parameters if different from Bitcoin mainnet
const network = bitcoin.networks.bitcoin;

// NEVER expose private keys in production code shared publicly. For demonstration only.
const WIF = "L3fYVdieHsWx2HJ8vvStiLBo8NmYAK7GUGwD3SNnSyDLKiKnPs5N"; // Example WIF for a P2WPKH address

// Derive Key Pair and Address from WIF
const privateKey = ECPair.fromWIF(WIF, network);
const { address } = bitcoin.payments.p2wpkh({
  pubkey: privateKey.publicKey,
  network,
});
const payment = bitcoin.payments.p2wpkh({
  pubkey: privateKey.publicKey,
  network,
});

console.log(`Derived Address: ${address}`);

// UTXO (Unspent Transaction Output) details to spend
const utxo = {
  txid: "a958bc46c0d7e6c9bc324d6d5462ce6b36156272af810189f75cc74df23bddcf", // Example TXID
  vout: 0, // Output index in the transaction
  satoshis: 1000, // Amount in satoshis (smallest unit)
};
// --- End Configuration ---

// Step 2: Transaction Construction (using PSBT)
const psbt = new bitcoin.Psbt({ network });

// Add Input: Reference the UTXO we want to spend
psbt.addInput({
  hash: utxo.txid,
  index: utxo.vout,
  // For SegWit inputs (P2WPKH, P2WSH), 'witnessUtxo' is required.
  // It contains the output script and value of the UTXO being spent.
  witnessUtxo: {
    script: payment.output, // The locking script (scriptPubKey) for the UTXO
    value: utxo.satoshis, // The value of the UTXO in satoshis
  },
  // For non-SegWit inputs (P2PKH), you would use 'nonWitnessUtxo' instead:
  // nonWitnessUtxo: Buffer.from('raw_transaction_hex_of_the_utxo', 'hex'),
});

// Add Output: Define where the funds are going
// Sending 800 satoshis back to the same address (minus fees)
psbt.addOutput({
  address: address, // Recipient address
  value: 800, // Amount in satoshis
});
// Fee = Input Value - Output Value = 1000 - 800 = 200 satoshis

// Step 3: Offline Signing
// Sign the first input (index 0) using the corresponding private key.
// IMPORTANT: This operation uses the private key and should be done securely offline.
psbt.signInput(0, privateKey);

// Step 4: Finalize Transaction
// Finalize the PSBT for all inputs. This attaches the signatures and witness data.
psbt.finalizeAllInputs();

// Step 5: Signed Transaction Data Analysis
// Extract the fully signed, network-ready transaction in hexadecimal format.
const tx = psbt.extractTransaction();
const signedTransactionHex = tx.toHex();

console.log("\n--- Signed Transaction Data ---");
console.log("Raw Transaction Hex:", signedTransactionHex);

// Analysis:
// The 'signedTransactionHex' string is the complete, serialized transaction.
// It includes:
// - Version number
// - Input count and details (previous txid, vout, empty scriptSig for P2WPKH)
// - Output count and details (value, scriptPubKey)
// - Witness data (signatures and public key for P2WPKH)
// - Locktime
// This hex string is what needs to be broadcasted to the network.

// Step 6: Transaction Broadcasting (Conceptual)
console.log("\n--- Broadcasting ---");
console.log(
  "To broadcast this transaction, submit the Raw Transaction Hex above to:"
);
console.log(
  "1. A connected fractal node using the 'sendrawtransaction' RPC command."
);
console.log(
  "2. A trusted block explorer or public API endpoint that provides transaction broadcasting services for fractal."
);
// Example (conceptual - requires actual implementation with a node connection or API call):
// async function broadcastTransaction(hex) {
//   try {
//     const txid = await someNodeClient.sendRawTransaction(hex);
//     console.log(`Successfully broadcasted! Transaction ID: ${txid}`);
//   } catch (error) {
//     console.error("Broadcasting failed:", error);
//   }
// }
// broadcastTransaction(signedTransactionHex); // Don't run this without a real broadcast function

// Example Output Analysis (based on the provided code):
// The script generates a transaction spending one P2WPKH UTXO.
// It creates one output sending funds back to the same address (typically done for testing, or could be any valid address).
// The difference between input value (1000 satoshis) and output value (800 satoshis) is the transaction fee (200 satoshis).
// The output hex is the data ready for the network.
```

## 5. Security Considerations

- **Private Key Security:** Private keys must be handled with extreme care. Never embed them directly in publicly shared code or store them insecurely. The WIF used in the example is for demonstration only.
- **Offline Signing Environment:** The signing operation (e.g., `psbt.signInput(0, privateKey)` is the most critical step. It _must_ be performed in an environment isolated from the internet and potential malware to prevent private key theft. The unsigned transaction (or PSBT) can be constructed online, transferred to the offline environment for signing, and the signed transaction hex transferred back online for broadcasting.
- **Transaction Verification:** Before broadcasting, optionally decode the raw transaction hex using a decoder tool compatible with fractal to double-check inputs, outputs, fees, and signatures are as expected.

## 6. Conclusion

This document outlines the standard procedure for creating, signing (offline), and broadcasting transactions for fractal using common tools and libraries. The use of PSBT provides a structured and safer way to handle transaction creation and signing, especially when separating online and offline environments. The provided JavaScript example demonstrates these steps practically.
