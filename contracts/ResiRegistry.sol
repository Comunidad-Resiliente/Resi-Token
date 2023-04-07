// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract ResiRegistry is Initializable, ContextUpgradeable, OwnableUpgradeable {
    mapping(uint256 => bytes32) public projects;

    function initialize() public initializer {}

    function addProject(bytes32 _project) external {}
}
