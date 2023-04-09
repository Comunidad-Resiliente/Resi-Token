// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IResiRegistry {
    struct Serie {
        uint256 id;
        uint256 startDate;
        uint256 endDate;
        uint256 numberOfProjects;
        uint256 maxSupply;
        bool active;
    }

    struct Project {
        uint256 serie;
        bytes32 title;
    }

    event RegistryInitialized();
    event SerieUpdated();
}
