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

    function createSerie(uint256 _startDate, uint256 _endDate, uint256 _numberOfProjects) external;

    function addProject(bytes32 _name) external;

    function addProjects(bytes32[] memory names) external;

    function disableProject(bytes32 _name) external;

    function increaseSerieSupply(uint256 _serieId, uint256 _amount) external;

    function decreaseSerieSupply(uint256 _serieId, uint256 _amount) external;

    function closeSerie() external;

    function activeSerie() external view returns (uint256 id);

    function isValidProject(uint256 _serie, bytes32 _project) external view returns (bool);

    function isValidProject(bytes32 _project) external view returns (bool);

    event RegistryInitialized();

    event ResiTokenSet(address indexed _resiToken);

    event SerieCreated(uint256 _id, uint256 _startDate, uint256 _endDate, uint256 _numberOfProjects);

    event SerieSupplyUpdated(uint256 oldSupply, uint256 newSupply);

    event SerieClosed(uint256 _id);

    event ProjectAdded(bytes32 _name, uint256 serieId);

    event ProjectDisabled(bytes32 _name);
}
