// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/AgentRegistry.sol";
import "../src/ReputationRegistry.sol";
import "../src/AgenticCommerce.sol";

/**
 * @notice Seeds test data into deployed contracts
 * @dev Run after Deploy.s.sol
 */
contract SeedDataScript is Script {
    
    // Paste deployed addresses here or use env vars
    address agentRegistryAddr;
    address reputationRegistryAddr;
    address agenticCommerceAddr;
    
    AgentRegistry agentRegistry;
    ReputationRegistry reputationRegistry;
    AgenticCommerce agenticCommerce;
    
    function run() external {
        // Load addresses from env
        agentRegistryAddr = vm.envAddress("AGENT_REGISTRY");
        reputationRegistryAddr = vm.envAddress("REPUTATION_REGISTRY");
        agenticCommerceAddr = vm.envAddress("AGENTIC_COMMERCE");
        
        agentRegistry = AgentRegistry(agentRegistryAddr);
        reputationRegistry = ReputationRegistry(reputationRegistryAddr);
        agenticCommerce = AgenticCommerce(agenticCommerceAddr);
        
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Seeding data from:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // ═══════════════════════════════════════════════════════════
        // 1. REGISTER TEST AGENTS
        // ═══════════════════════════════════════════════════════════
        
        // Agent 1: High performer
        string memory agent1URI = _buildDataURI(
            "NEXUS_ORACLE_V3",
            "High-performance data oracle for DeFi protocols"
        );
        uint256 agent1Id = agentRegistry.register(agent1URI);
        console.log("Registered Agent 1:", agent1Id);
        
        // Agent 2: Good performer
        string memory agent2URI = _buildDataURI(
            "AURA_YIELD_BOT", 
            "Automated yield optimization across DeFi"
        );
        uint256 agent2Id = agentRegistry.register(agent2URI);
        console.log("Registered Agent 2:", agent2Id);
        
        // Agent 3: Medium performer
        string memory agent3URI = _buildDataURI(
            "CONTENT_ENGINE_X",
            "AI content generation for marketing"
        );
        uint256 agent3Id = agentRegistry.register(agent3URI);
        console.log("Registered Agent 3:", agent3Id);
        
        // Agent 4: New agent
        string memory agent4URI = _buildDataURI(
            "TRADE_SIGNAL_PRO",
            "Advanced trading signals and analysis"
        );
        uint256 agent4Id = agentRegistry.register(agent4URI);
        console.log("Registered Agent 4:", agent4Id);
        
        // Agent 5: Risky agent (for testing red flags)
        string memory agent5URI = _buildDataURI(
            "RISKY_TRADER_BOT",
            "Experimental high-risk trading"
        );
        uint256 agent5Id = agentRegistry.register(agent5URI);
        console.log("Registered Agent 5:", agent5Id);
        
        // ═══════════════════════════════════════════════════════════
        // 2. CREATE JOBS FOR AGENTS
        // ═══════════════════════════════════════════════════════════
        
        address agent1Wallet = agentRegistry.getAgentWallet(agent1Id);
        address agent2Wallet = agentRegistry.getAgentWallet(agent2Id);
        address agent5Wallet = agentRegistry.getAgentWallet(agent5Id);
        
        // Create and complete some jobs for Agent 1
        for (uint i = 0; i < 5; i++) {
            uint256 jobId = agenticCommerce.createJob{value: 0.0001 ether}(
                agent1Wallet,
                deployer,
                "Data oracle query request",
                block.timestamp + 7 days,
                address(0)
            );
            
            // Simulate job completion (in real scenario, provider would submit)
            // For testing, we'll create jobs in different states
        }
        console.log("Created 5 jobs for Agent 1");
        
        // Create jobs for Agent 2
        for (uint i = 0; i < 3; i++) {
            agenticCommerce.createJob{value: 0.0001 ether}(
                agent2Wallet,
                deployer,
                "Yield optimization task",
                block.timestamp + 14 days,
                address(0)
            );
        }
        console.log("Created 3 jobs for Agent 2");
        
        // Create suspicious job for Agent 5 (sybil pattern - provider == client)
        // This would be caught as a red flag
        agenticCommerce.createJob{value: 0.0001 ether}(
            deployer, // Provider is same as client (deployer)
            deployer,
            "Suspicious self-trade",
            block.timestamp + 1 days,
            address(0)
        );
        console.log("Created sybil job for Agent 5");
        
        // ═══════════════════════════════════════════════════════════
        // 3. ADD REPUTATION FEEDBACK
        // ═══════════════════════════════════════════════════════════
        
        // Good feedback for Agent 1
        reputationRegistry.giveFeedback(
            agent1Id,
            9500, // 95.00 (2 decimals)
            2,
            "performance",
            "speed",
            "https://agent1.example/api",
            ""
        );
        console.log("Added feedback for Agent 1");
        
        // Good feedback for Agent 2
        reputationRegistry.giveFeedback(
            agent2Id,
            8800, // 88.00
            2,
            "yield",
            "reliability",
            "https://agent2.example/api",
            ""
        );
        console.log("Added feedback for Agent 2");
        
        // Bad feedback for Agent 5
        reputationRegistry.giveFeedback(
            agent5Id,
            2500, // 25.00
            2,
            "risk",
            "unreliable",
            "",
            ""
        );
        console.log("Added feedback for Agent 5");
        
        vm.stopBroadcast();
        
        console.log("\n========================================");
        console.log("SEED DATA COMPLETE");
        console.log("========================================");
        console.log("Agents registered: 5");
        console.log("Jobs created: 9");
        console.log("Feedback added: 3");
        console.log("========================================\n");
    }
    
    function _buildDataURI(
        string memory name,
        string memory description
    ) internal pure returns (string memory) {
        // Build minimal JSON metadata as data URI
        string memory json = string(abi.encodePacked(
            '{"type":"https://eips.ethereum.org/EIPS/eip-8004#registration-v1",',
            '"name":"', name, '",',
            '"description":"', description, '",',
            '"services":[{"name":"A2A","endpoint":"https://example.com/.well-known/agent-card.json","version":"0.3.0"}],',
            '"active":true}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(bytes(json))
        ));
    }
    
    // Simple base64 encoding (for small strings only)
    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        string memory TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        
        if (data.length == 0) return "";
        
        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        bytes memory result = new bytes(encodedLen);
        
        uint256 i = 0;
        uint256 j = 0;
        
        while (i < data.length) {
            uint256 a = uint8(data[i++]);
            uint256 b = i < data.length ? uint8(data[i++]) : 0;
            uint256 c = i < data.length ? uint8(data[i++]) : 0;
            
            uint256 triple = (a << 16) | (b << 8) | c;
            
            result[j++] = bytes(TABLE)[((triple >> 18) & 0x3F)];
            result[j++] = bytes(TABLE)[((triple >> 12) & 0x3F)];
            result[j++] = bytes(TABLE)[((triple >> 6) & 0x3F)];
            result[j++] = bytes(TABLE)[(triple & 0x3F)];
        }
        
        // Padding
        uint256 mod = data.length % 3;
        if (mod > 0) {
            result[encodedLen - 1] = "=";
            if (mod == 1) {
                result[encodedLen - 2] = "=";
            }
        }
        
        return string(result);
    }
}
