// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/AgentRegistry.sol";

contract AgentRegistryTest is Test {
    AgentRegistry public registry;
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    
    function setUp() public {
        registry = new AgentRegistry();
    }
    
    function testRegister() public {
        vm.prank(alice);
        uint256 agentId = registry.register("ipfs://QmTest");
        
        assertEq(agentId, 1);
        assertEq(registry.ownerOf(agentId), alice);
        assertEq(registry.tokenURI(agentId), "ipfs://QmTest");
        assertEq(registry.getAgentWallet(agentId), alice);
    }
    
    function testRegisterWithWallet() public {
        vm.prank(alice);
        uint256 agentId = registry.registerWithWallet("ipfs://QmTest", bob);
        
        assertEq(registry.ownerOf(agentId), alice);
        assertEq(registry.getAgentWallet(agentId), bob);
    }
    
    function testUpdateURI() public {
        vm.prank(alice);
        uint256 agentId = registry.register("ipfs://QmOld");
        
        vm.prank(alice);
        registry.updateURI(agentId, "ipfs://QmNew");
        
        assertEq(registry.tokenURI(agentId), "ipfs://QmNew");
    }
    
    function testUnauthorizedUpdate() public {
        vm.prank(alice);
        uint256 agentId = registry.register("ipfs://QmTest");
        
        vm.prank(bob);
        vm.expectRevert("Not authorized");
        registry.updateURI(agentId, "ipfs://QmHack");
    }
    
    function testTotalSupply() public {
        vm.prank(alice);
        registry.register("ipfs://Qm1");
        
        vm.prank(bob);
        registry.register("ipfs://Qm2");
        
        assertEq(registry.totalSupply(), 2);
    }
}
