// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IResiSBT {
    event Initialized(string _name, string _symbol, uint256 _serieId);
    event RegistrySet(address indexed _registry);
    event ContractURIUpdated(string contractUri);

    error TransferForbidden(string message);
}
