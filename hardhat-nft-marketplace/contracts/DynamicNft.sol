// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DynamicNft is ERC721 {
    // Events
    event NFTMinted(uint256 indexed tokenId);
    // Types
    struct Nft {
        string TokenDataURI;
    }
    // Fields
    Nft[] public nfts;

    constructor() ERC721("Dogie", "DOG") {}

    function mintNft(string memory tokenDataURI) public {
        Nft memory newNft = Nft(tokenDataURI);
        nfts.push(newNft);
        uint256 tokenId = nfts.length;
        _safeMint(msg.sender, tokenId);
        emit NFTMinted(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return nfts[tokenId - 1].TokenDataURI;
    }

    function getTokenCounter() public view returns (uint256) {
        return uint256(nfts.length);
    }
}
