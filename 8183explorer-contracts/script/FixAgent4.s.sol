// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/AgentRegistry.sol";

contract FixAgent4Script is Script {
    uint256 constant PROVIDER4_KEY = uint256(keccak256("8183explorer.provider.agent4.v1"));

    function run() external {
        address agentRegistryAddr = vm.envAddress("AGENT_REGISTRY");
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address provider4 = vm.addr(PROVIDER4_KEY);

        console.log("Agent4 new wallet:", provider4);

        vm.startBroadcast(deployerKey);
        AgentRegistry(agentRegistryAddr).setAgentWallet(4, provider4);
        vm.stopBroadcast();

        console.log("Agent 4 wallet updated -> fresh address, no sybil jobs");
    }
}
