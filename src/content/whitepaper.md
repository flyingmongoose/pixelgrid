# PixelGrid Whitepaper

## 1. Introduction

    PixelGrid is an innovative digital art platform built on the [Base](https://base.org) blockchain, allowing users to own, customize, and trade individual pixels on a massive grid. Each pixel is a unique NFT, creating a collaborative canvas for artistic expression and digital ownership.

    It was designed for the [Onchain Summer event](https://devfolio.co/projects/pixelgrid-1c75), a decentralized hackathon hosted by the Base blockchain.

    If you like this project, please head on over to this project's [Devfolio and vote for it!](https://devfolio.co/projects/pixelgrid-1c75)

## 2. Technical Architecture

### 2.1 Smart Contract

The PixelGrid smart contract is the core of our platform, enabling users to mint, manage, and trade individual pixels as unique NFTs. Key features include:

- **Pixel Minting**
  
  - Users can mint individual pixels by specifying RGBA color values and X, Y coordinates. Each pixel is a unique NFT with its own token ID.

- **Pixel Updating**
  
  - Pixel owners can update the color and associated message of their pixels.

- **Snapshot Creation**
  
  - Admins can create snapshots of the entire grid, capturing the state at a specific point in time.

- **Snapshot Minting**
  
  - Users can mint snapshot NFTs, which represent the entire grid state at the time of snapshot creation.

- **Token URI Generation**
  
  - The contract generates on-chain metadata and SVG images for both individual pixels and snapshots.

- **Price Oracle Integration**
  
  - Uses Chainlink price feeds to determine pixel and snapshot print prices in ETH based on a fixed USDC price.

- **Royalties**
  
  - Implements ERC2981 for royalties on secondary sales, with customizable royalty settings for individual tokens.

- **Access Control**
  
  - Utilizes OpenZeppelin's AccessControl for role-based permissions.

- **Pausable**
  
  - Includes functionality to pause and unpause contract operations for emergency situations.

- **Reentrancy Protection**
  
  - Implements OpenZeppelin's ReentrancyGuard to prevent reentrancy attacks.

- **Minting Limits**
  
  - Enforces limits on minting frequency and total mints per address.
  
  - Maximum of fifty (50) pixel mints per wallet.
  
  - Maximum of one (1) snapshot mint per wallet.

- **Pre-release Period**
  
  - Implements a pre-release period for snapshot minting, giving priority to pixel owners.
    
    - Currently two (2) full days.

The contract also includes several utility functions for packing and unpacking color and position data, as well as generating SVG representations of pixels and snapshots. These features create a robust foundation for the PixelGrid platform, enabling a wide range of interactions and ensuring the uniqueness and tradability of each pixel and snapshot NFT.

### 2.2 Frontend

[Description of the Next.js framework, React components, and the canvas-based pixel grid implementation]

### 2.3 Blockchain Integration

[Explanation of integration with Base chain, use of wagmi, viem, and RainbowKit for wallet connections]

## 3. User Experience

### 3.1 Pixel Minting

[Description of the minting process, including color selection and position choosing]

### 3.2 Grid Interaction

[Explanation of how users interact with the pixel grid, including zooming and panning]

### 3.3 Wallet Integration

[Details on wallet connection process and supported wallets]

## 4. Token Economics

### 4.1 Pixel Pricing

[Information on pixel pricing mechanism, including USDC to ETH conversion]

### 4.2 Owner Messages

[Explanation of the owner message feature associated with each pixel]

## 5. Technical Considerations

### 5.1 Performance Optimization

[Details on techniques used for efficient rendering of large pixel grids]

### 5.2 Data Loading and Caching

[Explanation of how pixel data is loaded and cached for optimal performance]

### 5.3 RPC Fallback Mechanism

[Description of the RPC fallback system for reliable blockchain interactions]

## 6. Future Developments

[Outline potential future features and improvements, such as enhanced community features, additional grid functionalities, or cross-chain integrations]

## 7. Conclusion

PixelGrid represents a unique intersection of blockchain technology, digital art, and community collaboration. By providing a platform for granular ownership and creative expression, PixelGrid aims to push the boundaries of what's possible in the realm of decentralized art and collectibles.
