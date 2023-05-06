// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./interfaces/IResiVault.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ResiVault is IResiVault, OwnableUpgradeable {
    address public TOKEN;
    address public RESI_TOKEN;
    uint256 public SERIE_ID;

    function initialize(uint256 _serieId, address _token, address _resiToken) public initializer {
        require(_token != address(0), "INVALID TOKEN ADDRESS");
        require(_resiToken != address(0), "INVALID RESI TOKEN ADDRESS");
        __Context_init_unchained();
        __Ownable_init_unchained();
        SERIE_ID = _serieId;
        TOKEN = _token;
        RESI_TOKEN = _resiToken;
        emit Initialized(_serieId, _token, _resiToken);
    }

    function balance() external view returns (uint256) {
        return IERC20(TOKEN).balanceOf(address(this));
    }
}
