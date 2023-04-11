// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IResiRegistry {
    struct Serie {
        uint256 id;
        uint256 startDate;
        uint256 endDate;
        uint256 currentProjects;
        uint256 numberOfProjects;
        uint256 currentSupply;
        bool active;
        bool created;
    }

    struct Project {
        uint256 serie;
        bool active;
    }

    function projects(bytes32) external view returns (uint256 serie, bool active);

    event RegistryInitialized(address indexed RESI_TOKEN);

    event SerieCreated(uint256 _id, uint256 _startDate, uint256 _endDate, uint256 _numberOfProjects);
    event ActiveSerieUpdated(uint256 oldSerieId, uint256 newSerieId);
    event SerieSupplyUpdated(uint256 oldSupply, uint256 newSupply);

    event ProjectAdded(bytes32 _name, uint256 serieId);
    event ProjectDisabled(bytes32 _name);
}
