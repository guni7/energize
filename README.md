# energize

Energize is a protocol that lets you put digital assets inside your NFTs. This protocol allows users to deposit FA1.2 or FA2 tokens (ANY tokens) into an NFT. Energize enables the creation of yield bearing DeFi NFTs (through a bridge to Yupana), time locked capsules, in game assets, and so much more.
The platform also has a minting station and a marketplace.

# How it works 

Every NFT that is energized is given its own smart wallet.

When a user mints an NFT, they can pick an asset (currently kUSD) they want to energize the NFT with. 
They will then deposit the asset into the nft using the interface, which sends the asset into the smart wallet.
The smart wallet is then responsible for depositing the asset tokens into the Yupana lending pool, and receiving back yTokens.

When withdrawing from the NFT Smart Wallet (which can be done by the owner of the nft only), the Yield Tokens are redeemed for the underlying Asset Tokens from Yupana. The Smart Wallet is responsible for handling both the Principal and Interest. 

#Architecture

![Architecture](https://i.imgur.com/5ip4S9g.png)

#Smart Contracts

The contracts can be found on the ghostnet at these addresses - 
Energize Contract - KT1RDB7Q8jKgQnarhDaHJx9xUyakemMnUk73
kUSD Wallet Manager - KT1Wgp6qSsDN7mCaDk5XDEQU52MezE8B9mr5
Example Smart Wallet With yKUSD tokens invested - KT1JqTPhNcaJaakNBQVHEFbgCmo7mGKsx61H

Energize Contract - 
  This is the only contract that is accessible to the client. It has the following entrypoints 
  - addWalletManager: admin only - used to add token assets that an nft can be energized with
  - energize: if a smart wallet for the nft exists, this transfers the asset amount to it. If a smart wallet doesn't exist, it forwards the call to the wallet manager. The wallet manager is a contract factory which originates the contract for the smart wallet and transfers the asset tokens to it.
  - energizeWithInterest - same as energize entrypoint with the added functionality of investing tokens to yupana
  - withdrawFa12 - allows the owner of the nft to withdraw the asset token from the nft.


