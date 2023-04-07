// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IResiRegistry {
    struct Project {
        bytes32 title;
        uint256 serie;
    }

    event ProjectAdded();
}
