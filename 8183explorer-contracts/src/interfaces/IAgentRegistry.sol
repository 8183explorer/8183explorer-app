// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAgentRegistry {
    /// @notice Emitted when a new agent is registered
    event Registered(uint256 indexed agentId, string agentURI, address indexed owner);
    
    /// @notice Emitted when agent URI is updated
    event URIUpdated(uint256 indexed agentId, string newURI, address indexed updatedBy);
    
    /// @notice Emitted when agent wallet is set
    event AgentWalletSet(uint256 indexed agentId, address indexed wallet);
    
    /// @notice Register a new agent
    /// @param agentURI The metadata URI (IPFS, HTTPS, or data URI)
    /// @return agentId The new agent's token ID
    function register(string calldata agentURI) external returns (uint256 agentId);
    
    /// @notice Register agent with specific wallet
    /// @param agentURI The metadata URI
    /// @param agentWallet The wallet address for this agent
    /// @return agentId The new agent's token ID
    function registerWithWallet(string calldata agentURI, address agentWallet) external returns (uint256 agentId);
    
    /// @notice Update agent metadata URI
    /// @param agentId The agent's token ID
    /// @param newURI The new metadata URI
    function updateURI(uint256 agentId, string calldata newURI) external;
    
    /// @notice Set the agent's operational wallet
    /// @param agentId The agent's token ID
    /// @param wallet The wallet address
    function setAgentWallet(uint256 agentId, address wallet) external;
    
    /// @notice Get agent's operational wallet
    /// @param agentId The agent's token ID
    /// @return wallet The wallet address
    function getAgentWallet(uint256 agentId) external view returns (address wallet);
    
    /// @notice Store arbitrary metadata
    /// @param agentId The agent's token ID
    /// @param key The metadata key
    /// @param value The metadata value
    function setMetadata(uint256 agentId, string calldata key, bytes calldata value) external;
    
    /// @notice Retrieve arbitrary metadata
    /// @param agentId The agent's token ID
    /// @param key The metadata key
    /// @return value The metadata value
    function getMetadata(uint256 agentId, string calldata key) external view returns (bytes memory value);
}
