# PixelGrid Whitepaper

## 1. Introduction

PixelGrid is an innovative digital art platform built on the [Base](https://base.org) blockchain, allowing users to own, customize, and trade individual pixels on a massive grid. Each pixel is a unique NFT, creating a collaborative canvas for artistic expression and digital ownership.

PixelGrid was designed for the [Onchain Summer event](https://devfolio.co/projects/pixelgrid-1c75), a decentralized hackathon hosted by the Base blockchain.

If you like this project, please head on over to this project's [Devfolio and vote for it!](https://devfolio.co/projects/pixelgrid-1c75)

---

## 2. Technical Architecture

### 2.1 Smart Contract

The PixelGrid smart contract is the core of our platform, enabling users to mint, manage, and trade individual pixels as unique NFTs. Key features include:

- **Pixel Management**:
  - Minting: Users can mint individual pixels by specifying RGBA color values and X, Y coordinates.
  - Updating: Pixel owners can update the color and associated message of their pixels.

- **Snapshot Functionality**:
  - Creation: Admins can create snapshots of the entire grid, capturing the state at a specific point in time.
  - Minting: Users can mint snapshot NFTs, representing the entire grid state at creation time.
  - This will become an automated feature.

- **Token URI Generation**: On-chain metadata and SVG images for both individual pixels and snapshots.

- **Price Oracle Integration**:
  - Uses Chainlink price feeds to determine pixel and snapshot prices in ETH based on a fixed USDC price.
  - Guarantees mints will always cost $0.01 USD per pixel, and $0.50 USD per snapshot.

- **Royalties**:
  - Implements ERC2981 for secondary sales with customizable settings.
  - Default: 5%, Minimum: 2.5%
  - Purpose: Fund ongoing development of PixelGrid and other projects.

- **Security and Control**:
  - Access Control: Utilizes OpenZeppelin's AccessControl for role-based permissions.
  - Pausable: Emergency pause functionality (developer pledged to use only in emergencies).
  - Reentrancy Protection: Implements OpenZeppelin's ReentrancyGuard.

- **Minting Limits**:
  - Max Pixel Mints Per Wallet: Fifty (50)
  - Max Snapshot Mints Per Wallet: One (1)
  - Snapshot Pre-release Period: Two (2) full days, prioritizing pixel owners.

- **Utility Functions**: For packing/unpacking color and position data, generating SVG representations.

These features create a robust foundation for the PixelGrid platform, ensuring uniqueness and tradability of each pixel and snapshot NFT.

---

### 2.2 Frontend

PixelGrid's frontend uses modern web technologies for a responsive and interactive user interface:

- **Framework and Components**:
  - Built on Next.js for server-side rendering and efficient routing.
  - Modular React components for reusability and maintainability.
  - Key components: NavbarHeader, CanvasPixelGrid, ColorPicker, SlideOutMintModal, PixelGridLogo, PixelGridIcon, Footer.

- **Canvas-based Pixel Grid**:
  - Utilizes HTML5 Canvas API for efficient rendering.
  - Supports dynamic zooming and panning for seamless navigation.
  - Real-time rendering of blockchain-fetched pixel data.

- **Styling and Responsiveness**:
  - Tailwind CSS for responsive, utility-first styling.
  - Custom CSS modules for component-specific styling.

- **State Management and Data Fetching**:
  - React hooks for state management and blockchain data fetching.
  - React Query (via Wagmi) for efficient data fetching and caching.

- **Blockchain Integration**:
  - Wagmi for Base blockchain connection.
  - RainbowKit for user-friendly wallet connections.

- **User Experience Enhancements**:
  - Loading overlay and pixel animation components for visual feedback.
  - Whitepaper component using react-markdown for documentation rendering.

- **Performance Optimizations**:
  - Dynamic imports for heavy components to improve load times.
  - Efficient rendering techniques for handling large pixel grids.

- **Error Handling**: Error boundaries and RPC fallback mechanisms for reliability.

This architecture offers a smooth, interactive experience for users to view, mint, and interact with pixels while maintaining performance across devices.

---

### 2.3 Blockchain Integration

PixelGrid leverages key technologies for seamless integration with the Base blockchain:

- **Base Chain**: Built specifically for Base blockchain infrastructure.

- **Wagmi and Viem**:
  - Wagmi for React hooks simplifying Ethereum interactions.
  - Viem for low-level Ethereum JSON-RPC client functionality.
  - Used for creating public clients, encoding ABI parameters, and handling blockchain data types.

- **RainbowKit**: Integrated for user-friendly wallet connection interface.

- **Smart Contract Interaction**: Deep integration with the PixelGrid contract on Base.

- **RPC Configuration**: Fallback mechanism for reliable network connections.

- **Wallet Support**: Various wallets supported through RainbowKit.

- **Transaction Handling**: SlideOutMintModal component uses Wagmi for fair price fetching and minting.

---

## 3. User Experience

### 3.1 Pixel Minting

The pixel minting process is designed to be intuitive and user-friendly:

1. **Pixel Selection**: Users interact with CanvasPixelGrid, supporting zoom and pan.

2. **Color Selection**: ColorPicker component provides RGB with alpha channel support.

3. **Position Information**: SlideOutMintModal displays X and Y coordinates.

4. **Owner Message**: Users can add a custom message to their pixel NFT.

5. **Price Display**: Shows price in USD ($0.01 per pixel) and equivalent ETH.

6. **Wallet Connection**: RainbowKit integration for various wallet providers.

7. **Transaction Confirmation**: Users sign the transaction through their connected wallet.

8. **Minting Transaction**: Smart contract interaction with color, coordinates, and message.

9. **Transaction Monitoring**: Real-time feedback and grid updates.

10. **Post-Mint Update**: useContractData hook refreshes pixel data.

This process combines an intuitive UI with robust blockchain interactions for easy pixel NFT creation.

---

### 3.2 Grid Interaction

PixelGrid offers an interactive interface for exploring and interacting with the pixel grid:

- **Canvas Rendering**: Efficient HTML5 Canvas API implementation.

- **Navigation**:
  - Zooming: Mouse wheel, pinch-to-zoom, dedicated slider.
  - Panning: Click-and-drag, swiping, arrow buttons/sliders.

- **Pixel Selection**: Visual highlighting and coordinate display.

- **Responsive Design** (Work-in-Progress): Adapts to different screen sizes.

- **Performance Optimizations**:
  - Viewport culling for efficient rendering.
  - Efficient data caching and updates.

- **Real-time Updates**: WebSocket or polling for latest blockchain data.

- **Accessibility** (Work-in-Progress):
  - Keyboard navigation support.
  - Color contrast and pixel size considerations.

- **Error Handling**: Fallback mechanisms for network issues.

These features provide an engaging experience for creating and viewing pixel art on the blockchain.

---

### 3.3 Wallet Integration

PixelGrid provides a seamless wallet integration experience:

- **RainbowKit Integration**: Polished and customizable UI for wallet connection.

- **Supported Wallets**: Coinbase Wallet, MetaMask, WalletConnect, and others.

- **Connection Process**:
  1. User clicks "Connect Wallet" in Header.
  2. RainbowKit modal presents wallet options.
  3. User selects preferred wallet.
  4. Guides for wallet installation if needed.
  5. Connected address displayed in header.

- **Network Handling**:
  - Automatic Base network detection.
  - Prompts for switching to Base if on a different network.

- **User Experience**:
  - UI updates based on connection status.
  - Error messages for common connection issues.
  - Persistent connections and local storage preferences.

- **Security**: Implements best practices for secure wallet interactions.

- **Mobile Compatibility** (Work-in-Progress):
  - Support for mobile wallets and dApp browsers.
  - UI adaptation for mobile devices.

- **Functionality**:
  - Transaction signing support for minting.
  - Real-time ETH balance display and updates.

This integration ensures users can easily connect wallets and interact with PixelGrid securely and efficiently.

---

## 4. Token Economics

### 4.1 Pixel Pricing

PixelGrid implements a dynamic pricing mechanism for stable USD value while accommodating ETH fluctuations:

- **Fixed USDC Price**: 0.01 USDC ($0.01 USD) per pixel.

- **ETH/USD Price Oracle**: Chainlink price feed for real-time exchange rates.

- **Dynamic ETH Price Calculation**:
  - Formula: `priceInWei = (PIXEL_PRICE_USDC * 1e18) / ethUsdPrice`
  - Recalculated for each mint transaction.

- **Price Stability**: Automatic ETH amount adjustment protects against volatility.

- **Overpayment Handling**: Automatic refund of excess ETH.

- **Minting Process**:
  1. User initiates mint with ETH.
  2. Contract checks sufficiency based on current rate.
  3. Mint proceeds if sufficient, otherwise reverts.

- **Transparency**:
  - Fixed USDC price visible in contract code.
  - Users can verify current ETH price via Chainlink oracle.
  - <a href="https://data.chain.link/feeds/ethereum/mainnet/eth-usd" target="_blank">ETH/USD Chart</a>.

This mechanism ensures consistent value while adapting to cryptocurrency market volatility.

---

### 4.2 Owner Messages

The Owner Messages feature allows pixel owners to associate custom text with their NFTs:

- **Customizable Content**: Supports various uses (personal expressions, links, ads, artistic statements).

- **On-Chain Storage**: Messages stored directly on the blockchain with pixel metadata.

- **Updatability**: Owners can change messages, allowing for dynamic content.

- **Visibility**: Publicly viewable, adding interactivity to the grid.

- **Integration**: Stored alongside color and position data in the smart contract.

- **Use Cases**: Community building, artistic expression, marketing, easter eggs, storytelling.

- **Technical Aspects**:
  - Stored as strings in the Pixel struct.
  - No strict length limit (gas costs naturally limit length).
  - Included in tokenURI generation for standard NFT metadata.

- **Considerations**:
  - Users aware of public, permanent nature.
  - Potential for basic content moderation guidelines.

- **Future Potential**:
  - Possible expansion to rich media or interactive content.
  - Potential integration with external services for dynamic content.

This feature transforms pixels into communication tools, adding depth to the PixelGrid ecosystem and encouraging user engagement.

---

## 5. Technical Considerations

### 5.1 Performance Optimization

PixelGrid employs various techniques for efficient rendering and smooth user experience:

- **Rendering and Data Management**:
  - Canvas-based rendering for efficient large-scale pixel manipulation.
  - Viewport culling to render only visible pixels.
  - Optimized data structures using bitwise operations for color and position.

- **React and Component Optimization**:
  - React.memo for preventing unnecessary re-renders.
  - Custom hooks for efficient state and data fetching management.

- **Loading and Code Management**:
  - Next.js features for code splitting and lazy loading.
  - Dynamic imports for on-demand content loading.

- **Blockchain Interaction**:
  - Batched data fetching and caching to minimize blockchain calls.
  - Progressive loading approach for UI updates.

- **UI and Animation**:
  - Threaded animations for smooth performance without blocking the main thread.
  - CSS animations for GPU-accelerated effects.

- **Responsive Design** (Work-in-Progress):
  - Tailwind CSS for efficient, utility-first styling.
  - Media queries and flexible layouts for cross-device performance.

- **Asset Management**:
  - SVG usage for scalable icons.
  - Optimized image formats for modern browsers.

- **Error Handling and Reliability**:
  - Error boundaries to prevent app-wide crashes.
  - Fallback UI components for graceful error and loading state handling.
  - RPC fallback mechanism with multiple endpoints for reliable blockchain connectivity.

- **State and Data Management**:
  - React's Context API and custom hooks to avoid prop drilling.
  - Memoization of complex calculations and frequently accessed data.
  - React Query for efficient blockchain data fetching and caching.

These optimizations ensure PixelGrid can handle large-scale grids and frequent blockchain interactions while maintaining responsiveness across devices and network conditions.

---

### 5.2 Data Loading and Caching

PixelGrid implements efficient strategies for handling large amounts of pixel data:

- **Custom Data Fetching Hook**:
  - Centralizes logic for fetching and managing pixel data.
  - Utilizes React's useState and useEffect for state management.

- **Batched Loading**:
  - Fetches pixels in groups (typically 1000 at a time) to prevent overwhelming blockchain or client.
  - Enables progressive loading and rendering of the grid.

- **Local Caching**:
  - Stores fetched pixel data in component state as a local cache.
  - Reduces need for repeated blockchain calls.

- **Optimistic Updates**:
  - Immediately updates local state on user actions for instant feedback.

- **Efficient Data Structures**:
  - Uses bitwise operations for color and position data.
  - Minimizes memory usage and improves retrieval speed.

- **React Query Integration**:
  - Provides built-in caching, request deduplication, and background refetching.

- **Progressive Loading**:
  - Implements progress tracking for incremental UI updates during data fetching.

- **Error Handling**:
  - Includes error management for failed requests.
  - Structure allows for easy addition of retry mechanisms.

- **Selective Refreshing**:
  - Allows updating specific pixels without refetching entire dataset.

- **Function Memoization**:
  - Key functions like individual pixel fetching are memoized for efficiency.

- **RPC Fallback Mechanism**:
  - Uses multiple RPC endpoints with a fallback system for reliable data fetching.

These strategies balance the need for up-to-date information with the performance requirements of a responsive web application.

---

### 5.3 RPC Fallback Mechanism

PixelGrid implements a robust RPC fallback system for reliable blockchain interactions:

- **Multiple RPC Endpoints**:
  - Array of public and private RPC providers for Base blockchain.
  - Increases reliability by providing alternatives for failures or slowdowns.

- **Fallback Transport Configuration**:
  - Primary connection point created using the first RPC endpoint.

- **RPC Transport Array**:
  - All endpoints mapped to create transport options.
  - Each configured with:
    - 10-second timeout
    - 3 retry attempts
    - 1-second retry delay

- **Public Client Creation**:
  - Uses configured endpoints for blockchain read operations.

- **Automatic Failover**:
  - Tries next endpoint if primary fails or becomes unresponsive.
  - Continues until successful connection or all endpoints exhausted.

- **Error Handling and Logging**:
  - Catches and logs RPC connection issues for debugging and endpoint evaluation.

- **Performance Optimization**:
  - Potential for selecting faster or less congested endpoints.

- **Customization and Flexibility**:
  - Easy updates or expansion of RPC configuration.

- **Environment-based Configuration**:
  - Primary RPC URL set through environment variable for easy switching between environments.

- **Security Considerations**:
  - Multiple public endpoints reduce reliance on a single provider.
  - Uses reputable providers to minimize risk of malicious endpoints.

- **Compatibility**:
  - Designed to work seamlessly with Wagmi and Viem libraries.

This mechanism ensures consistent and reliable Base blockchain connections, reducing downtime risk and enhancing user experience.

---

## 6. Roadmap / Future Developments

Please note that these are speculative and may not all come to fruition:

- Enhanced Mobile Responsiveness:
  - Optimize Canvas for touch interactions
  - Mobile-friendly controls for zooming and panning
  - UI adjustments for smaller screens

- Pixel Editing Interface (WIP):
  - ✅ Modal for editing existing pixels
  - Color history or favorites for quick reuse

- User Dashboard:
  - View owned pixels and snapshots
  - Transaction history and minting statistics
  - Gallery view for pixel art creations

- Community Features:
  - Commenting system for pixels and snapshots
  - Voting mechanism for popular art or collaborations
  - Themed challenges or competitions

- Advanced Grid Functionality:
  - Multi-pixel selection for larger artworks
  - Tools for basic shapes and patterns
  - Undo/redo functionality

- Snapshot Enhancements:
  - Interface for viewing historical snapshots
  - Zooming and panning within snapshots
  - Timelapse feature for grid evolution visualization

- Performance Optimizations:
  - WebSocket connections for real-time updates
  - Optimizations for larger grid sizes
  - More efficient caching strategies

- Accessibility Improvements:
  - Enhanced keyboard navigation
  - Screen reader support
  - Improved color contrast and alternative text descriptions

- Smart Contract Upgrades:
  - Additional utility features for NFTs
  - Gas cost optimization for high-volume operations

- Analytics and Insights:
  - On-chain analytics for usage and growth tracking
  - Visualizations for trends and user activity
  - Public API for developers

- Marketplace Integration:
  - In-platform trading for pixels and snapshots
  - Auction functionality
  - Bundle options for adjacent pixels

- Educational Resources:
  - Tutorials and guides for pixel art creation
  - In-app pixel art academy
  - Developer documentation

- Collaboration Tools:
  - Shared ownership or fractional NFTs
  - Real-time group pixel art creation
  - Themed zones for community projects

- Environmental Considerations:
  - Research on energy-efficient minting methods
  - Carbon offset programs or partnerships
  - Educational content on blockchain sustainability

---

## 7. Conclusion

PixelGrid represents a unique intersection of blockchain technology, digital art, and community collaboration. By providing a platform for granular ownership and creative expression, PixelGrid aims to push the boundaries of what's possible in the realm of decentralized art and collectibles.
