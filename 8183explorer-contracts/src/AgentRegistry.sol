// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IAgentRegistry.sol";

/**
 * @title AgentRegistry
 * @notice ERC-8004 compliant Agent Identity Registry
 * @dev Each agent is an ERC-721 NFT with metadata URI and operational wallet
 */
contract AgentRegistry is 
    ERC721, 
    ERC721Enumerable, 
    ERC721URIStorage, 
    Ownable,
    IAgentRegistry 
{
    // ═══════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════
    
    uint256 private _nextTokenId;
    
    /// @notice Agent ID => Operational wallet address
    mapping(uint256 => address) private _agentWallets;
    
    /// @notice Agent ID => Key => Value (arbitrary metadata)
    mapping(uint256 => mapping(string => bytes)) private _metadata;
    
    // ═══════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════
    
    constructor() ERC721("8183Explorer Agents", "AGENT") Ownable(msg.sender) {
        _nextTokenId = 1; // Start from 1
    }
    
    // ═══════════════════════════════════════════════════════════
    // REGISTRATION
    // ═══════════════════════════════════════════════════════════
    
    /// @inheritdoc IAgentRegistry
    function register(string calldata agentURI) external returns (uint256 agentId) {
        return _registerAgent(msg.sender, agentURI, msg.sender);
    }
    
    /// @inheritdoc IAgentRegistry
    function registerWithWallet(
        string calldata agentURI, 
        address agentWallet
    ) external returns (uint256 agentId) {
        require(agentWallet != address(0), "Invalid wallet");
        return _registerAgent(msg.sender, agentURI, agentWallet);
    }
    
    function _registerAgent(
        address owner,
        string calldata agentURI,
        address agentWallet
    ) internal returns (uint256 agentId) {
        agentId = _nextTokenId++;
        
        _safeMint(owner, agentId);
        _setTokenURI(agentId, agentURI);
        _agentWallets[agentId] = agentWallet;
        
        emit Registered(agentId, agentURI, owner);
        emit AgentWalletSet(agentId, agentWallet);
    }
    
    // ═══════════════════════════════════════════════════════════
    // UPDATES
    // ═══════════════════════════════════════════════════════════
    
    /// @inheritdoc IAgentRegistry
    function updateURI(uint256 agentId, string calldata newURI) external {
        require(_isAuthorized(ownerOf(agentId), msg.sender, agentId), "Not authorized");
        _setTokenURI(agentId, newURI);
        emit URIUpdated(agentId, newURI, msg.sender);
    }
    
    /// @inheritdoc IAgentRegistry
    function setAgentWallet(uint256 agentId, address wallet) external {
        require(_isAuthorized(ownerOf(agentId), msg.sender, agentId), "Not authorized");
        require(wallet != address(0), "Invalid wallet");
        _agentWallets[agentId] = wallet;
        emit AgentWalletSet(agentId, wallet);
    }
    
    /// @inheritdoc IAgentRegistry
    function setMetadata(
        uint256 agentId, 
        string calldata key, 
        bytes calldata value
    ) external {
        require(_isAuthorized(ownerOf(agentId), msg.sender, agentId), "Not authorized");
        _metadata[agentId][key] = value;
    }
    
    // ═══════════════════════════════════════════════════════════
    // VIEWS
    // ═══════════════════════════════════════════════════════════
    
    /// @inheritdoc IAgentRegistry
    function getAgentWallet(uint256 agentId) external view returns (address) {
        require(_ownerOf(agentId) != address(0), "Agent not found");
        return _agentWallets[agentId];
    }
    
    /// @inheritdoc IAgentRegistry
    function getMetadata(
        uint256 agentId, 
        string calldata key
    ) external view returns (bytes memory) {
        require(_ownerOf(agentId) != address(0), "Agent not found");
        return _metadata[agentId][key];
    }
    
    // ═══════════════════════════════════════════════════════════
    // OVERRIDES (required for ERC721 extensions)
    // ═══════════════════════════════════════════════════════════
    
    function _update(
        address to, 
        uint256 tokenId, 
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account, 
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
