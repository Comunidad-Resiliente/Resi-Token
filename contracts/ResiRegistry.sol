// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./interfaces/IResiRegistry.sol";
import "./interfaces/IResiVault.sol";

import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title Resi Registry Contract
/// @author Alejo Lovallo
/// @notice Registry holding information of series and projects
contract ResiRegistry is IResiRegistry, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    /// @dev Resi token address
    address public RESI_TOKEN;

    /// @dev Global Treasury vault address handled by admin protocol
    address private TREASURY_VAULT;

    /// @dev current serie running
    uint256 private activeSerieId;

    /// @dev serieId => Serie info
    mapping(uint256 => Serie) public series;
    /// @dev serieId => SBT
    mapping(uint256 => address) public seriesSBTs;
    /// @dev project name => Project info
    mapping(bytes32 => Project) public projects;

    using SafeERC20 for IERC20;

    function initialize() public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __ReentrancyGuard_init_unchained();
        emit RegistryInitialized();
    }

    /**************************** GETTERS  ****************************/

    /**
     * @dev Get current active serie
     * @return id
     */
    function activeSerie() external view returns (uint256 id) {
        id = activeSerieId;
    }

    /**
     * @dev Know if a project is valid from a specific serie
     * @param _serie serie id
     * @param _project project name
     * @return if valid
     */
    function isValidProject(uint256 _serie, bytes32 _project) external view returns (bool) {
        Project storage proj = projects[_project];
        uint256 _activeSerieId = activeSerieId;
        return (_serie == _activeSerieId && proj.serie == _activeSerieId && proj.active);
    }

    /**
     * @dev Know if a project in an active serie is valid
     * @param _project project name
     * @return if valid
     */
    function isValidProject(bytes32 _project) external view returns (bool) {
        Project storage proj = projects[_project];
        return (proj.serie == activeSerieId && proj.active);
    }

    /**
     * @dev Get active serie sbt token
     * @return sbt address
     */
    function getActiveSBTSerie() external view returns (address) {
        return seriesSBTs[activeSerieId];
    }

    /**
     * @dev Get serie SBT token for a specific serie
     * @param _serieId serie id to get sbt
     * @return sbt address
     */
    function getSBTSerie(uint256 _serieId) external view returns (address) {
        return seriesSBTs[_serieId];
    }

    /**
     * @dev Get serie active state and current supply emitted
     * @param _serieId serie id to get state
     * @return isActive wether serie is active
     * @return currentSupply currenty serie supply emitted
     */
    function getSerieState(uint256 _serieId) external view returns (bool isActive, uint256 currentSupply) {
        isActive = series[_serieId].active;
        currentSupply = series[_serieId].currentSupply;
    }

    /**
     * @dev Get current serie supply minted
     * @param _serieId serie id to get current supply
     * @return supply minted
     */
    function getSerieSupply(uint256 _serieId) external view returns (uint256) {
        return series[_serieId].currentSupply;
    }

    /**
     * @dev Get Treasury vault address
     * @return treasury addresss
     */
    function getTreasuryVault() external view returns (address) {
        return TREASURY_VAULT;
    }

    /**************************** INTERFACE  ****************************/

    /**
     * @dev Set Resi token for Registry
     * @param _resiToken address of the token
     */
    function setResiToken(address _resiToken) external onlyOwner {
        require(_resiToken != address(0), "ResiRegistry: INVALID TOKEN ADDRESS");
        RESI_TOKEN = _resiToken;
        emit ResiTokenSet(_resiToken);
    }

    /**
     * @dev Set Treasury Vault for Registry
     * @param _treasuryVault treasury vault address
     */
    function setTreasuryVault(address _treasuryVault) external onlyOwner {
        require(_treasuryVault != address(0), "ResiRegistry: INVALID VAULT ADDRESS");
        TREASURY_VAULT = _treasuryVault;
        emit TreasuryVaultSet(_treasuryVault);
    }

    /**
     * @dev Create New Serie. Cannot be created if another serie is running
     * @param _startDate timestamp when serie starts
     * @param _endDate timestamp when serie ends
     * @param _numberOfProjects amount of projects
     * @param _maxSupply max supply to mint during serie
     * @param _vault address of the serie vault
     */
    function createSerie(
        uint40 _startDate,
        uint40 _endDate,
        uint128 _numberOfProjects,
        uint256 _maxSupply,
        address _vault
    ) external onlyOwner {
        _checkSerie(_startDate, _endDate, _numberOfProjects, _maxSupply, _vault);
        activeSerieId += 1;
        Serie memory newSerie = Serie({
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

    /**
     * @dev Add project to current serie
     * @param _name name of the project
     */
    function addProject(bytes32 _name) external onlyOwner {
        _addProject(_name);
    }

    /**
     * @dev Add projects to current serie
     * @param names projects names
     */
    function addProjects(bytes32[] calldata names) external onlyOwner {
        for (uint256 i = 0; i < names.length; i++) {
            _addProject(names[i]);
        }
    }

    /**
     * @dev Disable project (no matter if serie not active)
     * @param _name project name
     */
    function disableProject(bytes32 _name) external onlyOwner {
        projects[_name].active = false;
        emit ProjectDisabled(_name);
    }

    /**
     * @dev Set SBT for current serie
     * @param _sbt address of the SBT token
     */
    function registerSerieSBT(address _sbt) external onlyOwner {
        require(series[activeSerieId].active, "ResiRegistry: SERIE NOT ACTIVE");
        require(_sbt != address(0), "ResiRegistry: INVALID SBT ADDRESS");
        seriesSBTs[activeSerieId] = _sbt;
        emit SerieSBTSet(activeSerieId, _sbt);
    }

    /**
     * @dev Increase serie supply. Only performed by ResiToken
     * @param _serieId serie id
     * @param _amount amount to increase
     */
    function increaseSerieSupply(uint256 _serieId, uint256 _amount) external onlyRESIToken nonReentrant {
        _increaseSerieSupply(_serieId, _amount);
    }

    /**
     *
     * @dev Decrease serie supply. Only performed by ResiToken
     * @param _serieId serie id
     * @param _amount amount to decrease
     */
    function decreaseSerieSupply(uint256 _serieId, uint256 _amount) external onlyRESIToken nonReentrant {
        _decreaseSerieSupply(_serieId, _amount);
    }

    /**
     * @dev Close serie. This will mean all kind of operations to a serie could not be done anymore.
     */
    function closeSerie() external onlyOwner {
        require(series[activeSerieId].created, "ResiRegistry: SERIE NOT CREATED YET");
        require(block.timestamp >= series[activeSerieId].endDate, "ResiRegistry: SERIE STILL ACTIVE");
        series[activeSerieId].active = false;
        emit SerieClosed(activeSerieId);
    }

    /**
     * @dev
     * @param _serieId serie id
     * @param _amount amount to withdrawn from vault
     * @param _to address who will receive the assets
     */
    function withdrawFromVault(uint256 _serieId, uint256 _amount, address _to) external onlyRESIToken nonReentrant {
        _withdrawFromVault(_serieId, _amount, _to);
    }

    /**************************** INTERNALS  ****************************/

    /**
     * @dev performs security check before adding a new serie
     * @param _startDate timestamp serie will start
     * @param _endDate tiemstamp serie will end
     * @param _numberOfProjects number of projects allowed to be in the serie
     * @param _maxSupply max supply to emit through serie
     * @param _vault vault address
     */
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
        // TODO: review here require(isContract(_vault), "VAULT MUST BE CONTRACT");
    }

    /**
     * @dev internal function for addProject
     * @param _name project name
     */
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

    /**
     * @dev private function for increaseSerieSupply
     * @param _serieId serie id
     * @param _amount amount to increase
     */
    function _increaseSerieSupply(uint256 _serieId, uint256 _amount) private {
        require(series[_serieId].created, "ResiRegistry: INVALID SERIE");
        require(series[_serieId].active, "ResiRegistry: SERIE INACTIVE");
        require(_amount > 0, "ResiRegistry: INVALID AMOUNT");
        require(
            series[_serieId].currentSupply + _amount <= series[_serieId].maxSupply,
            "ResiRegistry: Amount will exceed serie max supply"
        );
        uint256 oldSupply = series[_serieId].currentSupply;
        series[_serieId].currentSupply += _amount;
        emit SerieSupplyUpdated(oldSupply, series[_serieId].currentSupply);
    }

    /**
     * @dev private function for decreaseSerieSupply
     * @param _serieId serie id
     * @param _amount amount to decrease
     */
    function _decreaseSerieSupply(uint256 _serieId, uint256 _amount) private {
        require(series[_serieId].created, "ResiRegistry: INVALID SERIE");
        uint256 oldSupply = series[_serieId].currentSupply;
        series[_serieId].currentSupply -= _amount;
        emit SerieSupplyUpdated(oldSupply, series[_serieId].currentSupply);
    }

    /**
     * @dev internal function to withdraw from vault
     * @param _serieId serie id
     * @param _amount amount to withdrawn from vault
     * @param _to address who will receive the assets
     */
    function _withdrawFromVault(uint256 _serieId, uint256 _amount, address _to) private {
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

    /**
     * @dev Modifier to perform actions only by ResiToken contract
     */
    modifier onlyRESIToken() {
        require(_msgSender() == RESI_TOKEN, "ResiRegistry: ONLY RESI TOKEN");
        _;
    }

    /// @dev Leave a gap betweeen inherited contracts variables in order
    /// @dev to be able to add more variables in them later.
    uint256[20] private upgradeGap;
}
