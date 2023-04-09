// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./interfaces/IResiToken.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";

contract ResiToken is
    IResiToken,
    Initializable,
    ContextUpgradeable,
    OwnableUpgradeable,
    AccessControlUpgradeable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    ERC20PausableUpgradeable
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant MENTOR_ROLE = keccak256("MENTOR_ROLE");
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");
    bytes32 public constant PROJECT_BUILDER_ROLE = keccak256("PROJECT_BUILDER_ROLE");
    bytes32 public constant RESI_BUILDER_ROLE = keccak256("RESI_BUILDER_ROLE");

    function initialize(address _treasury) public initializer {
        require(_treasury != address(0), "INVALID TREASURY ADDRESS");
        __Context_init();
        __Ownable_init();
        __AccessControl_init();
        __ERC20_init("ResiToken", "RESI");
        __ERC20Burnable_init();
        __ERC20Pausable_init();
        _grantRole(MINTER_ROLE, _msgSender());
        _grantRole(TREASURY_ROLE, _treasury);
    }

    function addMentor(
        address _mentor
    ) external isValidAddress(_mentor, "INVALID MENTOR ADDRESS") onlyOwner whenNotPaused {
        _grantRole(MENTOR_ROLE, _mentor);
        emit MentorAdded(_mentor);
    }

    function removeMentor(address _mentor) external isValidAddress(_mentor, "INVALID MENTOR ADDRESS") onlyOwner {
        _revokeRole(MENTOR_ROLE, _mentor);
        emit MentorRemoved(_mentor);
    }

    function addProjectBuilder(
        address _builder
    ) external isValidAddress(_builder, "INVALID BUILDER ADDRESS") onlyOwner whenNotPaused {
        _grantRole(PROJECT_BUILDER_ROLE, _builder);
        emit ProjectBuilderAdded(_builder);
    }

    function removeProjectBuilder(
        address _builder
    ) external isValidAddress(_builder, "INVALID BUILDER ADDRESS") onlyOwner {
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

    function addMentors(address[] memory _mentors) external onlyOwner whenNotPaused {}

    function addProjectBuilders(address[] memory _projectBuilders) external onlyOwner whenNotPaused {}

    function addResiBuilders(address[] memory _resiBuilders) external onlyOwner whenNotPaused {}

    function _addRolesBatch(bytes32 role, address[] memory _addresses) internal onlyOwner whenNotPaused {
        require(role == MENTOR_ROLE || role == PROJECT_BUILDER_ROLE || role == RESI_BUILDER_ROLE, "INVALID ROLE");
        for (uint8 i = 0; i < _addresses.length; i++) {
            if (_addresses[i] == address(0)) {
                revert InvalidAddress(_addresses[i]);
            }
            _grantRole(role, _addresses[i]);
        }
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20Upgradeable, ERC20PausableUpgradeable) {
        super._beforeTokenTransfer(from, to, amount);
    }

    modifier isValidAddress(address _addr, string memory message) {
        require(_addr != address(0), message);
        _;
    }

    // Leave a gap betweeen inherited contracts variables in order
    // to be able to add more variables in them later.
    uint256[20] private upgradeGap;
}
