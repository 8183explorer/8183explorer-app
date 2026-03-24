// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/AgentRegistry.sol";
import "../src/ReputationRegistry.sol";
import "../src/AgenticCommerce.sol";

contract DeployScript is Script {
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        console.log("Deploying to chain:", block.chainid);
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy AgentRegistry (ERC-8004 Identity)
        AgentRegistry agentRegistry = new AgentRegistry();
        console.log("AgentRegistry deployed at:", address(agentRegistry));
        
        // Deploy ReputationRegistry (ERC-8004 Reputation)
        ReputationRegistry reputationRegistry = new ReputationRegistry();
        console.log("ReputationRegistry deployed at:", address(reputationRegistry));
        
        // Deploy AgenticCommerce (ERC-8183)
        AgenticCommerce agenticCommerce = new AgenticCommerce();
        console.log("AgenticCommerce deployed at:", address(agenticCommerce));
        
        vm.stopBroadcast();
        
        // Output for easy copy-paste
        console.log("\n========================================");
        console.log("DEPLOYED CONTRACTS (copy to frontend):");
        console.log("========================================");
        console.log("AGENT_REGISTRY=", address(agentRegistry));
        console.log("REPUTATION_REGISTRY=", address(reputationRegistry));
        console.log("AGENTIC_COMMERCE=", address(agenticCommerce));
        console.log("========================================\n");
    }
}
