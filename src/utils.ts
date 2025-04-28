import * as bitcoin from "bitcoinjs-lib";
import ECPairFactory from "ecpair";
import ecc from "@bitcoinerlab/secp256k1";
export const ECPair = ECPairFactory(ecc);

bitcoin.initEccLib(ecc);

export { bitcoin };

export function randomPrivateKey() {
  return ECPair.makeRandom();
}

export enum AddressType {
  P2PKH,
  P2WPKH,
  P2TR,
  P2SH_P2WPKH,
}

export function pubkeyToPayment(pubkey: Buffer, type: AddressType) {
  const network = bitcoin.networks.bitcoin;

  switch (type) {
    case AddressType.P2PKH:
      return bitcoin.payments.p2pkh({ pubkey, network });
    case AddressType.P2WPKH:
      return bitcoin.payments.p2wpkh({ pubkey, network });
    case AddressType.P2TR:
      return bitcoin.payments.p2tr({
        internalPubkey: pubkey.subarray(1, 33),
        network,
      });
    case AddressType.P2SH_P2WPKH:
      const redeem = bitcoin.payments.p2wpkh({ pubkey, network });
      return bitcoin.payments.p2sh({ redeem, network });
    default:
      throw new Error("Unsupported address type");
  }
}

export function pubkeyToAddress(pubkey: Buffer, type: AddressType): string {
  const network = bitcoin.networks.bitcoin;

  switch (type) {
    case AddressType.P2PKH:
      return bitcoin.payments.p2pkh({ pubkey, network }).address!;
    case AddressType.P2WPKH:
      return bitcoin.payments.p2wpkh({ pubkey, network }).address!;
    case AddressType.P2TR:
      return bitcoin.payments.p2tr({
        internalPubkey: pubkey.subarray(1, 33),
        network,
      }).address!;
    case AddressType.P2SH_P2WPKH:
      const redeem = bitcoin.payments.p2wpkh({ pubkey, network });
      return bitcoin.payments.p2sh({ redeem, network }).address!;
    default:
      throw new Error("Unsupported address type");
  }
}

export function isValidAddress(address: string) {
  const network = bitcoin.networks.bitcoin;
  let error;
  try {
    bitcoin.address.toOutputScript(address, network);
  } catch (e) {
    error = e;
  }
  return !error;
}
