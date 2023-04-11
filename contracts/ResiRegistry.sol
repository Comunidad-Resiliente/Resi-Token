// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./interfaces/IResiRegistry.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract ResiRegistry is IResiRegistry, OwnableUpgradeable {
    address public RESI_TOKEN;
    uint256 public activeSerieId;
    mapping(uint256 => Serie) public series;
    mapping(bytes32 => Project) public projects;

    function initialize(address _resiToken) public initializer {
        require(_resiToken != address(0), "INVALID TOKEN ADDRESS");
        __Context_init_unchained();
        __Ownable_init_unchained();
        RESI_TOKEN = _resiToken;
        emit RegistryInitialized(RESI_TOKEN);
    }

    function createSerie(
        uint256 _id,
        uint256 _startDate,
        uint256 _endDate,
        uint256 _numberOfProjects
    ) external onlyOwner {
        _checkSerie(_id, _startDate, _endDate, _numberOfProjects);
        Serie memory newSerie = Serie({
            id: _id,
            startDate: _startDate,
            endDate: _endDate,
            numberOfProjects: _numberOfProjects,
            currentProjects: 0,
            currentSupply: 0,
            active: false,
            created: true
        });
        series[_id] = newSerie;
        emit SerieCreated(_id, _startDate, _endDate, _numberOfProjects);
    }

    function _checkSerie(
        uint256 _id,
        uint256 _startDate,
        uint256 _endDate,
        uint256 _numberOfProjects
    ) internal view onlyOwner {
        require(!series[_id].created, "SERIE ALREADY CREATED");
        require(_startDate >= block.timestamp, "INVALID START DATE");
        require(_endDate >= _startDate, "INVALID END DATE");
        require(_numberOfProjects > 0, "PROJECTS MUST BE MORE THAN ZERO");
    }

    function setActiveSerie(uint256 _id) external onlyOwner {
        require(series[_id].created, "SERIE DOES NOT EXIST");
        uint256 oldActiveSerie = activeSerieId;
        series[activeSerieId].active = false;
        activeSerieId = _id;
        series[activeSerieId].active = true;
        emit ActiveSerieUpdated(oldActiveSerie, activeSerieId);
    }

    function addProject(bytes32 _name) external onlyOwner {
        _addProject(_name);
    }

    function addProjects(bytes32[] memory names) external onlyOwner {
        for (uint256 i = 0; i < names.length; i++) {
            _addProject(names[i]);
        }
    }

    function _addProject(bytes32 _name) internal onlyOwner {
        require(_name != bytes32(0), "INVALID NAME");
        require(
            series[activeSerieId].currentProjects < series[activeSerieId].numberOfProjects,
            "MAX PROJECTS SERIES REACHED"
        );
        series[activeSerieId].currentProjects++;
        Project memory newProject = Project({serie: activeSerieId, active: true});
        projects[_name] = newProject;
        emit ProjectAdded(_name, activeSerieId);
    }

    function disableProject(bytes32 _name) external onlyOwner {
        projects[_name].active = false;
        emit ProjectDisabled(_name);
    }

    function increaseSerieSupply(uint256 _serieId, uint256 _amount) external onlyRESIToken {
        require(series[_serieId].created, "INVALID SERIE");
        require(_amount > 0, "INVALID AMOUNT");
        uint256 oldSupply = series[_serieId].currentSupply;
        series[_serieId].currentSupply += _amount;
        emit SerieSupplyUpdated(oldSupply, series[_serieId].currentSupply);
    }

    modifier onlyRESIToken() {
        require(_msgSender() == RESI_TOKEN, "ONLY RESI TOKEN");
        _;
    }

    // Leave a gap betweeen inherited contracts variables in order
    // to be able to add more variables in them later.
    uint256[20] private upgradeGap;
}
