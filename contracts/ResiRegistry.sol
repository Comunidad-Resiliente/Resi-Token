// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./interfaces/IResiRegistry.sol";
import "./interfaces/IResiVault.sol";

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ResiRegistry is IResiRegistry, OwnableUpgradeable {
    address public RESI_TOKEN;
    address public TREASURY_VAULT;
    uint256 private activeSerieId;
    mapping(uint256 => Serie) public series;
    mapping(uint256 => address) public seriesSBTs;
    mapping(bytes32 => Project) public projects;

    using SafeERC20 for IERC20;

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

    function getSBTSerie() external view returns (address) {
        return seriesSBTs[activeSerieId];
    }

    function getSBTSerie(uint256 _serieId) external view returns (address) {
        return seriesSBTs[_serieId];
    }

    function getSerieState(uint256 _serieId) external view returns (bool, uint256) {
        bool isActive = series[_serieId].active;
        uint256 currentSupply = series[_serieId].currentSupply;
        return (isActive, currentSupply);
    }

    function getSerieSupply(uint256 _serieId) external view returns (uint256) {
        return series[_serieId].currentSupply;
    }

    /**************************** INTERFACE  ****************************/

    function setResiToken(address _resiToken) external onlyOwner {
        require(_resiToken != address(0), "RESIRegistry: INVALID TOKEN ADDRESS");
        RESI_TOKEN = _resiToken;
        emit ResiTokenSet(_resiToken);
    }

    function setTreasuryVault(address _treasuryVault) external onlyOwner {
        require(_treasuryVault != address(0), "RESIRegistry: INVALID VAULT ADDRESS");
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
        _checkSerie(_startDate, _endDate, _numberOfProjects, _maxSupply, _vault);
        activeSerieId += 1;
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

    function addProject(bytes32 _name) external onlyOwner {
        _addProject(_name);
    }

    function addProjects(bytes32[] memory names) external onlyOwner {
        for (uint256 i = 0; i < names.length; i++) {
            _addProject(names[i]);
        }
    }

    function disableProject(bytes32 _name) external onlyOwner {
        projects[_name].active = false;
        emit ProjectDisabled(_name);
    }

    function registerSerieSBT(address _sbt) external onlyOwner {
        require(series[activeSerieId].active, "RESIRegisty: SERIE NOT ACTIVE");
        require(_sbt != address(0), "RESIRegistry: INVALID SBT ADDRESS");
        seriesSBTs[activeSerieId] = _sbt;
        emit SerieSBTSet(activeSerieId, _sbt);
    }

    function increaseSerieSupply(uint256 _serieId, uint256 _amount) external onlyRESIToken {
        require(series[_serieId].created, "RESIRegistry: INVALID SERIE");
        require(series[_serieId].active, "RESIRegistry: SERIE INACTIVE");
        require(_amount > 0, "RESIRegistry: INVALID AMOUNT");
        require(
            series[_serieId].currentSupply + _amount <= series[_serieId].maxSupply,
            "RESIRegistry: Amount will exceed serie max supply"
        );
        uint256 oldSupply = series[_serieId].currentSupply;
        series[_serieId].currentSupply += _amount;
        emit SerieSupplyUpdated(oldSupply, series[_serieId].currentSupply);
    }

    function decreaseSerieSupply(uint256 _serieId, uint256 _amount) external onlyRESIToken {
        require(series[_serieId].created, "RESIRegistry: INVALID SERIE");
        require(_amount > 0, "RESIRegistry: INVALID AMOUNT");
        uint256 oldSupply = series[_serieId].currentSupply;
        series[_serieId].currentSupply -= _amount;
        emit SerieSupplyUpdated(oldSupply, series[_serieId].currentSupply);
    }

    function closeSerie() external onlyOwner {
        require(series[activeSerieId].created, "ResiRegistry: SERIE NOT CREATED YET");
        require(block.timestamp >= series[activeSerieId].endDate, "ResiRegistry: SERIE STILL ACTIVE");
        series[activeSerieId].active = false;
        emit SerieClosed(activeSerieId);
    }

    function withdrawFromVault(uint256 _serieId, uint256 _amount, address _to) external onlyRESIToken {
        require(!series[_serieId].active, "ResiRegistry: SERIE STILL ACTIVE");
        require(_amount > 0, "ResiRegistry: INVALID AMOUNT");
        require(_to != address(0), "ResiRegistry: INVALID RECEIVER");
        require(series[_serieId].currentSupply > 0, "ResiRegistry: NO MORE SUPPLY TO WITHDRAW");
        require(series[_serieId].currentSupply - _amount > 0, "ResiRegistry: INVALID WITHDRAW AMOUNT");

        address vaultToken = IResiVault(series[_serieId].vault).getMainToken();

        uint256 beforeBalance = IERC20(vaultToken).balanceOf(address(this));
        IResiVault(series[_serieId].vault).release(_amount);
        uint256 afterBalance = IERC20(vaultToken).balanceOf(address(this));

        require(afterBalance > beforeBalance, "ResiRegistry: SOMETHING WENT WRONG WITHDRAWING FROM VAULT");

        IERC20(vaultToken).safeTransfer(_to, afterBalance);

        emit WithdrawFromVault(_serieId, _amount, _to);
    }

    /**************************** INTERNALS  ****************************/

    function _checkSerie(
        uint256 _startDate,
        uint256 _endDate,
        uint256 _numberOfProjects,
        uint256 _maxSupply,
        address _vault
    ) internal view onlyOwner {
        require(!(series[activeSerieId].active), "ResiRegistry: CURRENT SERIE IS NOT CLOSED YET");
        require(_startDate >= block.timestamp, "ResiRegistry: INVALID START DATE");
        require(_endDate >= _startDate, "ResiRegistry: INVALID END DATE");
        require(_numberOfProjects > 0, "ResiRegistry: PROJECTS MUST BE MORE THAN ZERO");
        require(_maxSupply > 0, "ResiRegistry: MAX SUPPLY TO EMIT MSUT BE GREATER THAN ZERO");
        require(_vault != address(0), "ResiRegistry: INVALID VAULT CONTRACT");
        // TODO: see why is not working require(isContract(_vault), "VAULT MUST BE CONTRACT");
    }

    function _addProject(bytes32 _name) internal onlyOwner {
        require(series[activeSerieId].created, "ResiRegistry: SERIE INACTIVE");
        require(_name != bytes32(0), "ResiRegistry: INVALID NAME");
        require(
            series[activeSerieId].currentProjects < series[activeSerieId].numberOfProjects,
            "ResiRegistry: MAX PROJECTS SERIES REACHED"
        );
        series[activeSerieId].currentProjects++;
        Project memory newProject = Project({serie: activeSerieId, active: true});
        projects[_name] = newProject;
        emit ProjectAdded(_name, activeSerieId);
    }

    modifier onlyRESIToken() {
        require(_msgSender() == RESI_TOKEN, "ResiRegistry: ONLY RESI TOKEN");
        _;
    }

    // Leave a gap betweeen inherited contracts variables in order
    // to be able to add more variables in them later.
    uint256[20] private upgradeGap;
}
