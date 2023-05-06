// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./interfaces/IResiRegistry.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract ResiRegistry is IResiRegistry, OwnableUpgradeable {
    address public RESI_TOKEN;
    address public TREASURY_VAULT;
    uint256 private activeSerieId;
    mapping(uint256 => Serie) public series;
    mapping(uint256 => address) public seriesSBTs;
    mapping(bytes32 => Project) public projects;

    function initialize() public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        emit RegistryInitialized();
    }

    /**************************** GETTERS  ****************************/

    function activeSerie() external view returns (uint256 id) {
        id = activeSerieId;
    }

    function isValidProject(uint256 _serie, bytes32 _project) external view returns (bool) {
        if (_serie == activeSerieId && projects[_project].serie == activeSerieId && projects[_project].active) {
            return true;
        }
        return false;
    }

    function isValidProject(bytes32 _project) external view returns (bool) {
        Project memory proj = projects[_project];
        if (proj.serie == activeSerieId && proj.active == true) {
            return true;
        }
        return false;
    }

    /**************************** INTERFACE  ****************************/

    function setResiToken(address _resiToken) external onlyOwner {
        require(_resiToken != address(0), "INVALID TOKEN ADDRESS");
        RESI_TOKEN = _resiToken;
        emit ResiTokenSet(_resiToken);
    }

    function setTreasuryVault(address _treasuryVault) external onlyOwner {
        require(_treasuryVault != address(0), "INVALID VAULT ADDRESS");
        TREASURY_VAULT = _treasuryVault;
        emit TreasuryVaultSet(_treasuryVault);
    }

    function createSerie(
        uint256 _startDate,
        uint256 _endDate,
        uint256 _numberOfProjects,
        uint256 _maxSupply,
        address _vault
    ) external onlyOwner {
        activeSerieId += 1;
        _checkSerie(_startDate, _endDate, _numberOfProjects, _maxSupply, _vault);
        Serie memory newSerie = Serie({
            id: activeSerieId,
            startDate: _startDate,
            endDate: _endDate,
            numberOfProjects: _numberOfProjects,
            currentProjects: 0,
            currentSupply: 0,
            maxSupply: _maxSupply,
            vault: _vault,
            active: true,
            created: true
        });
        series[activeSerieId] = newSerie;
        emit SerieCreated(activeSerieId, _startDate, _endDate, _numberOfProjects, _maxSupply, _vault);
    }

    function _checkSerie(
        uint256 _startDate,
        uint256 _endDate,
        uint256 _numberOfProjects,
        uint256 _maxSupply,
        address _vault
    ) internal view onlyOwner {
        require(!series[activeSerieId].active, "CURRENT SERIE IS NOT CLOSED YED");
        require(_startDate >= block.timestamp, "INVALID START DATE");
        require(_endDate >= _startDate, "INVALID END DATE");
        require(_numberOfProjects > 0, "PROJECTS MUST BE MORE THAN ZERO");
        require(_maxSupply > 0, "MAX SUPPLY TO EMIT MSUT BE GREATER THAN ZERO");
        require(_vault != address(0), "INVALID VAULT CONTRACT");
        // TODO: see why is not working require(isContract(_vault), "VAULT MUST BE CONTRACT");
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

    function registerSerieSBT(address _sbt) external onlyOwner {
        require(_sbt != address(0), "INVALID SBT ADDRESS");
        seriesSBTs[activeSerieId] = _sbt;
        emit SerieSBTSet(activeSerieId, _sbt);
    }

    function increaseSerieSupply(uint256 _serieId, uint256 _amount) external onlyRESIToken {
        require(series[_serieId].created, "INVALID SERIE");
        require(_amount > 0, "INVALID AMOUNT");
        uint256 oldSupply = series[_serieId].currentSupply;
        series[_serieId].currentSupply += _amount;
        emit SerieSupplyUpdated(oldSupply, series[_serieId].currentSupply);
    }

    function decreaseSerieSupply(uint256 _serieId, uint256 _amount) external onlyRESIToken {
        require(series[_serieId].created, "INVALID SERIE");
        require(_amount > 0, "INVALID AMOUNT");
        uint256 oldSupply = series[_serieId].currentSupply;
        series[_serieId].currentSupply -= _amount;
        emit SerieSupplyUpdated(oldSupply, series[_serieId].currentSupply);
    }

    function closeSerie() external onlyOwner {
        require(series[activeSerieId].created, "SERIE NOT CREATED YET");
        series[activeSerieId].active = false;
        emit SerieClosed(activeSerieId);
    }

    modifier onlyRESIToken() {
        require(_msgSender() == RESI_TOKEN, "ONLY RESI TOKEN");
        _;
    }

    // Leave a gap betweeen inherited contracts variables in order
    // to be able to add more variables in them later.
    uint256[20] private upgradeGap;
}
