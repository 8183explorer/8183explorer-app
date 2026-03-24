// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/AgentRegistry.sol";
import "../src/AgenticCommerce.sol";

/**
 * @notice Fixes broken seed data by:
 *   1. Assigning unique wallets to agents 1-3 (breaks wallet-sharing that caused SYBIL false positives)
 *   2. Completing old sybil jobs 1-5 on agent5 (RISKY_TRADER_BOT) for demo purposes
 *   3. Creating clean jobs from a separate client address → proper client ≠ provider
 *   4. Submitting and completing new clean jobs to generate real TrustScores
 *
 * Result after run:
 *   Agent 1 (NEXUS_ORACLE_V3)  : 5 completed, TrustScore ~35
 *   Agent 2 (AURA_YIELD_BOT)   : 3 completed + 1 rejected, TrustScore ~25
 *   Agent 3 (CONTENT_ENGINE_X) : 3 completed, TrustScore ~20
 *   Agent 4 (TRADE_SIGNAL_PRO) : no jobs, TrustScore ~0
 *   Agent 5 (RISKY_TRADER_BOT) : 5 completed but SYBIL_PATTERN → TrustScore 0
 *
 * Uses deterministic test private keys — testnet only, never use on mainnet.
 */
contract FixSeedScript is Script {

    // Deterministic testnet-only keys (DO NOT use on mainnet)
    uint256 constant PROVIDER1_KEY = uint256(keccak256("8183explorer.provider.agent1.v1"));
    uint256 constant PROVIDER2_KEY = uint256(keccak256("8183explorer.provider.agent2.v1"));
    uint256 constant PROVIDER3_KEY = uint256(keccak256("8183explorer.provider.agent3.v1"));
    uint256 constant CLIENT_KEY    = uint256(keccak256("8183explorer.client.v1"));

    function run() external {
        address agentRegistryAddr   = vm.envAddress("AGENT_REGISTRY");
        address agenticCommerceAddr = vm.envAddress("AGENTIC_COMMERCE");
        uint256 deployerKey         = vm.envUint("PRIVATE_KEY");
        address deployer            = vm.addr(deployerKey);

        address provider1  = vm.addr(PROVIDER1_KEY);
        address provider2  = vm.addr(PROVIDER2_KEY);
        address provider3  = vm.addr(PROVIDER3_KEY);
        address clientAddr = vm.addr(CLIENT_KEY);

        console.log("=== FixSeed ===");
        console.log("Deployer: ", deployer);
        console.log("Provider1:", provider1);
        console.log("Provider2:", provider2);
        console.log("Provider3:", provider3);
        console.log("Client:   ", clientAddr);

        AgentRegistry   registry = AgentRegistry(agentRegistryAddr);
        AgenticCommerce commerce = AgenticCommerce(agenticCommerceAddr);

        // Pre-read job counter so we can compute new job IDs deterministically
        uint256 startJobId = commerce.jobCounter() + 1;
        console.log("New jobs start at ID:", startJobId);

        // ── PHASE 1: Rewire agent wallets + fund test addresses ───────────────
        vm.startBroadcast(deployerKey);

        registry.setAgentWallet(1, provider1);   // NEXUS_ORACLE_V3
        registry.setAgentWallet(2, provider2);   // AURA_YIELD_BOT
        registry.setAgentWallet(3, provider3);   // CONTENT_ENGINE_X
        // Agents 4 & 5 keep wallet = deployer (agent5 will absorb sybil jobs)

        payable(provider1).transfer(0.001 ether);
        payable(provider2).transfer(0.001 ether);
        payable(provider3).transfer(0.001 ether);
        payable(clientAddr).transfer(0.02 ether);  // covers 12 jobs × 0.001 ETH + gas

        vm.stopBroadcast();
        console.log("Phase 1 done: agent wallets updated, test addresses funded");

        // ── PHASE 2: Complete old sybil jobs for agent5 (RISKY_TRADER_BOT) ──
        // Jobs 1-5 still have provider = deployer = agent5.wallet
        // Completing them adds history to agent5 while SYBIL_PATTERN still fires
        vm.startBroadcast(deployerKey);
        for (uint256 jobId = 1; jobId <= 5; jobId++) {
            IAgenticCommerce.Job memory job = commerce.getJob(jobId);
            if (job.status == IAgenticCommerce.JobStatus.Funded) {
                commerce.submitJob(jobId, keccak256(abi.encodePacked("del.sybil.", jobId)));
                commerce.completeJob(jobId, keccak256("sybil_completed"));
                console.log("Completed sybil job:", jobId);
            }
        }
        vm.stopBroadcast();
        console.log("Phase 2 done: sybil jobs completed on agent5");

        // ── PHASE 3: Create clean jobs from clientAddr ────────────────────────
        vm.startBroadcast(CLIENT_KEY);

        // 5 jobs for Agent 1
        for (uint256 i = 0; i < 5; i++) {
            commerce.createJob{value: 0.001 ether}(
                provider1, deployer,
                "Data oracle query request",
                block.timestamp + 30 days, address(0)
            );
        }
        // 4 jobs for Agent 2
        for (uint256 i = 0; i < 4; i++) {
            commerce.createJob{value: 0.001 ether}(
                provider2, deployer,
                "Yield optimization task",
                block.timestamp + 14 days, address(0)
            );
        }
        // 3 jobs for Agent 3
        for (uint256 i = 0; i < 3; i++) {
            commerce.createJob{value: 0.001 ether}(
                provider3, deployer,
                "Content generation task",
                block.timestamp + 14 days, address(0)
            );
        }

        vm.stopBroadcast();
        console.log("Phase 3 done: 12 clean jobs created");

        // ── PHASE 4: Submit jobs from provider wallets ────────────────────────
        vm.startBroadcast(PROVIDER1_KEY);
        for (uint256 i = 0; i < 5; i++) {
            commerce.submitJob(startJobId + i, keccak256(abi.encodePacked("del.p1.", i)));
        }
        vm.stopBroadcast();

        vm.startBroadcast(PROVIDER2_KEY);
        for (uint256 i = 0; i < 3; i++) {   // submit 3 of 4 (leave last for reject)
            commerce.submitJob(startJobId + 5 + i, keccak256(abi.encodePacked("del.p2.", i)));
        }
        vm.stopBroadcast();

        vm.startBroadcast(PROVIDER3_KEY);
        for (uint256 i = 0; i < 3; i++) {
            commerce.submitJob(startJobId + 9 + i, keccak256(abi.encodePacked("del.p3.", i)));
        }
        vm.stopBroadcast();
        console.log("Phase 4 done: jobs submitted by providers");

        // ── PHASE 5: Complete / reject as evaluator (deployer) ───────────────
        vm.startBroadcast(deployerKey);

        // Agent 1: complete all 5
        for (uint256 i = 0; i < 5; i++) {
            commerce.completeJob(startJobId + i, keccak256("approved"));
        }
        // Agent 2: complete 3, reject 1
        for (uint256 i = 0; i < 3; i++) {
            commerce.completeJob(startJobId + 5 + i, keccak256("approved"));
        }
        commerce.rejectJob(startJobId + 8, keccak256("deliverable_not_met"));
        // Agent 3: complete all 3
        for (uint256 i = 0; i < 3; i++) {
            commerce.completeJob(startJobId + 9 + i, keccak256("approved"));
        }

        vm.stopBroadcast();
        console.log("Phase 5 done: jobs completed/rejected");

        console.log("\n=== FixSeed COMPLETE ===");
        console.log("Agent 1 wallet:", provider1, "-> 5 completed jobs");
        console.log("Agent 2 wallet:", provider2, "-> 3 completed + 1 rejected");
        console.log("Agent 3 wallet:", provider3, "-> 3 completed jobs");
        console.log("Agent 4: no new jobs");
        console.log("Agent 5 (RISKY): 5 sybil jobs completed, SYBIL_PATTERN flag active");
    }
}
