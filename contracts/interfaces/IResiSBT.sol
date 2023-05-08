// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IResiSBT {
    event Initialized(
        string _name,
        string _symbol,
        uint256 _serieId,
        address indexed _registry,
        address indexed _resiToken
    );
    event RegistrySet(address indexed _registry);
    event ContractURIUpdated(string contractUri);
    event MintSBT(address indexed _to, bytes32 _role, uint256 _tokenId);

    error TransferForbidden(string message);
}
