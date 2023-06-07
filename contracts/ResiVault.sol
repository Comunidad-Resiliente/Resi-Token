// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./interfaces/IResiVault.sol";
import "./interfaces/IResiRegistry.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ResiVault is IResiVault, OwnableUpgradeable {
    address public TOKEN;
    address public RESI_TOKEN;
    address public RESI_REGISTRY;
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
        __Context_init_unchained();
        __Ownable_init_unchained();
        SERIE_ID = _serieId;
        TOKEN = _token;
        RESI_TOKEN = _resiToken;
        RESI_REGISTRY = _resiRegistry;
        emit ResiVaultInitialized(_serieId, _resiToken, _resiRegistry);
    }

    /**************************** GETTERS  ****************************/

    function tokenBalance(bytes32 _name) external view returns (uint256) {
        require(tokens[_name] != address(0), "ResiVault: INVALID TOKEN NAME");
        return IERC20(tokens[_name]).balanceOf(address(this));
    }

    function balance() external view returns (uint256) {
        return address(this).balance;
    }

    function getMainToken() external view returns (address) {
        return TOKEN;
    }

    function getCurrentExitQuote(uint256 _amount) external view returns (uint256) {
        return _amount * _getExitQuote();
    }

    /**************************** INTERFACE  ****************************/

    function setMainToken(address _token) external onlyOwner {
        require(_token != address(0), "ResiVault: INVALID TOKEN ADDRESS");
        address oldToken = TOKEN;
        TOKEN = _token;
        emit MainTokenUpdated(oldToken, TOKEN);
    }

    function addToken(address _token, bytes32 _name) external onlyOwner {
        require(_token != address(0), "ResiVault: INVALID TOKEN ADDRESS");
        require(_name != bytes32(0), "ResiVault: INVALID TOKEN NAME");
        require(tokens[_name] == address(0), "ResiVault: TOKEN ALREADY SET");
        tokens[_name] = _token;
        emit TokenAdded(_name, _token);
    }

    function removeToken(bytes32 _name) external onlyOwner {
        require(tokens[_name] != address(0), "ResiVault: INVALID TOKEN NAME");
        address _token = tokens[_name];
        tokens[_name] = address(0);
        emit TokenRemoved(_name, _token);
    }

    /***
     *
     * Logica
     *
     * Hip 1. Hay en el vault 1x106 usdt
     *
     * Hip 2. Vengo a claimear con un balance de 20 Resi tokens
     *
     *
     * Resultado: 1x106 / CANTIDAD DE TOKENS EMITIDOS EN ESA SERIE * MI CANTIDAD ==> VALOR EN USD QUE ME CORRESPONDE.
     *
     */
    function release(uint256 _amount) external onlyResiRegistry {
        require(_amount > 0, "INVALID AMOUNT");
        require(IERC20(TOKEN).balanceOf(address(this)) >= _amount, "ResiVault: INVALID AMOUNT TO RELEASE");

        uint256 quote = _getExitQuote();
        require(quote > 0, "ResiVault: Invalid quote");

        IERC20(TOKEN).safeTransfer(RESI_REGISTRY, quote * _amount);

        emit TokenReleased(TOKEN, _amount);
    }

    /**************************** INTERNALS  ****************************/

    function _getExitQuote() internal view returns (uint256) {
        uint256 serieSupply = IResiRegistry(RESI_REGISTRY).getSerieSupply(SERIE_ID);
        require(serieSupply > 0, "ResiVault: SERIE WITH NO MINTED SUPPLY");
        uint256 currentBalance = IERC20(TOKEN).balanceOf(address(this));
        uint256 quote = currentBalance / serieSupply;
        return quote;
    }

    receive() external payable {
        emit EtherReceived(_msgSender(), msg.value);
    }

    modifier onlyResiRegistry() {
        require(_msgSender() == RESI_REGISTRY);
        _;
    }

    // Leave a gap betweeen inherited contracts variables in order
    // to be able to add more variables in them later.
    uint256[20] private upgradeGap;
}
