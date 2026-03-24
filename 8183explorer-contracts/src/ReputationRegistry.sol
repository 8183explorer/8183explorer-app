// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IReputationRegistry.sol";

/**
 * @title ReputationRegistry
 * @notice ERC-8004 compliant Reputation Registry
 * @dev Stores feedback from clients about agents
 */
contract ReputationRegistry is IReputationRegistry {
    
    // ═══════════════════════════════════════════════════════════
    // STRUCTS
    // ═══════════════════════════════════════════════════════════
    
    struct Feedback {
        address client;
        int128 value;
        uint8 valueDecimals;
        string tag1;
        string tag2;
        string endpoint;
        string feedbackURI;
        bytes32 feedbackHash;
        bool revoked;
        uint256 timestamp;
    }
    
    // ═══════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════
    
    /// @notice Agent ID => Feedback array
    mapping(uint256 => Feedback[]) private _feedbacks;
    
    /// @notice Agent ID => Client => Last index
    mapping(uint256 => mapping(address => uint64)) private _lastIndex;
    
    /// @notice Agent ID => Unique clients set
    mapping(uint256 => address[]) private _clients;
    mapping(uint256 => mapping(address => bool)) private _isClient;
    
    // ═══════════════════════════════════════════════════════════
    // FEEDBACK OPERATIONS
    // ═══════════════════════════════════════════════════════════
    
    /// @inheritdoc IReputationRegistry
    function giveFeedback(
        uint256 agentId,
        int128 value,
        uint8 valueDecimals,
        string calldata tag1,
        string calldata tag2,
        string calldata endpoint,
        string calldata feedbackURI
    ) external {
        bytes32 feedbackHash = keccak256(
            abi.encodePacked(agentId, msg.sender, value, tag1, tag2, block.timestamp)
        );
        
        Feedback memory fb = Feedback({
            client: msg.sender,
            value: value,
            valueDecimals: valueDecimals,
            tag1: tag1,
            tag2: tag2,
            endpoint: endpoint,
            feedbackURI: feedbackURI,
            feedbackHash: feedbackHash,
            revoked: false,
            timestamp: block.timestamp
        });
        
        _feedbacks[agentId].push(fb);
        uint64 index = uint64(_feedbacks[agentId].length - 1);
        _lastIndex[agentId][msg.sender] = index;
        
        // Track unique clients
        if (!_isClient[agentId][msg.sender]) {
            _clients[agentId].push(msg.sender);
            _isClient[agentId][msg.sender] = true;
        }
        
        emit NewFeedback(
            agentId,
            msg.sender,
            index,
            value,
            valueDecimals,
            tag1,
            tag1,
            tag2,
            endpoint,
            feedbackURI,
            feedbackHash
        );
    }
    
    /// @inheritdoc IReputationRegistry
    function revokeFeedback(uint256 agentId, uint64 feedbackIndex) external {
        require(feedbackIndex < _feedbacks[agentId].length, "Invalid index");
        Feedback storage fb = _feedbacks[agentId][feedbackIndex];
        require(fb.client == msg.sender, "Not your feedback");
        require(!fb.revoked, "Already revoked");
        
        fb.revoked = true;
        
        emit FeedbackRevoked(agentId, msg.sender, feedbackIndex);
    }
    
    // ═══════════════════════════════════════════════════════════
    // VIEWS
    // ═══════════════════════════════════════════════════════════
    
    /// @inheritdoc IReputationRegistry
    function getSummary(
        uint256 agentId,
        address[] calldata clientAddresses,
        string calldata tag1,
        string calldata tag2
    ) external view returns (
        uint64 count,
        int128 summaryValue,
        uint8 summaryValueDecimals
    ) {
        Feedback[] storage feedbacks = _feedbacks[agentId];
        summaryValueDecimals = 2; // Fixed to 2 decimals
        
        for (uint256 i = 0; i < feedbacks.length; i++) {
            Feedback storage fb = feedbacks[i];
            
            if (fb.revoked) continue;
            
            // Filter by clients if specified
            if (clientAddresses.length > 0) {
                bool found = false;
                for (uint256 j = 0; j < clientAddresses.length; j++) {
                    if (fb.client == clientAddresses[j]) {
                        found = true;
                        break;
                    }
                }
                if (!found) continue;
            }
            
            // Filter by tags if specified
            if (bytes(tag1).length > 0 && keccak256(bytes(fb.tag1)) != keccak256(bytes(tag1))) continue;
            if (bytes(tag2).length > 0 && keccak256(bytes(fb.tag2)) != keccak256(bytes(tag2))) continue;
            
            count++;
            // Normalize to 2 decimals
            int128 normalized = fb.value;
            if (fb.valueDecimals < 2) {
                normalized = fb.value * int128(int256(10 ** (2 - fb.valueDecimals)));
            } else if (fb.valueDecimals > 2) {
                normalized = fb.value / int128(int256(10 ** (fb.valueDecimals - 2)));
            }
            summaryValue += normalized;
        }
    }
    
    /// @inheritdoc IReputationRegistry
    function getClients(uint256 agentId) external view returns (address[] memory) {
        return _clients[agentId];
    }
    
    /// @inheritdoc IReputationRegistry
    function getLastIndex(uint256 agentId, address clientAddress) external view returns (uint64) {
        return _lastIndex[agentId][clientAddress];
    }
    
    /// @inheritdoc IReputationRegistry
    function readAllFeedback(
        uint256 agentId,
        address[] calldata clientAddresses,
        string calldata tag1,
        string calldata tag2,
        bool includeRevoked
    ) external view returns (
        address[] memory clients,
        uint64[] memory indexes,
        int128[] memory values,
        uint8[] memory valueDecimals,
        string[] memory tag1s,
        string[] memory tag2s,
        bool[] memory revokedStatuses
    ) {
        Feedback[] storage feedbacks = _feedbacks[agentId];
        
        // Count matching feedbacks
        uint256 matchCount = 0;
        for (uint256 i = 0; i < feedbacks.length; i++) {
            if (_matchesFeedbackFilter(feedbacks[i], clientAddresses, tag1, tag2, includeRevoked)) {
                matchCount++;
            }
        }
        
        // Allocate arrays
        clients = new address[](matchCount);
        indexes = new uint64[](matchCount);
        values = new int128[](matchCount);
        valueDecimals = new uint8[](matchCount);
        tag1s = new string[](matchCount);
        tag2s = new string[](matchCount);
        revokedStatuses = new bool[](matchCount);
        
        // Fill arrays
        uint256 idx = 0;
        for (uint256 i = 0; i < feedbacks.length; i++) {
            if (_matchesFeedbackFilter(feedbacks[i], clientAddresses, tag1, tag2, includeRevoked)) {
                Feedback storage fb = feedbacks[i];
                clients[idx] = fb.client;
                indexes[idx] = uint64(i);
                values[idx] = fb.value;
                valueDecimals[idx] = fb.valueDecimals;
                tag1s[idx] = fb.tag1;
                tag2s[idx] = fb.tag2;
                revokedStatuses[idx] = fb.revoked;
                idx++;
            }
        }
    }
    
    function _matchesFeedbackFilter(
        Feedback storage fb,
        address[] calldata clientAddresses,
        string calldata tag1,
        string calldata tag2,
        bool includeRevoked
    ) internal view returns (bool) {
        if (!includeRevoked && fb.revoked) return false;
        
        if (clientAddresses.length > 0) {
            bool found = false;
            for (uint256 i = 0; i < clientAddresses.length; i++) {
                if (fb.client == clientAddresses[i]) {
                    found = true;
                    break;
                }
            }
            if (!found) return false;
        }
        
        if (bytes(tag1).length > 0 && keccak256(bytes(fb.tag1)) != keccak256(bytes(tag1))) return false;
        if (bytes(tag2).length > 0 && keccak256(bytes(fb.tag2)) != keccak256(bytes(tag2))) return false;
        
        return true;
    }
}
