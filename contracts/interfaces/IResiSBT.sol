// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IResiSBT {
    event ResiSBTInitialized(
        string name,
        string symbol,
        uint256 serieId,
        address indexed registry,
        address indexed resiToken
    );

    function mintByResiToken(address to, bytes32 role) external;

    function isSBTReceiver(address account, bytes32 role, uint256 serieId) external view returns (bool);

    function increaseResiTokenBalance(address to, uint256 amount) external;

    function decreaseResiTokenBalance(address to, uint256 amount) external;

    event RegistrySet(address indexed registry);
    event ContractURIUpdated(string contractUri);
    event MintSBT(address indexed to, bytes32 role, uint256 tokenId);
    event DefaultRoleUriUpdated(string oldUri, string newUri);
    event SBTMintedByResiToken(address indexed to, bytes32 role, uint256 tokenId);
    event IncreaseResiBalance(address indexed to, uint256 amount);
    event DecreaseResiBalance(address indexed to, uint256 amount);
    event NicknameUpdated(address indexed user, bytes32 nickname);

    error TransferForbidden(string message);
}
