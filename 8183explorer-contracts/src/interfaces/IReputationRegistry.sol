// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IReputationRegistry {
    /// @notice Emitted when new feedback is given
    event NewFeedback(
        uint256 indexed agentId,
        address indexed clientAddress,
        uint64 feedbackIndex,
        int128 value,
        uint8 valueDecimals,
        string indexed indexedTag1,
        string tag1,
        string tag2,
        string endpoint,
        string feedbackURI,
        bytes32 feedbackHash
    );
    
    /// @notice Emitted when feedback is revoked
    event FeedbackRevoked(
        uint256 indexed agentId, 
        address indexed clientAddress, 
        uint64 indexed feedbackIndex
    );
    
    /// @notice Give feedback to an agent
    function giveFeedback(
        uint256 agentId,
        int128 value,
        uint8 valueDecimals,
        string calldata tag1,
        string calldata tag2,
        string calldata endpoint,
        string calldata feedbackURI
    ) external;
    
    /// @notice Revoke previously given feedback
    function revokeFeedback(uint256 agentId, uint64 feedbackIndex) external;
    
    /// @notice Get summary of feedback for an agent
    function getSummary(
        uint256 agentId,
        address[] calldata clientAddresses,
        string calldata tag1,
        string calldata tag2
    ) external view returns (
        uint64 count,
        int128 summaryValue,
        uint8 summaryValueDecimals
    );
    
    /// @notice Get all clients who gave feedback
    function getClients(uint256 agentId) external view returns (address[] memory);
    
    /// @notice Get last feedback index for a client
    function getLastIndex(uint256 agentId, address clientAddress) external view returns (uint64);
    
    /// @notice Read all feedback for an agent
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
    );
}
