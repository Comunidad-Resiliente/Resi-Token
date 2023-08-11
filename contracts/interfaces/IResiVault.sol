// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IResiVault {
    function getMainToken() external view returns (address);

    function release(uint256 amount) external;

    event ResiVaultInitialized(uint256 serieId, address indexed token, address indexed resiToken);
    event MainTokenUpdated(address indexed oldToken, address indexed TOKEN);
    event TokenAdded(bytes32 name, address indexed token);
    event TokenRemoved(bytes32 name, address indexed token);
    event EtherReceived(address indexed from, uint256 value);
    event TokenReleased(address indexed TOKEN, uint256 amount);
}
