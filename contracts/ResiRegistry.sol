// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./interfaces/IResiRegistry.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract ResiRegistry is IResiRegistry, Initializable, ContextUpgradeable, OwnableUpgradeable {
    Serie public activeSerie;
    mapping(uint256 => Serie) public series;
    mapping(uint256 => Project) public projects;

    function initialize() public initializer {
        __Context_init();
        __Ownable_init();
        emit RegistryInitialized();
    }

    function updateActiveSerie(uint256 _numberOfProjects, uint256 _endDate, uint256 _maxSupply) external onlyOwner {
        require(_numberOfProjects > 0, "MUST HAVE AT LEAST ONE PROJECT");
        require(_endDate > block.timestamp, "END DATE MUST BE IN THE FUTURE");
        require(_maxSupply > 0, "MAX SUPPLY MUST BE GREATER THAN ZERO");
        activeSerie.id++;
        activeSerie.startDate = block.timestamp;
        activeSerie.numberOfProjects = _numberOfProjects;
        activeSerie.endDate = _endDate;
        activeSerie.maxSupply = _maxSupply;
        emit SerieUpdated();
    }

    function addProject(uint256 _serie, bytes32 _project) external onlyOwner {}

    function addProjects() external onlyOwner {}

    function removeProject() external onlyOwner {}
}
