import * as bitcoin from "bitcoinjs-lib";
import ECPairFactory from "ecpair";
import ecc from "@bitcoinerlab/secp256k1";
const ECPair = ECPairFactory(ecc);

bitcoin.initEccLib(ecc);

export function randomPrivateKey() {
  return ECPair.makeRandom();
}

export enum AddressType {
  P2PKH,
  P2WPKH,
  P2TR,
  P2SH_P2WPKH,
}

function pubkeyToAddress(pubkey: Buffer, type: AddressType) {
  const network = bitcoin.networks.bitcoin;
  if (type === AddressType.P2PKH) {
    return bitcoin.payments.p2pkh({
      pubkey,
      network,
    }).address;
  } else if (type === AddressType.P2WPKH) {
    return bitcoin.payments.p2wpkh({
      pubkey,
      network,
    }).address;
  } else if (type === AddressType.P2TR) {
    return bitcoin.payments.p2tr({
      internalPubkey: pubkey.slice(1, 33),
      network,
    }).address;
  } else if (type === AddressType.P2SH_P2WPKH) {
    const data = bitcoin.payments.p2wpkh({
      pubkey,
      network,
    });
    return bitcoin.payments.p2sh({
      pubkey,
      network,
      redeem: data,
    }).address;
  }
}

function isValidAddress(address: string) {
  const network = bitcoin.networks.bitcoin;
  let error;
  try {
    bitcoin.address.toOutputScript(address, network);
  } catch (e) {
    error = e;
  }
  return !error;
}

function runDemo() {
  console.log("Gernerate PrivateKey");
  const privateKey = ECPair.makeRandom();
  const wif = privateKey.toWIF();
  console.log("- [WIF]:", wif);

  console.log("\nGernerate Pubkey");
  const pubkey = Buffer.from(privateKey.publicKey);
  console.log("- [PublicKey]:", pubkey.toString("hex"));

  console.log("\nGernerate Addresses");
  // Generate P2PKH address
  const address_p2pkh = pubkeyToAddress(pubkey, AddressType.P2PKH);
  console.log("- [P2PKH]:", address_p2pkh);

  // Generate P2SH_P2WPKH address
  const address_p2sh_p2wpkh = pubkeyToAddress(pubkey, AddressType.P2SH_P2WPKH);
  console.log("- [P2SH_P2WPKH]:", address_p2sh_p2wpkh);

  // Generate P2WPKH address
  const address_p2wpkh = pubkeyToAddress(pubkey, AddressType.P2WPKH);
  console.log("- [P2WPKH]:", address_p2wpkh);

  // Generate P2TR address
  const address_p2tr = pubkeyToAddress(pubkey, AddressType.P2TR);
  console.log("- [P2TR]:", address_p2tr);

  console.log("\nValidate Addresses");
  console.log("- [Valid]:", address_p2tr, isValidAddress(address_p2tr));
  console.log(
    "- [Invalid]:",
    "0xdadb0d80178819f2319190d340ce9a924f783711",
    isValidAddress("0xdadb0d80178819f2319190d340ce9a924f783711")
  );
}

runDemo();
