// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IResiVault {
    function getMainToken() external view returns (address);

    function release(uint256 _amount) external;

    event Initialized(uint256 _serieId, address indexed _token, address indexed _resiToken);
    event TokenAdded(bytes32 _name, address indexed _token);
    event TokenRemoved(bytes32 _name, address indexed _token);
    event EtherReceived(address indexed _from, uint256 _value);
    event TokenReleased(address indexed TOKEN, uint256 _amount);
}
