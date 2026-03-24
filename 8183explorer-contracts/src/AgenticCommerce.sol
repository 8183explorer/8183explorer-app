// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IAgenticCommerce.sol";

/**
 * @title AgenticCommerce
 * @notice ERC-8183 compliant Agentic Commerce / Job Escrow
 * @dev Handles job creation, funding, submission, and completion with escrow
 */
contract AgenticCommerce is IAgenticCommerce, ReentrancyGuard {
    
    // ═══════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════
    
    uint256 private _jobCounter;
    
    mapping(uint256 => Job) private _jobs;
    mapping(uint256 => uint256) private _escrowBalances;
    mapping(uint256 => bytes32) private _deliverables;
    
    // ═══════════════════════════════════════════════════════════
    // MODIFIERS
    // ═══════════════════════════════════════════════════════════
    
    modifier jobExists(uint256 jobId) {
        require(_jobs[jobId].client != address(0), "Job not found");
        _;
    }
    
    modifier onlyClient(uint256 jobId) {
        require(_jobs[jobId].client == msg.sender, "Not client");
        _;
    }
    
    modifier onlyProvider(uint256 jobId) {
        require(_jobs[jobId].provider == msg.sender, "Not provider");
        _;
    }
    
    modifier onlyEvaluator(uint256 jobId) {
        require(_jobs[jobId].evaluator == msg.sender, "Not evaluator");
        _;
    }
    
    // ═══════════════════════════════════════════════════════════
    // JOB LIFECYCLE
    // ═══════════════════════════════════════════════════════════
    
    /// @inheritdoc IAgenticCommerce
    function createJob(
        address provider,
        address evaluator,
        string calldata description,
        uint256 expiredAt,
        address hook
    ) external payable returns (uint256 jobId) {
        require(provider != address(0), "Invalid provider");
        require(expiredAt > block.timestamp, "Invalid expiry");
        
        jobId = ++_jobCounter;
        
        _jobs[jobId] = Job({
            id: jobId,
            client: msg.sender,
            provider: provider,
            evaluator: evaluator != address(0) ? evaluator : msg.sender,
            description: description,
            budget: msg.value,
            expiredAt: expiredAt,
            status: msg.value > 0 ? JobStatus.Funded : JobStatus.Open,
            hook: hook
        });
        
        if (msg.value > 0) {
            _escrowBalances[jobId] = msg.value;
        }
        
        emit JobCreated(jobId, msg.sender, provider, evaluator, expiredAt, hook);
        
        if (msg.value > 0) {
            emit JobFunded(jobId, msg.sender, msg.value);
        }
    }
    
    /// @inheritdoc IAgenticCommerce
    function fundJob(uint256 jobId) external payable jobExists(jobId) onlyClient(jobId) {
        Job storage job = _jobs[jobId];
        require(job.status == JobStatus.Open, "Cannot fund");
        require(msg.value > 0, "No funds sent");
        
        job.budget += msg.value;
        job.status = JobStatus.Funded;
        _escrowBalances[jobId] += msg.value;
        
        emit JobFunded(jobId, msg.sender, msg.value);
    }
    
    /// @inheritdoc IAgenticCommerce
    function submitJob(
        uint256 jobId, 
        bytes32 deliverable
    ) external jobExists(jobId) onlyProvider(jobId) {
        Job storage job = _jobs[jobId];
        require(job.status == JobStatus.Funded, "Not funded");
        require(block.timestamp <= job.expiredAt, "Job expired");
        
        job.status = JobStatus.Submitted;
        _deliverables[jobId] = deliverable;
        
        emit JobSubmitted(jobId, msg.sender, deliverable);
    }
    
    /// @inheritdoc IAgenticCommerce
    function completeJob(
        uint256 jobId, 
        bytes32 reason
    ) external jobExists(jobId) onlyEvaluator(jobId) nonReentrant {
        Job storage job = _jobs[jobId];
        require(job.status == JobStatus.Submitted, "Not submitted");
        
        job.status = JobStatus.Completed;
        
        // Release escrow to provider
        uint256 amount = _escrowBalances[jobId];
        _escrowBalances[jobId] = 0;
        
        if (amount > 0) {
            (bool success, ) = payable(job.provider).call{value: amount}("");
            require(success, "Transfer failed");
        }
        
        emit JobCompleted(jobId, msg.sender, reason);
    }
    
    /// @inheritdoc IAgenticCommerce
    function rejectJob(
        uint256 jobId, 
        bytes32 reason
    ) external jobExists(jobId) nonReentrant {
        Job storage job = _jobs[jobId];
        require(
            msg.sender == job.evaluator || msg.sender == job.client,
            "Not authorized"
        );
        require(
            job.status == JobStatus.Submitted || job.status == JobStatus.Funded,
            "Cannot reject"
        );
        
        job.status = JobStatus.Rejected;
        
        // Refund escrow to client
        uint256 amount = _escrowBalances[jobId];
        _escrowBalances[jobId] = 0;
        
        if (amount > 0) {
            (bool success, ) = payable(job.client).call{value: amount}("");
            require(success, "Transfer failed");
        }
        
        emit JobRejected(jobId, msg.sender, reason);
    }
    
    /// @inheritdoc IAgenticCommerce
    function expireJob(uint256 jobId) external jobExists(jobId) nonReentrant {
        Job storage job = _jobs[jobId];
        require(block.timestamp > job.expiredAt, "Not expired");
        require(
            job.status == JobStatus.Open || 
            job.status == JobStatus.Funded ||
            job.status == JobStatus.Submitted,
            "Already terminal"
        );
        
        job.status = JobStatus.Expired;
        
        // Refund escrow to client
        uint256 amount = _escrowBalances[jobId];
        _escrowBalances[jobId] = 0;
        
        if (amount > 0) {
            (bool success, ) = payable(job.client).call{value: amount}("");
            require(success, "Transfer failed");
        }
        
        emit JobExpired(jobId);
    }
    
    // ═══════════════════════════════════════════════════════════
    // VIEWS
    // ═══════════════════════════════════════════════════════════
    
    /// @inheritdoc IAgenticCommerce
    function getJob(uint256 jobId) external view returns (Job memory) {
        require(_jobs[jobId].client != address(0), "Job not found");
        return _jobs[jobId];
    }
    
    /// @inheritdoc IAgenticCommerce
    function jobCounter() external view returns (uint256) {
        return _jobCounter;
    }
    
    /// @notice Get deliverable hash for a job
    function getDeliverable(uint256 jobId) external view returns (bytes32) {
        return _deliverables[jobId];
    }
    
    /// @notice Get escrow balance for a job
    function getEscrowBalance(uint256 jobId) external view returns (uint256) {
        return _escrowBalances[jobId];
    }
}
