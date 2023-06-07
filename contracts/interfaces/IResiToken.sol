// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IResiToken {
    function addMentor(address _mentor, uint256 _serieId, bytes32 _project) external;

    function removeMentor(address _mentor) external;

    function addProjectBuilder(address _builder, uint256 _serieId, bytes32 _project) external;

    function removeProjectBuilder(address _builder) external;

    function addResiBuilder(address _builder) external;

    function removeResiBuilder(address _builder) external;

    function getRoleCount() external view returns (uint256);

    function getRoleByIndex(uint index) external view returns (bytes32);

    function isSBTReceiver(address _account, bytes32 _role, uint256 _serieId) external view returns (bool);

    event TokenInitialized(address indexed treasury, address indexed registry);
    event MentorAdded(address indexed mentor, bytes32 project);
    event ProjectBuilderAdded(address indexed projectBuilder);
    event ResiBuilderAdded(address indexed resiBuilder);
    event MentorRemoved(address indexed mentor);
    event ProjectBuilderRemoved(address indexed projectBuilder);
    event ResiBuilderRemoved(address indexed resiBuilder);
    event ResiMinted(address indexed account, uint256 amount);
    event Exit(address indexed account, uint256 _amount, uint256 _serieId);

    error InvalidAddress(address);
    error TransferForbidden(string message);
    error TransferFromForbidden(string message);
}
