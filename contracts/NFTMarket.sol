//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


import "hardhat/console.sol";

contract NFTMarket is ReentrancyGuard {
    
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address payable owner;
    uint256 public listingPrice = 1;

    constructor() {
        owner = payable(msg.sender);
    }

    struct MarketItem {
        uint itemId;
        address nftContract;
        uint tokenId;
        address payable seller;
        address payable owner;
        uint price;
        bool sold;
    }

    mapping(uint => MarketItem) public idToMarketItem;

    event MarketItemCreated (
        uint itemId,
        address nftContract,
        uint tokenId,
        address payable seller,
        address payable owner,
        uint price,
        bool sold
    );


    function createMarketItem(address nftContract, uint tokenId, uint price) public nonReentrant {
        require(price > 0, "Price must be at least 1 wei");
        require(IERC721(nftContract).getApproved(tokenId) == address(this), "Market didn't get approval");

        _itemIds.increment();
        uint itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(itemId, nftContract, tokenId, payable(msg.sender), payable(address(0)), price, false);
    }

    function createMarketSale(address nftContract, uint itemId, uint price) public payable nonReentrant {
        address item_owner = idToMarketItem[itemId].owner;
        uint token_id = idToMarketItem[itemId].tokenId;
        require(msg.sender == item_owner, "You must be the owner to create the sale");
        require(IERC721(nftContract).getApproved(token_id) == address(this), "Market didn't get approval");

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            token_id,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), token_id);

        emit MarketItemCreated(itemId, nftContract, token_id, payable(msg.sender), payable(address(0)), price, false);
    }

    function executeMarketSale(address nftContract, uint itemId) public payable nonReentrant {
        uint price = idToMarketItem[itemId].price;
        uint tokenId = idToMarketItem[itemId].tokenId;

        require(msg.value == price, "Please submit the asking price in order to complete the purchase");

        payable(idToMarketItem[itemId].seller).transfer((msg.value*99)/100);
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].sold = true;
        _itemsSold.increment();
        payable(owner).transfer(msg.value/100);
    }

    function cancelSale(address nftContract, uint itemId) public nonReentrant {
        address item_seller = idToMarketItem[itemId].seller;
        uint tokenId = idToMarketItem[itemId].tokenId;
        require(msg.sender == item_seller, "You must be the owner to cancel the sale");
        idToMarketItem[itemId].owner = payable(msg.sender);
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
    }

    function fetchMarketItems() public view returns(MarketItem[] memory) {
        uint itemCount = _itemIds.current();
        uint currentIndex = 0;
        uint unsoldItemCount = 0;
        
        for(uint i = 0; i < itemCount; i++) {
            if (idToMarketItem[i+1].owner == address(0)) {
                unsoldItemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        

        for(uint i = 0; i < itemCount; i++) {
            if (idToMarketItem[i+1].owner == address(0)) {
                uint currentId = idToMarketItem[i+1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for(uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i+1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);


        for(uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i+1].owner == msg.sender) {
                uint currentId = idToMarketItem[i+1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function fetchItemsCreated() public view returns (MarketItem[] memory) {
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for(uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i+1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);

        for(uint i = 0; i < totalItemCount; i++) {
            if(idToMarketItem[i+1].seller == msg.sender) {
                uint currentId = idToMarketItem[i+1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }
}
