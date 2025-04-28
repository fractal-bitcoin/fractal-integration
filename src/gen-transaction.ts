import {
  AddressType,
  bitcoin,
  ECPair,
  pubkeyToAddress,
  pubkeyToPayment,
} from "./utils";

function generateTransaction() {
  const WIF = "L3fYVdieHsWx2HJ8vvStiLBo8NmYAK7GUGwD3SNnSyDLKiKnPs5N";
  const privateKey = ECPair.fromWIF(WIF);
  const pubkey = Buffer.from(privateKey.publicKey);
  const address = pubkeyToAddress(pubkey, AddressType.P2WPKH);
  const payment = pubkeyToPayment(pubkey, AddressType.P2WPKH);

  const utxo = {
    txid: "a958bc46c0d7e6c9bc324d6d5462ce6b36156272af810189f75cc74df23bddcf",
    vout: 0,
    satoshis: 1000,
  };

  // Create a new PSBT
  const psbt = new bitcoin.Psbt();
  psbt.addInput({
    hash: utxo.txid,
    index: utxo.vout,
    witnessUtxo: {
      value: utxo.satoshis,
      script: payment.output,
    },
  });

  psbt.addOutput({
    address: address,
    value: 800,
  });

  // Offline SigInput
  psbt.signInput(0, privateKey);

  // Finalize Transaction
  psbt.finalizeAllInputs();
  const tx = psbt.extractTransaction();

  console.log("Generate Transaction:", tx.toHex());

  // https://mempool.fractalbitcoin.io/tx/f9e7840870ed85e197469ea4998b3ae0dce6af47f0ca0164e1e3fc2ccd07cc77
}

generateTransaction();
