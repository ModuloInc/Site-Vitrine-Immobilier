// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract ProprietyTitle is ERC721, ERC721Burnable, Ownable {
//    mapping(uint256 => uint256) public price;
    uint256 public price = 100;
    address ERC20;

    constructor(address _ERC20)
    ERC721("ProprietyTitle", "PT")
    Ownable(msg.sender)
    {
        ERC20 = _ERC20;
    }

    function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }

    function buy(uint256 tokenId) public {
        IERC20(ERC20).transferFrom(msg.sender, address(this), price);
        _safeMint(msg.sender, tokenId);
    }
}
