# Fractal Address Generation & Validation

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

A TypeScript implementation for generating and validating Fractal addresses with multiple address type support.

**Note that the address generation logic of Fractal is identical to BTC. You can use other BTC address generation libraries to generate Fractal addresses.**

## Features

- 🛠️ Generate private keys in WIF format
- 🔑 Derive compressed public keys
- 📬 Create multiple address types:
  - P2PKH (Legacy)
  - P2SH-P2WPKH (Nested SegWit)
  - P2WPKH (Native SegWit)
  - P2TR (Taproot)
- ✅ Comprehensive address validation

## Installation

```bash
yarn install
```

## Usage

### Quick Start

```bash
yarn gen:address
```

### Expected Output:

```
Gernerate PrivateKey
- [WIF]: L3fYVdieHsWx2HJ8vvStiLBo8NmYAK7GUGwD3SNnSyDLKiKnPs5N

Gernerate Pubkey
- [PublicKey]: 02e687f2e1ffed79e7e96900df02d802b151c353773f7c3080ef729ef9bde0bace

Gernerate Addresses
- [P2PKH]: 1PcpBoN99DKeAjUF7Xpjf4ybVvKiP7srqS
- [P2SH_P2WPKH]: 3PvWM4ch5mwjuFy8bTVFQg6FFLsZKqEkSb
- [P2WPKH]: bc1qlqvtwpu2servhtchh26f9u09uav2w835tdxl59
- [P2TR]: bc1py69cekw6sczcm2cxlnfa7r6kxgcr97yetxupfpet47wyxvx678tq2sgahd

Validate Addresses
- [Valid]: bc1py69cekw6sczcm2cxlnfa7r6kxgcr97yetxupfpet47wyxvx678tq2sgahd true
- [Invalid]: 0xdadb0d80178819f2319190d340ce9a924f783711 false
```

## Implementation Details

### Key Generation

#### Private Key (WIF Format)

```typescript
import { ECPair } from "ecpair";

const privateKey = ECPair.makeRandom();
// Or const privateKey = ECPair.fromWIF("YOU_WIF")
const wif = privateKey.toWIF();
```

#### Public Key Derivation

```typescript
const pubkey = Buffer.from(privateKey.publicKey);
```

### Address Generation

Supported address types enum:

```typescript
enum AddressType {
  P2PKH = "P2PKH",
  P2SH_P2WPKH = "P2SH_P2WPKH",
  P2WPKH = "P2WPKH",
  P2TR = "P2TR",
}
```

Address generation function:

```TypeScript
import * as bitcoin from 'bitcoinjs-lib';

function pubkeyToAddress(pubkey: Buffer, type: AddressType): string {
  const network = bitcoin.networks.bitcoin;

  switch (type) {
    case AddressType.P2PKH:
      return bitcoin.payments.p2pkh({ pubkey, network }).address!;
    case AddressType.P2WPKH:
      return bitcoin.payments.p2wpkh({ pubkey, network }).address!;
    case AddressType.P2TR:
      return bitcoin.payments.p2tr({
        internalPubkey: pubkey.subarray(1, 33),
        network
      }).address!;
    case AddressType.P2SH_P2WPKH:
      const redeem = bitcoin.payments.p2wpkh({ pubkey, network });
      return bitcoin.payments.p2sh({ redeem, network }).address!;
    default:
      throw new Error('Unsupported address type');
  }
}
```

### Address Validation

```typescript
function isValidAddress(address: string): boolean {
  try {
    bitcoin.address.toOutputScript(address, bitcoin.networks.bitcoin);
    return true;
  } catch {
    return false;
  }
}
```

## Security Considerations

### 1. Private Key Handling

- Always store WIF keys securely

- Never commit private keys to version control

- Use environment variables for production keys

### 2. Address Generation

- Verify address types match intended usage

- Double-check network parameters before mainnet usage

### 3. Dependencies

```
"@bitcoinerlab/secp256k1": "^1.2.0",
"bitcoinjs-lib": "^6.1.7",
"ecpair": "^3.0.0"
```
