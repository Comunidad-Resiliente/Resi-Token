// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IResiSBT {
    event ResiSBTInitialized(
        string _name,
        string _symbol,
        uint256 _serieId,
        address indexed _registry,
        address indexed _resiToken
    );

    function mintByResiToken(address _to, bytes32 _role) external;

    function isSBTReceiver(address _account, bytes32 _role, uint256 _serieId) external view returns (bool);
    function increaseResiTokenBalance(address _to, uint256 _amount) external;

    function decreaseResiTokenBalance(address _to, uint256 _amount) external;

    event RegistrySet(address indexed _registry);
    event ContractURIUpdated(string contractUri);
    event MintSBT(address indexed _to, bytes32 _role, uint256 _tokenId);
    event DefaultRoleUriUpdated(string oldUri, string newUri);
    event SBTMintedByResiToken(address indexed _to, bytes32 _role, uint256 _tokenId);
    event IncreaseResiBalance(address indexed to, uint256 amount);
    event DecreaseResiBalance(address indexed to, uint256 amount);
    event NicknameUpdated(address indexed user, bytes32 nickname);

    error TransferForbidden(string message);
}
