// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

contract HelperConfig is Script {
    struct NetworkConfig {
        uint256 chainId;
        string rpcUrl;
        address deployer;
    }
    
    NetworkConfig public activeConfig;
    
    // Base Sepolia
    uint256 constant BASE_SEPOLIA_CHAIN_ID = 84532;
    
    // Base Mainnet
    uint256 constant BASE_MAINNET_CHAIN_ID = 8453;
    
    constructor() {
        if (block.chainid == BASE_SEPOLIA_CHAIN_ID) {
            activeConfig = getBaseSepoliaConfig();
        } else if (block.chainid == BASE_MAINNET_CHAIN_ID) {
            activeConfig = getBaseMainnetConfig();
        } else {
            activeConfig = getAnvilConfig();
        }
    }
    
    function getBaseSepoliaConfig() public view returns (NetworkConfig memory) {
        return NetworkConfig({
            chainId: BASE_SEPOLIA_CHAIN_ID,
            rpcUrl: vm.envString("BASE_SEPOLIA_RPC_URL"),
            deployer: vm.envAddress("DEPLOYER_ADDRESS")
        });
    }
    
    function getBaseMainnetConfig() public view returns (NetworkConfig memory) {
        return NetworkConfig({
            chainId: BASE_MAINNET_CHAIN_ID,
            rpcUrl: vm.envString("BASE_MAINNET_RPC_URL"),
            deployer: vm.envAddress("DEPLOYER_ADDRESS")
        });
    }
    
    function getAnvilConfig() public pure returns (NetworkConfig memory) {
        return NetworkConfig({
            chainId: 31337,
            rpcUrl: "http://localhost:8545",
            deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 // Anvil default
        });
    }
}
