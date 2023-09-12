// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IResiVault} from "./interfaces/IResiVault.sol";
import {IResiRegistry} from "./interfaces/IResiRegistry.sol";

import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ResiVault is IResiVault, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    ///@dev Main token address
    address public TOKEN;
    ///@dev RESI TOKEN address
    address public RESI_TOKEN;
    ///@dev RESI Registry adddress
    address public RESI_REGISTRY;
    ///@dev SERIE ID linked to Vault
    uint256 public SERIE_ID;

    mapping(bytes32 => address) public tokens;

    using SafeERC20 for IERC20;

    function initialize(
        uint256 _serieId,
        address _resiToken,
        address _token,
        address _resiRegistry
    ) public initializer {
        require(_resiToken != address(0), "ResiVault: INVALID RESI TOKEN ADDRESS");
        require(_resiRegistry != address(0), "ResiVault: INVALID RESI REGISTRY ADDRESS");
        require(_token != address(0), "ResiVault: INVALID TOKEN ADDRESS");
        __Context_init_unchained();
        __Ownable_init_unchained();
        __ReentrancyGuard_init_unchained();
        SERIE_ID = _serieId;
        TOKEN = _token;
        RESI_TOKEN = _resiToken;
        RESI_REGISTRY = _resiRegistry;
        emit ResiVaultInitialized(_serieId, _resiToken, _resiRegistry);
    }

    /**************************** GETTERS  ****************************/

    /**
     * @dev Get specific token Vault balance
     * @param _name token name
     * @return Contract token balance
     */
    function tokenBalance(bytes32 _name) external view returns (uint256) {
        require(tokens[_name] != address(0), "ResiVault: INVALID TOKEN NAME");
        return IERC20(tokens[_name]).balanceOf(address(this));
    }

    /**
     * @dev Get Vault native balance
     * @return native contract balance
     */
    function balance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Get main token
     * @return Main token address
     */
    function getMainToken() external view returns (address) {
        return TOKEN;
    }

    /**
     * @dev Get current exit quote given amount of tokens
     * @param _amount amount of tokens held by an user
     * @return exit quote
     */
    function getCurrentExitQuote(uint256 _amount) external view returns (uint256) {
        return _getExitQuote(_amount);
    }

    /**************************** INTERFACE  ****************************/

    /**
     *  @dev Set Main Token address
     * @param _token token address
     */
    function setMainToken(address _token) external onlyOwner {
        require(_token != address(0), "ResiVault: INVALID TOKEN ADDRESS");
        address oldToken = TOKEN;
        TOKEN = _token;
        emit MainTokenUpdated(oldToken, TOKEN);
    }

    /**
     *  @dev add new token
     * @param _token token address
     * @param _name token name
     */
    function addToken(address _token, bytes32 _name) external onlyOwner {
        require(_token != address(0), "ResiVault: INVALID TOKEN ADDRESS");
        require(_name != bytes32(0), "ResiVault: INVALID TOKEN NAME");
        require(tokens[_name] == address(0), "ResiVault: TOKEN ALREADY SET");
        tokens[_name] = _token;
        emit TokenAdded(_name, _token);
    }

    /**
     *  @dev remove token
     * @param _name token name
     */
    function removeToken(bytes32 _name) external onlyOwner {
        require(tokens[_name] != address(0), "ResiVault: INVALID TOKEN NAME");
        address _token = tokens[_name];
        tokens[_name] = address(0);
        emit TokenRemoved(_name, _token);
    }

    /**
     * @dev Transfer vault funds to ResiRegistry
     * @param _amount amount to transfer
     */
    function release(uint256 _amount) external onlyResiRegistry nonReentrant {
        _release(_amount);
    }

    /**************************** INTERNALS  ****************************/

    /**
     * @dev Internal function to view current exit quote
     */
    function _getExitQuote(uint256 _amount) internal view returns (uint256) {
        uint256 serieSupply = IResiRegistry(RESI_REGISTRY).getSerieSupply(SERIE_ID);
        require(serieSupply > 0, "ResiVault: SERIE WITH NO MINTED SUPPLY");
        uint256 currentBalance = IERC20(TOKEN).balanceOf(address(this));
        //uint256 quote = currentBalance / serieSupply;
        return (_amount * currentBalance) / serieSupply;
    }

    /**
     *  @dev internal function to transfer vault funds to ResiRegistry
     * @param _amount amount to transfer
     */
    function _release(uint256 _amount) private {
        require(_amount > 0, "INVALID AMOUNT");
        require(IERC20(TOKEN).balanceOf(address(this)) >= _amount, "ResiVault: INVALID AMOUNT TO RELEASE");

        uint256 quote = _getExitQuote(_amount);
        require(quote > 0, "ResiVault: Invalid quote");

        IERC20(TOKEN).safeTransfer(RESI_REGISTRY, quote * _amount);

        emit TokenReleased(TOKEN, _amount);
    }

    /**
     * @dev check msg sender is ResiRegistry
     */
    modifier onlyResiRegistry() {
        require(_msgSender() == RESI_REGISTRY);
        _;
    }

    // Leave a gap betweeen inherited contracts variables in order
    // to be able to add more variables in them later.
    uint256[20] private upgradeGap;
}
