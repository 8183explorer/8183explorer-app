// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAgenticCommerce {
    enum JobStatus { Open, Funded, Submitted, Completed, Rejected, Expired }
    
    struct Job {
        uint256 id;
        address client;
        address provider;
        address evaluator;
        string description;
        uint256 budget;
        uint256 expiredAt;
        JobStatus status;
        address hook;
    }
    
    event JobCreated(
        uint256 indexed jobId, 
        address indexed client, 
        address indexed provider, 
        address evaluator, 
        uint256 expiredAt, 
        address hook
    );
    event JobFunded(uint256 indexed jobId, address indexed client, uint256 amount);
    event JobSubmitted(uint256 indexed jobId, address indexed provider, bytes32 deliverable);
    event JobCompleted(uint256 indexed jobId, address indexed evaluator, bytes32 reason);
    event JobRejected(uint256 indexed jobId, address indexed rejector, bytes32 reason);
    event JobExpired(uint256 indexed jobId);
    
    function createJob(
        address provider,
        address evaluator,
        string calldata description,
        uint256 expiredAt,
        address hook
    ) external payable returns (uint256 jobId);
    
    function fundJob(uint256 jobId) external payable;
    
    function submitJob(uint256 jobId, bytes32 deliverable) external;
    
    function completeJob(uint256 jobId, bytes32 reason) external;
    
    function rejectJob(uint256 jobId, bytes32 reason) external;
    
    function expireJob(uint256 jobId) external;
    
    function getJob(uint256 jobId) external view returns (Job memory);
    
    function jobCounter() external view returns (uint256);
}
