// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IResiToken {
    function addMentor(address _mentor, uint256 _serieId, bytes32 _project) external;

    function addProjectBuilder(address _builder, uint256 _serieId, bytes32 _project) external;

    function addResiBuilder(address _builder) external;

    function removeUserRole(bytes32 _role, address _user) external;

    function getRoleCount() external view returns (uint256);

    function isSBTReceiver(address _account, bytes32 _role, uint256 _serieId) external view returns (bool);

    event TokenInitialized(address indexed treasury, address indexed registry);
    event MentorAdded(address indexed mentor, bytes32 project);
    event ProjectBuilderAdded(address indexed projectBuilder);
    event ResiBuilderAdded(address indexed resiBuilder);
    event ResiRoleRemoved(bytes32 _role, address indexed _user);
    event ResiMinted(address indexed account, uint256 amount);
    event Exit(address indexed account, uint256 _amount, uint256 _serieId);

    error InvalidAddress(address);
    error TransferForbidden(string message);
    error TransferFromForbidden(string message);
}
