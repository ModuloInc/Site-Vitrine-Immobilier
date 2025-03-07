// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title ModuloCoin
 * @dev Implementation of ERC20 to create the ModuloCoin token
 * @notice ModuloCoin is a standard ERC20 token with mint function to create new token units
 * @dev Constructor initializes the token with name "ModuloCoin" and symbol "ModuloCoin"
 */
contract ModuloCoin is ERC20 {
    /**
     * @notice Smart contract inherits from OpenZeppelin's ERC20 contract
     * @dev Calls the ERC20 constructor with name "ModuloCoin" and symbol "ModuloCoin"
     */
    constructor() ERC20("ModuloCoin", "ModuloCoin") {}

    /**
     * @notice Mints new tokens to the specified address
     * @dev The amount minted is equal to the ETH value sent
     * @param to The address that will receive the minted tokens
     */
    function mint(address to) public payable {
        _mint(to, msg.value);
    }

    /**
     * @notice Alternative mint function that accepts amount parameter
     * @dev This function allows specifying the exact amount to mint
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    /**
     * @notice Withdraws ETH by burning tokens
     * @dev Burns tokens from sender and transfers equivalent ETH to sender
     * @param amount The amount of tokens to burn and ETH to withdraw
     */
    function withdraw(uint256 amount) public {
        _burn(msg.sender, amount);
        payable(msg.sender).transfer(amount);
    }
}