// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IResiToken {
    function addMentor(address mentor, uint256 serieId, bytes32 project) external;

    function addProjectBuilder(address builder, uint256 serieId, bytes32 project) external;

    function addResiBuilder(address builder) external;

    event TokenInitialized(address indexed treasury, address indexed registry);
    event MentorAdded(address indexed mentor, bytes32 project);
    event ProjectBuilderAdded(address indexed projectBuilder);
    event ResiBuilderAdded(address indexed resiBuilder);
    event ResiMinted(address indexed account, uint256 amount);
    event ResiBurnt(address indexed account, uint256 amount);
    event Exit(address indexed account, uint256 amount, uint256 serieId);

    error InvalidAddress(address);
    error TransferForbidden(string message);
    error TransferFromForbidden(string message);
}
