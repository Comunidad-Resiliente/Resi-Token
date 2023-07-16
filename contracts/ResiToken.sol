// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./interfaces/IResiToken.sol";
import "./interfaces/IResiRegistry.sol";
import "./interfaces/IResiSBT.sol";

import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Resi Token Contract
/// @author Alejo Lovallo
/// @notice ERC20 Resi Token
contract ResiToken is
    IResiToken,
    AccessControlEnumerableUpgradeable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    ERC20PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    ///@dev ADMIN ROLE
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    ///@dev MENTOR ROLE
    bytes32 public constant MENTOR_ROLE = keccak256("MENTOR_ROLE");
    ///@dev TREASURY ROLE
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");
    ///@dev PROJECT BUILDER ROLE
    bytes32 public constant PROJECT_BUILDER_ROLE = keccak256("PROJECT_BUILDER_ROLE");
    ///@dev RESI BUILDER ROLE
    bytes32 public constant RESI_BUILDER_ROLE = keccak256("RESI_BUILDER_ROLE");

    /// @dev Resi Registry contract
    address public RESI_REGISTRY;

    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.Bytes32Set;
    EnumerableSetUpgradeable.Bytes32Set private _rolesSet;

    function initialize(address _treasury, address _registry) public initializer {
        require(_treasury != address(0), "INVALID TREASURY ADDRESS");
        require(_registry != address(0), "INVALID REGISTRY ADDRESS");
        __Context_init_unchained();
        __AccessControl_init_unchained();
        __ReentrancyGuard_init_unchained();
        __ERC20_init_unchained("ResiToken", "RESI");
        __ERC20Burnable_init_unchained();
        __ERC20Pausable_init_unchained();

        ///@dev Add roles to the set of Roles for later tracking
        _rolesSet.add(MENTOR_ROLE);
        _rolesSet.add(PROJECT_BUILDER_ROLE);
        _rolesSet.add(RESI_BUILDER_ROLE);

        _grantRole(ADMIN_ROLE, _msgSender());
        _grantRole(TREASURY_ROLE, _treasury);

        ///@dev Admin role can add/remove admins in addition to add/remove all other roles
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(TREASURY_ROLE, ADMIN_ROLE);
        _setRoleAdmin(PROJECT_BUILDER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(RESI_BUILDER_ROLE, ADMIN_ROLE);

        RESI_REGISTRY = _registry;

        emit TokenInitialized(_treasury, _registry);
    }

    /**************************** GETTERS  ****************************/

    /**
     * @dev Get amount of roles
     * @return amount of roles
     */
    function getRoleCount() external view returns (uint256) {
        return _rolesSet.length();
    }

    /**************************** INTERFACE  ****************************/

    /**
     * @dev assign MENTOR ROLE to user for specific project
     * @param _mentor user address
     * @param _serieId serie id
     * @param _project project name
     */
    function addMentor(
        address _mentor,
        uint256 _serieId,
        bytes32 _project
    ) external isValidAddress(_mentor, "ResiToken: INVALID MENTOR ADDRESS") onlyRole(ADMIN_ROLE) whenNotPaused {
        _checkSerieAndProject(_serieId, _project);
        _grantRole(MENTOR_ROLE, _mentor);
        emit MentorAdded(_mentor, _project);
    }

    /**
     * @dev assign PROJECT BUILDER role to a user for specific project
     * @param _builder user address
     * @param _serieId serie id
     * @param _project project name
     */
    function addProjectBuilder(
        address _builder,
        uint256 _serieId,
        bytes32 _project
    ) external isValidAddress(_builder, "ResiToken: INVALID BUILDER ADDRESS") onlyRole(ADMIN_ROLE) whenNotPaused {
        _checkSerieAndProject(_serieId, _project);
        _grantRole(PROJECT_BUILDER_ROLE, _builder);
        emit ProjectBuilderAdded(_builder);
    }

    /**
     * @dev assign RESI BUILDER role to user
     * @param _builder user address
     */
    function addResiBuilder(
        address _builder
    ) external isValidAddress(_builder, "ResiToken: INVALID BUILDER ADDRESS") onlyRole(ADMIN_ROLE) whenNotPaused {
        _grantRole(RESI_BUILDER_ROLE, _builder);
        emit ResiBuilderAdded(_builder);
    }

    /**
     *  @dev assign specific role to more than one user
     * @param _role role to assign
     * @param _addresses users array
     */
    function addRolesBatch(bytes32 _role, address[] memory _addresses) external onlyRole(ADMIN_ROLE) whenNotPaused {
        _addRolesBatch(_role, _addresses);
    }

    /**
     *  @dev unassign role for user
     * @param _role role
     * @param _user user address to remove
     */
    function removeUserRole(
        bytes32 _role,
        address _user
    )
        external
        isValidAddress(_user, "ResiToken: INVALID USER ADDRESS")
        validRole(_role)
        onlyRole(ADMIN_ROLE)
        whenNotPaused
    {
        _revokeRole(_role, _user);
        emit ResiRoleRemoved(_role, _user);
    }

    /**
     *  @dev internal function to check state of serie and project
     * @param _serieId serie id
     * @param _project project name
     */
    function _checkSerieAndProject(uint256 _serieId, bytes32 _project) internal view onlyRole(ADMIN_ROLE) {
        require(
            IResiRegistry(RESI_REGISTRY).isValidProject(_serieId, _project),
            "ResiToken: INVALID OR INACTIVE SERIE OR PROJECT"
        );
    }

    /**
     *  @dev It is not allowed to transfer resi token
     */
    function transfer(address, uint256) public pure override(ERC20Upgradeable) returns (bool) {
        revert TransferForbidden("RESIToken: NO TRANSFER ALLOWED");
    }

    /**
     * @dev It is not allowed to transfer resi token
     */
    function transferFrom(address, address, uint256) public pure override(ERC20Upgradeable) returns (bool) {
        revert TransferFromForbidden("RESIToken: NO TRANSFER FROM ALLOWED");
    }

    /**
     *  @dev Award user with ResiTokens
     * @param _account user to award
     * @param _role user role
     * @param _amount amount to award
     */
    function award(
        address _account,
        bytes32 _role,
        uint256 _amount
    ) external isValidAddress(_account, "ResiToken: INVALID RECEIVER ADDR") onlyRole(ADMIN_ROLE) nonReentrant {
        require(hasRole(_role, _account), "ResiToken: ACCOUNT HAS NOT VALID ROLE");
        address SERIE_SBT = IResiRegistry(RESI_REGISTRY).getSBTSerie();
        if (IERC721Upgradeable(SERIE_SBT).balanceOf(_account) == 0) {
            IResiSBT(SERIE_SBT).mintByResiToken(_account, _role);
        }
        _mint(_account, _amount);
        uint256 activeSerie = IResiRegistry(RESI_REGISTRY).activeSerie();
        IResiSBT(SERIE_SBT).increaseResiTokenBalance(_account, _amount);
        IResiRegistry(RESI_REGISTRY).increaseSerieSupply(activeSerie, _amount);
        emit ResiMinted(_account, _amount);
    }

    /**
     * @dev Perform exit to receive serie funds
     * @param _serieId serie id
     * @param _role user role
     */
    function exit(uint256 _serieId, bytes32 _role) external nonReentrant {
        _checkExit(_role);
        address SERIE_SBT = IResiRegistry(RESI_REGISTRY).getSBTSerie(_serieId);
        require(SERIE_SBT != address(0), "ResiToken: NO SBT SERIE SET");
        require(IERC20(SERIE_SBT).balanceOf(_msgSender()) == 1, "ResiToken: USER HAS NO SBT");
        uint256 resiSerieBalance = this.balanceOf(_msgSender());

        IResiRegistry(RESI_REGISTRY).withdrawFromVault(_serieId, resiSerieBalance, _msgSender());
        IResiSBT(SERIE_SBT).decreaseResiTokenBalance(_msgSender(), resiSerieBalance);
        _transfer(_msgSender(), IResiRegistry(RESI_REGISTRY).getTreasuryVault(), resiSerieBalance);

        emit Exit(_msgSender(), resiSerieBalance, _serieId);
    }

    /**
     *  @dev burn Resi Token
     * @param _amount amount to burn
     */
    function burn(uint256 _amount, uint256 _serieId) external {
        require(hasRole(TREASURY_ROLE, _msgSender()) || hasRole(ADMIN_ROLE, _msgSender()), "ResiToken: INVALID ROLE");
        ERC20BurnableUpgradeable.burn(_amount);
        IResiRegistry(RESI_REGISTRY).decreaseSerieSupply(_serieId, _amount);
        emit ResiBurnt(_msgSender(), _amount);
    }

    /**************************** INTERNALS  ****************************/

    /**
     * @dev Internal function to add roles batch function
     * @param role role to add
     * @param _addresses users array
     */
    function _addRolesBatch(
        bytes32 role,
        address[] memory _addresses
    ) internal onlyRole(ADMIN_ROLE) validRole(role) whenNotPaused {
        for (uint8 i = 0; i < _addresses.length; i++) {
            if (_addresses[i] == address(0)) {
                revert InvalidAddress(_addresses[i]);
            }
            _grantRole(role, _addresses[i]);
        }
    }

    /**
     * @dev Internal function to perform valid exit
     * @param _role user role
     */
    function _checkExit(bytes32 _role) internal view {
        require(_role != TREASURY_ROLE && _role != ADMIN_ROLE, "ResiToken: INVALID ACTION");
        require(hasRole(_role, _msgSender()), "ResiToken: ACCOUNT HAS NOT VALID ROLE");
        require(balanceOf(_msgSender()) > 0, "ResiToken: User HAS NO FUNDS TO EXIT");
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20Upgradeable, ERC20PausableUpgradeable) {
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
     * @dev check address is not the zero address
     */
    modifier isValidAddress(address _addr, string memory message) {
        require(_addr != address(0), message);
        _;
    }

    /**
     * @dev check user has valid role
     */
    modifier validRole(bytes32 _role) {
        require(
            _role == MENTOR_ROLE || _role == PROJECT_BUILDER_ROLE || _role == RESI_BUILDER_ROLE,
            "ResiToken: INVALID ROLE"
        );
        _;
    }

    // Leave a gap betweeen inherited contracts variables in order
    // to be able to add more variables in them later.
    uint256[20] private upgradeGap;
}
