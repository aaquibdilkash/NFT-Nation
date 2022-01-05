//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";

contract NFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;

    address payable owner;
    uint256 public listingPrice = 1;

    constructor() {
        owner = payable(msg.sender);
    }

    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        address payable highestBidder;
        uint256 highestBid;
        address payable[] pendingBidders;
        bool auctionEnded;
    }

    mapping(uint256 => MarketItem) public idToMarketItem;
    mapping(uint256 => mapping(address => uint256)) public pendingReturns;

    event UpdatedMarketItem(
        uint256 itemId,
        address nftContract,
        uint256 tokenId,
        address payable seller,
        address payable owner,
        uint256 price,
        address payable highestBidder,
        uint256 highestBid,
        address payable[] pendingBidders,
        bool auctionEnded
    );

    function setListingPrice(uint _listingPrice) public {
        require(msg.sender == owner, "You are not the owner of this smart contract");
        listingPrice = _listingPrice;
    }

    function emitEvent(uint itemId) private {
        emit UpdatedMarketItem(
            itemId,
            idToMarketItem[itemId].nftContract,
            idToMarketItem[itemId].tokenId,
            idToMarketItem[itemId].seller,
            idToMarketItem[itemId].owner,
            idToMarketItem[itemId].price,
            idToMarketItem[itemId].highestBidder,
            idToMarketItem[itemId].highestBid,
            idToMarketItem[itemId].pendingBidders,
            idToMarketItem[itemId].auctionEnded
        );
    }


    function createMarketItem(address nftContract, uint256 tokenId)
        public
        nonReentrant
    {
        require(
            IERC721(nftContract).ownerOf(tokenId) == msg.sender,
            "You must be the Owner to create a sale"
        );

        address payable[] memory emptyArray;

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(address(0)),
            payable(msg.sender),
            0,
            payable(msg.sender),
            0,
            emptyArray,
            true
        );

        emitEvent(itemId);
    }

    function createMarketItemForSale(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) public nonReentrant {
        require(price > 0, "Price must be at least 1 wei");
        require(
            IERC721(nftContract).getApproved(tokenId) == address(this),
            "Market didn't get approval"
        );
        require(
            IERC721(nftContract).ownerOf(tokenId) == msg.sender,
            "You must be the Owner to create a sale"
        );

        address payable[] memory emptyArray;

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            payable(msg.sender),
            0,
            emptyArray,
            true
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emitEvent(itemId);
    }

    function createMarketItemForAuction(
        address nftContract,
        uint256 tokenId
    ) public nonReentrant {

        require(
            IERC721(nftContract).getApproved(tokenId) == address(this),
            "Market didn't get approval"
        );
        require(
            IERC721(nftContract).ownerOf(tokenId) == msg.sender,
            "You must be the Owner to create a sale"
        );

        address payable[] memory emptyArray;

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            0,
            payable(msg.sender),
            0,
            emptyArray,
            false
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emitEvent(itemId);
    }

    function createMarketSale(
        address nftContract,
        uint256 itemId,
        uint256 price
    ) public payable nonReentrant {
        uint256 token_id = idToMarketItem[itemId].tokenId;

        require(
            IERC721(nftContract).getApproved(token_id) == address(this),
            "Market didn't get approval"
        );
        require(
            IERC721(nftContract).ownerOf(token_id) == msg.sender,
            "You must be the Owner to create a sale"
        );

        address payable[] memory emptyArray;

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            token_id,
            payable(msg.sender),
            payable(address(0)),
            price,
            payable(msg.sender),
            0,
            emptyArray,
            true
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), token_id);

        emitEvent(itemId);
    }

    function createMarketAuction(
        address nftContract,
        uint256 itemId
    ) public payable nonReentrant {
        uint256 token_id = idToMarketItem[itemId].tokenId;

        require(
            IERC721(nftContract).getApproved(token_id) == address(this),
            "Market didn't get approval"
        );
        require(
            IERC721(nftContract).ownerOf(token_id) == msg.sender,
            "You must be the Owner to create an auction"
        );

        address payable[] memory emptyArray;

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            token_id,
            payable(msg.sender),
            payable(address(0)),
            0,
            payable(msg.sender),
            0,
            emptyArray,
            false
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), token_id);

        emitEvent(itemId);
    }

    function executeMarketSale(address nftContract, uint256 itemId)
        public
        payable
        nonReentrant
    {
        uint256 price = idToMarketItem[itemId].price;
        uint256 tokenId = idToMarketItem[itemId].tokenId;

        require(
            msg.value == price,
            "Please submit the asking price in order to complete the purchase"
        );

        payable(idToMarketItem[itemId].seller).transfer((msg.value * (100 - listingPrice)) / 100);
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].seller = payable(address(0));
        idToMarketItem[itemId].price = 0;

        payable(owner).transfer((msg.value * listingPrice) / 100);

        emitEvent(itemId);
    }

    function executeMarketAuctionEnd(address nftContract, uint256 itemId)
        public
        nonReentrant
    {
        require(!idToMarketItem[itemId].auctionEnded, "Auction for this NFT has already ended");
        uint256 highestBid = idToMarketItem[itemId].highestBid;
        address highestBidder = idToMarketItem[itemId].highestBidder;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        address payable[] memory emptyArray;

        if (highestBid != 0) {
            payable(idToMarketItem[itemId].seller).transfer(
                (highestBid * (100 - listingPrice)) / 100
            );
            payable(owner).transfer((highestBid * listingPrice) / 100);
        }

        IERC721(nftContract).transferFrom(
            address(this),
            address(highestBidder),
            tokenId
        );

        for(uint i = 0; i < idToMarketItem[itemId].pendingBidders.length; i++) {
            if(idToMarketItem[itemId].pendingBidders[i] != address(0) && pendingReturns[itemId][idToMarketItem[itemId].pendingBidders[i]] > 0) {
                payable(idToMarketItem[itemId].pendingBidders[i]).transfer(pendingReturns[itemId][idToMarketItem[itemId].pendingBidders[i]]);
            }
        }
        
        idToMarketItem[itemId].owner = payable(highestBidder);
        idToMarketItem[itemId].seller = payable(address(0));
        idToMarketItem[itemId].highestBidder = payable(address(highestBidder));
        idToMarketItem[itemId].highestBid = 0;
        idToMarketItem[itemId].auctionEnded = true;
        idToMarketItem[itemId].pendingBidders = emptyArray;

        emitEvent(itemId);
    }

    function makeAuctionBid(uint256 itemId) public payable nonReentrant {
        require(!idToMarketItem[itemId].auctionEnded, "Auction for this NFT has ended");
        require(
                pendingReturns[itemId][msg.sender] == 0,
                "You already have a bid for this NFT"
            );

        address prevHighestBidder = idToMarketItem[itemId].highestBidder;
        uint256 prevHighestBid = idToMarketItem[itemId].highestBid;

        if (msg.value > prevHighestBid) {
            
            idToMarketItem[itemId].highestBidder = payable(msg.sender);
            idToMarketItem[itemId].highestBid = msg.value;

            idToMarketItem[itemId].pendingBidders.push(payable(prevHighestBidder));
            pendingReturns[itemId][prevHighestBidder] = prevHighestBid;

        } else {
            pendingReturns[itemId][msg.sender] = msg.value;
            idToMarketItem[itemId].pendingBidders.push(payable(msg.sender));
        }

        emitEvent(itemId);

    }

    function withdrawAuctionBid(uint256 itemId) public nonReentrant {
        require(!idToMarketItem[itemId].auctionEnded, "Auction for this NFT has ended");

        if (msg.sender != idToMarketItem[itemId].highestBidder) {
            require(
                pendingReturns[itemId][msg.sender] > 0,
                "You don't have any previous bid to withdraw on this NFT"
            );
            uint256 paybackValue = pendingReturns[itemId][msg.sender];
            payable(msg.sender).transfer(paybackValue);
            pendingReturns[itemId][msg.sender] = 0;

            for(uint i=0; i < idToMarketItem[itemId].pendingBidders.length; i++) {
                if(idToMarketItem[itemId].pendingBidders[i] == msg.sender) {
                    delete idToMarketItem[itemId].pendingBidders[i];
                    break;
                }
            }
        } else {
            uint256 prevHighestBid = idToMarketItem[itemId].highestBid;
            address prevHighestBidder = idToMarketItem[itemId].highestBidder;
            payable(msg.sender).transfer(prevHighestBid);

            idToMarketItem[itemId].highestBid = 0;
            idToMarketItem[itemId].highestBidder = idToMarketItem[itemId].seller;

            address nextHighestBidder = pendingReturns[itemId][idToMarketItem[itemId].pendingBidders[0]] > 0 ? idToMarketItem[itemId].pendingBidders[0] : idToMarketItem[itemId].seller;
            uint256 nextHighestBidderIndex = 0;

            for (
                uint256 i = 0;
                i < idToMarketItem[itemId].pendingBidders.length;
                i++
            ) {
                if (
                    pendingReturns[itemId][idToMarketItem[itemId].pendingBidders[i]] >
                    pendingReturns[itemId][nextHighestBidder] &&
                    idToMarketItem[itemId].pendingBidders[i] != prevHighestBidder
                ) {
                    nextHighestBidder = idToMarketItem[itemId].pendingBidders[i];
                    nextHighestBidderIndex = i;
                }
            }

            idToMarketItem[itemId].highestBidder = payable(nextHighestBidder);
            idToMarketItem[itemId].highestBid = pendingReturns[itemId][nextHighestBidder];
            pendingReturns[itemId][nextHighestBidder] = 0;
            delete idToMarketItem[itemId].pendingBidders[nextHighestBidderIndex];
        }

        emitEvent(itemId);
    }

    function cancelMarketSale(address nftContract, uint256 itemId)
        public
        nonReentrant
    {
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        address seller = idToMarketItem[itemId].seller;

        require(
            seller == msg.sender,
            "You must be the Owner to cancel a sale"
        );

        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].seller = payable(address(0));
        idToMarketItem[itemId].price = 0;

        emitEvent(itemId);
    }

    function fetchMarketItems(uint256 pageNumber, uint256 pageSize)
        public
        view
        returns (MarketItem[] memory)
    {
        uint256 itemCount = _itemIds.current();
        uint256 endIndex = pageNumber * pageSize + 1;

        MarketItem[] memory items = new MarketItem[](pageSize);

        for (uint256 i = itemCount; i >= endIndex && i >= 1; i--) {
            items[i] = idToMarketItem[i];
        }

        uint j = 0;
        while(endIndex > 0 && j < pageSize) {
            items[j] = idToMarketItem[j];
            j++;
            endIndex > 0;
        }

        return items;
    }

}
