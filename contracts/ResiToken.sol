// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./interfaces/IResiToken.sol";
import "./interfaces/IResiRegistry.sol";
import "./interfaces/IResiSBT.sol";

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";

import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract ResiToken is
    IResiToken,
    OwnableUpgradeable,
    AccessControlEnumerableUpgradeable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    ERC20PausableUpgradeable
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant MENTOR_ROLE = keccak256("MENTOR_ROLE");
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");
    bytes32 public constant PROJECT_BUILDER_ROLE = keccak256("PROJECT_BUILDER_ROLE");
    bytes32 public constant RESI_BUILDER_ROLE = keccak256("RESI_BUILDER_ROLE");

    address public RESI_REGISTRY;

    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.Bytes32Set;
    EnumerableSetUpgradeable.Bytes32Set private _rolesSet;

    function initialize(address _treasury, address _registry) public initializer {
        require(_treasury != address(0), "INVALID TREASURY ADDRESS");
        require(_registry != address(0), "INVALID REGISTRY ADDRESS");
        __Context_init_unchained();
        __Ownable_init_unchained();
        __AccessControl_init_unchained();
        __ERC20_init_unchained("ResiToken", "RESI");
        __ERC20Burnable_init_unchained();
        __ERC20Pausable_init_unchained();

        // Add roles to the set of Roles for later tracking
        _rolesSet.add(MENTOR_ROLE);
        _rolesSet.add(TREASURY_ROLE);
        _rolesSet.add(PROJECT_BUILDER_ROLE);
        _rolesSet.add(RESI_BUILDER_ROLE);

        _grantRole(MINTER_ROLE, _msgSender());
        _grantRole(TREASURY_ROLE, _treasury);

        // Admin role can add/remove admins in addition to add/remove all other roles
        _setRoleAdmin(MINTER_ROLE, MINTER_ROLE);
        _setRoleAdmin(TREASURY_ROLE, MINTER_ROLE);
        _setRoleAdmin(PROJECT_BUILDER_ROLE, MINTER_ROLE);
        _setRoleAdmin(RESI_BUILDER_ROLE, MINTER_ROLE);

        RESI_REGISTRY = _registry;

        emit Initialized(_treasury, _registry);
    }

    function addMentor(
        address _mentor,
        uint256 _serieId,
        bytes32 _project
    ) external isValidAddress(_mentor, "INVALID MENTOR ADDRESS") onlyOwner whenNotPaused {
        _checkSerieAndProject(_serieId, _project);
        _grantRole(MENTOR_ROLE, _mentor);
        emit MentorAdded(_mentor);
    }

    function removeMentor(
        address _mentor
    ) external isValidAddress(_mentor, "INVALID MENTOR ADDRESS") onlyOwner whenNotPaused {
        _revokeRole(MENTOR_ROLE, _mentor);
        emit MentorRemoved(_mentor);
    }

    function addProjectBuilder(
        address _builder,
        uint256 _serieId,
        bytes32 _project
    ) external isValidAddress(_builder, "INVALID BUILDER ADDRESS") onlyOwner whenNotPaused {
        _checkSerieAndProject(_serieId, _project);
        _grantRole(PROJECT_BUILDER_ROLE, _builder);
        emit ProjectBuilderAdded(_builder);
    }

    function removeProjectBuilder(
        address _builder
    ) external isValidAddress(_builder, "INVALID BUILDER ADDRESS") onlyOwner whenNotPaused {
        _revokeRole(PROJECT_BUILDER_ROLE, _builder);
        emit ProjectBuilderRemoved(_builder);
    }

    function addResiBuilder(
        address _builder
    ) external isValidAddress(_builder, "INVALID BUILDER ADDRESS") onlyOwner whenNotPaused {
        _grantRole(RESI_BUILDER_ROLE, _builder);
        emit ResiBuilderAdded(_builder);
    }

    function removeResiBuilder(
        address _builder
    ) external isValidAddress(_builder, "INVALID BUILDER ADDRESS") onlyOwner {
        _revokeRole(RESI_BUILDER_ROLE, _builder);
        emit ResiBuilderRemoved(_builder);
    }

    function getRoleCount() external view returns (uint256) {
        return _rolesSet.length();
    }

    function getRoleByIndex(uint index) external view returns (bytes32) {
        return _rolesSet.at(index);
    }

    function _addRolesBatch(bytes32 role, address[] memory _addresses) internal onlyOwner whenNotPaused {
        require(role == MENTOR_ROLE || role == PROJECT_BUILDER_ROLE || role == RESI_BUILDER_ROLE, "INVALID ROLE");
        for (uint8 i = 0; i < _addresses.length; i++) {
            if (_addresses[i] == address(0)) {
                revert InvalidAddress(_addresses[i]);
            }
            _grantRole(role, _addresses[i]);
        }
    }

    function _checkSerieAndProject(uint256 _serieId, bytes32 _project) internal view onlyOwner {
        require(
            IResiRegistry(RESI_REGISTRY).isValidProject(_serieId, _project),
            "INVALID OR INACTIVE SERIE, PROJECT NOT EXIST OR NOT ACTIVE"
        );
    }

    function isSBTReceiver(address _account, bytes32 _role, uint256 _serieId) external view returns (bool) {
        if (hasRole(_role, _account) && IResiRegistry(RESI_REGISTRY).activeSerie() == _serieId) {
            return true;
        }
        return false;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20Upgradeable, ERC20PausableUpgradeable) {
        super._beforeTokenTransfer(from, to, amount);
    }

    function transfer(address, uint256) public pure override(ERC20Upgradeable) returns (bool) {
        revert TransferForbidden("NO TRANSFER ALLOWED");
    }

    function transferFrom(address, address, uint256) public pure override(ERC20Upgradeable) returns (bool) {
        revert TransferFromForbidden("NO TRANSFER FROM ALLOWED");
    }

    function award(
        address _account,
        bytes32 _role,
        uint256 _amount
    ) external isValidAddress(_account, "INVALID RECEIVER ADDR") onlyRole(MINTER_ROLE) {
        require(hasRole(_role, _account), "ACCOUNT HAS NOT VALID ROLE");
        address SERIE_SBT = IResiRegistry(RESI_REGISTRY).getSBTSerie();
        if (IERC721Upgradeable(SERIE_SBT).balanceOf(_account) == 0) {
            IResiSBT(SERIE_SBT).mintByRegistry(_account, _role);
        }
        _mint(_account, _amount);
        uint256 activeSerie = IResiRegistry(RESI_REGISTRY).activeSerie();
        IResiRegistry(RESI_REGISTRY).increaseSerieSupply(activeSerie, _amount);
        emit ResiMinted(_account, _amount);
    }

    function exit(
        uint256 _serieId,
        bytes32 _project,
        bytes32 _role,
        address _to
    ) external isValidAddress(_to, "INVALID EQUITY RECEIVER") {
        require(hasRole(_role, _msgSender()), "ACCOUNT HAS NOT VALID ROLE");
    }

    /** 
    function burnTreasuryEquity(uint256 _serieId, bytes32 _project) external onlyRole(TREASURY_ROLE) {}
    **/

    modifier isValidAddress(address _addr, string memory message) {
        require(_addr != address(0), message);
        _;
    }

    // Leave a gap betweeen inherited contracts variables in order
    // to be able to add more variables in them later.
    uint256[20] private upgradeGap;
}
