//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./Token.sol";
import "hardhat/console.sol";

contract NFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;

    address payable owner;
    uint256 public listingPrice = 1;
    address tokenAdress;
    uint256 public tokenRate = 1000;

    constructor(address _tokenAddress) {
        owner = payable(msg.sender);
        tokenAdress = _tokenAddress;
    }

    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        bool onSale;
        address payable owner;
        uint256 price;
        address payable highestBidder;
        uint256 highestBid;
        address payable[] pendingBidders;
        address payable[] pendingOffers;
        bool auctionEnded;
        address payable minter;
        uint256 royalty;
    }

    mapping(uint256 => MarketItem) public idToMarketItem;
    mapping(uint256 => mapping(address => uint256)) public pendingReturns;
    mapping(uint256 => mapping(address => uint256)) public pendingOffers;

    event UpdatedMarketItem(
        uint256 itemId,
        address nftContract,
        uint256 tokenId,
        bool onSale,
        address payable owner,
        uint256 price,
        address payable highestBidder,
        uint256 highestBid,
        address payable[] pendingBidders,
        address payable[] pendingOffers,
        bool auctionEnded,
        address payable minter,
        uint256 royalty
    );

    function setListingPrice(uint256 _listingPrice) public {
        require(
            msg.sender == owner,
            "Invalid Owner"
        );
        listingPrice = _listingPrice;
    }

    function setTokenRate(uint256 _tokenRate) public {
        require(
            msg.sender == owner,
            "Invalid Owner"
        );
        tokenRate = _tokenRate;
    }

    function setTokenRoyalty(uint256 itemId, uint256 royalty) public {
        address token_owner = idToMarketItem[itemId].owner;
        address token_minter = idToMarketItem[itemId].minter;
        require(
            msg.sender == token_owner && msg.sender == token_minter,
            "Invalid Miter or Owner"
        );
        idToMarketItem[itemId].royalty = royalty;
    }

    function emitEvent(uint256 itemId) private {
        emit UpdatedMarketItem(
            itemId,
            idToMarketItem[itemId].nftContract,
            idToMarketItem[itemId].tokenId,
            idToMarketItem[itemId].onSale,
            idToMarketItem[itemId].owner,
            idToMarketItem[itemId].price,
            idToMarketItem[itemId].highestBidder,
            idToMarketItem[itemId].highestBid,
            idToMarketItem[itemId].pendingBidders,
            idToMarketItem[itemId].pendingOffers,
            idToMarketItem[itemId].auctionEnded,
            idToMarketItem[itemId].minter,
            idToMarketItem[itemId].royalty
        );
    }

    function crowdSale() public payable nonReentrant {
        require(Token(tokenAdress).transfer(msg.sender, msg.value));
        payable(owner).transfer(msg.value);
    }

    function earn(uint256 _amount) public nonReentrant {
        require(Token(tokenAdress).transfer(msg.sender, _amount));
    }

    function createMarketItem(address nftContract, uint256 tokenId, uint royalty)
        public
        nonReentrant
    {
        require(royalty <= 50, "Invalid royalty");
        require(
            IERC721(nftContract).ownerOf(tokenId) == msg.sender,
            "Ownership Not Verified"
        );

        address payable[] memory emptyArray;

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            false,
            payable(msg.sender),
            0,
            payable(msg.sender),
            0,
            emptyArray,
            emptyArray,
            true,
            payable(msg.sender),
            royalty
        );

        emitEvent(itemId);
    }

    function createMarketItemForSale(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 royalty
    ) public nonReentrant {
        require(price > 0, "Invalid Price");
        require(royalty <= 50, "Invalid royalty");

        require(
            IERC721(nftContract).ownerOf(tokenId) == msg.sender,
            "Ownership Not Verified"
        );
        require(
            IERC721(nftContract).getApproved(tokenId) == address(this),
            "Need Approval"
        );

        address payable[] memory emptyArray;

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            true,
            payable(msg.sender),
            price,
            payable(msg.sender),
            0,
            emptyArray,
            emptyArray,
            true,
            payable(msg.sender),
            royalty
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emitEvent(itemId);
    }

    function createMarketItemForAuction(address nftContract, uint256 tokenId, uint256 royalty)
        public
        nonReentrant
    {
        require(royalty <= 50, "Invalid royalty");
        require(
            IERC721(nftContract).getApproved(tokenId) == address(this),
            "Market Didn't Get Approval"
        );
        require(
            IERC721(nftContract).ownerOf(tokenId) == msg.sender,
            "You Must Be The Owner Of This NFT To Create A Sale"
        );

        address payable[] memory emptyArray;

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            false,
            payable(msg.sender),
            0,
            payable(msg.sender),
            0,
            emptyArray,
            emptyArray,
            false,
            payable(msg.sender),
            royalty
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emitEvent(itemId);
    }

    function createMarketSale(
        uint256 itemId,
        uint256 price
    ) public payable nonReentrant {
        uint256 token_id = idToMarketItem[itemId].tokenId;
        address nftContract = idToMarketItem[itemId].nftContract;
        uint256 royalty = idToMarketItem[itemId].royalty;

        require(
            IERC721(nftContract).ownerOf(token_id) == msg.sender,
            "Ownership Not Verified"
        );

        require(
            IERC721(nftContract).getApproved(token_id) == address(this),
            "Need Approval"
        );

        address payable[] memory emptyArray;

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            token_id,
            true,
            payable(msg.sender),
            price,
            payable(msg.sender),
            0,
            emptyArray,
            emptyArray,
            true,
            payable(msg.sender),
            royalty
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), token_id);

        emitEvent(itemId);
    }

    function createMarketAuction(uint256 itemId)
        public
        payable
        nonReentrant
    {
        uint256 token_id = idToMarketItem[itemId].tokenId;
        address nftContract = idToMarketItem[itemId].nftContract;
        uint256 royalty = idToMarketItem[itemId].royalty;

        require(
            IERC721(nftContract).ownerOf(token_id) == msg.sender,
            "Ownership Not Verified"
        );

        require(
            IERC721(nftContract).getApproved(token_id) == address(this),
            "Need Approval"
        );

        address payable[] memory emptyArray;

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            token_id,
            false,
            payable(msg.sender),
            0,
            payable(msg.sender),
            0,
            emptyArray,
            emptyArray,
            false,
            payable(msg.sender),
            royalty
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), token_id);

        emitEvent(itemId);
    }

    function giftMarketItem(
        uint256 itemId,
        address giftingAddress
    ) public nonReentrant {

        require(
            IERC721(idToMarketItem[itemId].nftContract).ownerOf(idToMarketItem[itemId].tokenId) == msg.sender && idToMarketItem[itemId].owner == msg.sender,
            "Ownership Not Verified"
        );
        require(
            IERC721(idToMarketItem[itemId].nftContract).getApproved(idToMarketItem[itemId].tokenId) == address(this),
            "Need Approval"
        );

        IERC721(idToMarketItem[itemId].nftContract).safeTransferFrom(
            msg.sender,
            giftingAddress,
            idToMarketItem[itemId].tokenId
        );

        idToMarketItem[itemId].owner = payable(giftingAddress);
        idToMarketItem[itemId].onSale = false;
        idToMarketItem[itemId].price = 0;

        emitEvent(itemId);
    }

    function executeMarketSale(uint256 itemId)
        public
        payable
        nonReentrant
    {

        require(
            msg.value == idToMarketItem[itemId].price,
            "InValid Price"
        );

        uint royalty = idToMarketItem[itemId].royalty;
        address minter = idToMarketItem[itemId].minter;

        payable(idToMarketItem[itemId].owner).transfer(
            (msg.value * (100 - listingPrice - royalty)) / 100
        );
        payable(minter).transfer((msg.value * royalty) / 100);

        IERC721(idToMarketItem[itemId].nftContract).transferFrom(address(this), msg.sender, idToMarketItem[itemId].tokenId);

        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].onSale = false;
        idToMarketItem[itemId].price = 0;

        payable(owner).transfer((msg.value * listingPrice) / 100);

        emitEvent(itemId);
    }

    function executeMarketAuctionEnd(uint256 itemId)
        public
        nonReentrant
    {
        require(
            !idToMarketItem[itemId].auctionEnded,
            "Auction Already Ended"
        );
        // require(
        //     idToMarketItem[itemId].owner == msg.sender,
        //     "You Must Be The Owner Of This NFT To End The Auction"
        // );
        // require(
        //     IERC721(idToMarketItem[itemId].nftContract).ownerOf(
        //         idToMarketItem[itemId].tokenId
        //     ) == msg.sender,
        //     "You Must Be The Owner Of This NFT To End The Auction"
        // );
        uint256 highestBid = idToMarketItem[itemId].highestBid;
        address highestBidder = idToMarketItem[itemId].highestBidder;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        address payable[] memory emptyArray;

        if (highestBid != 0) {
            uint256 royalty = idToMarketItem[itemId].royalty;

            payable(idToMarketItem[itemId].owner).transfer(
                (highestBid * (100 - listingPrice - royalty)) / 100
            );
            payable(idToMarketItem[itemId].minter).transfer((highestBid * royalty) / 100);
            payable(owner).transfer((highestBid * listingPrice) / 100);
        }

        IERC721(idToMarketItem[itemId].nftContract).transferFrom(
            address(this),
            address(highestBidder),
            tokenId
        );

        for (
            uint256 i = 0;
            i < idToMarketItem[itemId].pendingBidders.length;
            i++
        ) {
            if (
                idToMarketItem[itemId].pendingBidders[i] != address(0) &&
                pendingReturns[itemId][
                    idToMarketItem[itemId].pendingBidders[i]
                ] >
                0
            ) {
                payable(idToMarketItem[itemId].pendingBidders[i]).transfer(
                    pendingReturns[itemId][
                        idToMarketItem[itemId].pendingBidders[i]
                    ]
                );
                pendingReturns[itemId][
                    idToMarketItem[itemId].pendingBidders[i]
                ] = 0;
            }
        }

        idToMarketItem[itemId].owner = payable(highestBidder);
        idToMarketItem[itemId].onSale = false;
        idToMarketItem[itemId].highestBidder = payable(address(highestBidder));
        idToMarketItem[itemId].highestBid = 0;
        idToMarketItem[itemId].auctionEnded = true;
        idToMarketItem[itemId].pendingBidders = emptyArray;

        emitEvent(itemId);
    }

    function makeAuctionBid(uint256 itemId) public payable nonReentrant {

        address prevHighestBidder = idToMarketItem[itemId].highestBidder;
        uint256 prevHighestBid = idToMarketItem[itemId].highestBid;

        require(
            !idToMarketItem[itemId].auctionEnded,
            "Auction Ended"
        );
        require(
            pendingReturns[itemId][msg.sender] == 0,
            "Already Existing Bid"
        );

        require(
            msg.sender != idToMarketItem[itemId].owner,
            "Invalid Bidder"
        );

        require(
            msg.value > prevHighestBid,
            "Invalid Bid"
        );

            idToMarketItem[itemId].highestBidder = payable(msg.sender);
            idToMarketItem[itemId].highestBid = msg.value;

            if (
                prevHighestBid > 0 &&
                prevHighestBidder != idToMarketItem[itemId].owner
            ) {
                idToMarketItem[itemId].pendingBidders.push(
                    payable(prevHighestBidder)
                );
                pendingReturns[itemId][prevHighestBidder] = prevHighestBid;
            }

        emitEvent(itemId);
    }

    function withdrawAuctionBid(uint256 itemId) public nonReentrant {
        require(
            !idToMarketItem[itemId].auctionEnded,
            "Auction Ended"
        );

        if (msg.sender != idToMarketItem[itemId].highestBidder) {
            require(
                pendingReturns[itemId][msg.sender] > 0,
                "Non Existing Bid"
            );
            uint256 paybackValue = pendingReturns[itemId][msg.sender];
            payable(msg.sender).transfer(paybackValue);
            pendingReturns[itemId][msg.sender] = 0;

            for (
                uint256 i = 0;
                i < idToMarketItem[itemId].pendingBidders.length;
                i++
            ) {
                if (idToMarketItem[itemId].pendingBidders[i] == msg.sender) {
                    delete idToMarketItem[itemId].pendingBidders[i];
                    break;
                }
            }
        } else {
            require(
                idToMarketItem[itemId].highestBidder == msg.sender,
                "Non Existing Bid"
            );

            uint256 prevHighestBid = idToMarketItem[itemId].highestBid;
            payable(msg.sender).transfer(prevHighestBid);

            uint256 nextHighestBid = 0;
            address nextHighestBidder = idToMarketItem[itemId].owner;
            uint256 nextHighestBidderIndex = idToMarketItem[itemId]
                .pendingBidders
                .length + 1;

            for (
                uint256 i = 0;
                i < idToMarketItem[itemId].pendingBidders.length;
                i++
            ) {
                if (
                    pendingReturns[itemId][
                        idToMarketItem[itemId].pendingBidders[i]
                    ] > pendingReturns[itemId][nextHighestBidder]
                ) {
                    nextHighestBidder = idToMarketItem[itemId].pendingBidders[
                        i
                    ];
                    nextHighestBid = pendingReturns[itemId][
                        idToMarketItem[itemId].pendingBidders[i]
                    ];
                    nextHighestBidderIndex = i;
                }
            }

            idToMarketItem[itemId].highestBidder = payable(nextHighestBidder);
            idToMarketItem[itemId].highestBid = nextHighestBid;
            pendingReturns[itemId][nextHighestBidder] = 0;

            if (
                nextHighestBidderIndex !=
                idToMarketItem[itemId].pendingBidders.length + 1
            ) {
                delete idToMarketItem[itemId].pendingBidders[
                    nextHighestBidderIndex
                ];
            }
        }

        emitEvent(itemId);
    }

    function makeOffer(uint256 itemId) public payable nonReentrant {
        require(idToMarketItem[itemId].auctionEnded, "On Auction");
        require(idToMarketItem[itemId].price == 0, "On Sale");
        require(
            pendingOffers[itemId][msg.sender] == 0,
            "Already Existing Offer"
        );

        pendingOffers[itemId][msg.sender] = msg.value;
        idToMarketItem[itemId].pendingOffers.push(payable(msg.sender));

        emitEvent(itemId);
    }

    function withdrawOffer(uint256 itemId) public nonReentrant {
        require(idToMarketItem[itemId].auctionEnded, "On Auction");
        require(idToMarketItem[itemId].price == 0, "On Sale");
        require(
            pendingOffers[itemId][msg.sender] > 0,
            "Non Existing Offer"
        );

        uint256 paybackValue = pendingOffers[itemId][msg.sender];
        payable(msg.sender).transfer(paybackValue);
        pendingOffers[itemId][msg.sender] = 0;

        for (
            uint256 i = 0;
            i < idToMarketItem[itemId].pendingOffers.length;
            i++
        ) {
            if (idToMarketItem[itemId].pendingOffers[i] == msg.sender) {
                delete idToMarketItem[itemId].pendingOffers[i];
                break;
            }
        }

        emitEvent(itemId);
    }

    function rejectOffer(uint256 itemId, address _offeringAddress)
        public
        nonReentrant
    {
        require(
            idToMarketItem[itemId].owner == msg.sender,
            "Ownership Not Verified"
        );
        // require(
        //     IERC721(idToMarketItem[itemId].nftContract).ownerOf(
        //         idToMarketItem[itemId].tokenId
        //     ) == msg.sender,
        //     "You Must Be The Owner Of This NFT To Reject The Offer"
        // );
        require(idToMarketItem[itemId].auctionEnded, "On Auction");
        require(idToMarketItem[itemId].price == 0, "On Sale");
        require(
            pendingOffers[itemId][_offeringAddress] > 0,
            "Non Existing Offer"
        );

        uint256 paybackValue = pendingOffers[itemId][_offeringAddress];
        payable(_offeringAddress).transfer(paybackValue);
        pendingOffers[itemId][_offeringAddress] = 0;

        for (
            uint256 i = 0;
            i < idToMarketItem[itemId].pendingOffers.length;
            i++
        ) {
            if (idToMarketItem[itemId].pendingOffers[i] == _offeringAddress) {
                delete idToMarketItem[itemId].pendingOffers[i];
                break;
            }
        }

        emitEvent(itemId);
    }

    function acceptOffer(uint256 itemId, address _offeringAddress)
        public
        nonReentrant
    {
        require(
            idToMarketItem[itemId].owner == msg.sender,
            "You Must Be The Owner Of This NFT To Accept The Offer"
        );
        require(
            IERC721(idToMarketItem[itemId].nftContract).ownerOf(
                idToMarketItem[itemId].tokenId
            ) == msg.sender,
            "You Must Be The Owner Of This NFT To Accept The Offer"
        );
        require(
            IERC721(idToMarketItem[itemId].nftContract).getApproved(idToMarketItem[itemId].tokenId) == address(this),
            "Market Didn't Get Approval"
        );
        
        require(
            idToMarketItem[itemId].auctionEnded,
            "This NFT is Currently on Auction"
        );
        require(
            pendingOffers[itemId][_offeringAddress] > 0,
            "This Address Doesn't Have Any Current Offers For This NFT"
        );

        uint256 currentOffer = pendingOffers[itemId][_offeringAddress];
        address payable[] memory emptyArray;
        uint256 royalty = idToMarketItem[itemId].royalty;

        payable(idToMarketItem[itemId].owner).transfer(
            (currentOffer * (100 - listingPrice - royalty)) / 100
        );
        payable(idToMarketItem[itemId].minter).transfer((currentOffer * royalty) / 100);
        payable(owner).transfer((currentOffer * listingPrice) / 100);

        IERC721(idToMarketItem[itemId].nftContract).safeTransferFrom(
            address(idToMarketItem[itemId].owner),
            address(_offeringAddress),
            idToMarketItem[itemId].tokenId
        );

        pendingOffers[itemId][_offeringAddress] = 0;

        for (
            uint256 i = 0;
            i < idToMarketItem[itemId].pendingOffers.length;
            i++
        ) {
            if (
                idToMarketItem[itemId].pendingOffers[i] != address(0) &&
                pendingOffers[itemId][idToMarketItem[itemId].pendingOffers[i]] >
                0
            ) {
                payable(idToMarketItem[itemId].pendingOffers[i]).transfer(
                    pendingOffers[itemId][
                        idToMarketItem[itemId].pendingOffers[i]
                    ]
                );
                pendingReturns[itemId][
                    idToMarketItem[itemId].pendingOffers[i]
                ] = 0;
            }
        }

        idToMarketItem[itemId].owner = payable(_offeringAddress);
        idToMarketItem[itemId].onSale = false;
        idToMarketItem[itemId].highestBidder = payable(
            address(_offeringAddress)
        );
        idToMarketItem[itemId].highestBid = 0;
        idToMarketItem[itemId].auctionEnded = true;
        idToMarketItem[itemId].pendingBidders = emptyArray;
        idToMarketItem[itemId].pendingOffers = emptyArray;

        emitEvent(itemId);
    }

    function rejectAllOffers(uint256 itemId) public nonReentrant {
        require(
            idToMarketItem[itemId].auctionEnded,
            "On Auction."
        );
        require(
            idToMarketItem[itemId].pendingOffers.length > 0,
            "No Existing Offers."
        );
        require(
            IERC721(idToMarketItem[itemId].nftContract).ownerOf(
                idToMarketItem[itemId].tokenId
            ) == msg.sender && idToMarketItem[itemId].owner == msg.sender,
            "Ownership Not Verified"
        );

        address payable[] memory emptyArray;

        for (
            uint256 i = 0;
            i < idToMarketItem[itemId].pendingOffers.length;
            i++
        ) {
            if (
                idToMarketItem[itemId].pendingOffers[i] != address(0) &&
                pendingOffers[itemId][idToMarketItem[itemId].pendingOffers[i]] >
                0
            ) {
                payable(idToMarketItem[itemId].pendingOffers[i]).transfer(
                    pendingOffers[itemId][
                        idToMarketItem[itemId].pendingOffers[i]
                    ]
                );
                pendingOffers[itemId][
                    idToMarketItem[itemId].pendingOffers[i]
                ] = 0;
            }
        }

        idToMarketItem[itemId].pendingOffers = emptyArray;

        emitEvent(itemId);
    }

    function cancelMarketSale(uint256 itemId) public nonReentrant {
        require(
            idToMarketItem[itemId].owner == msg.sender,
            "Ownership Not Verified"
        );
        // require(
        //     IERC721(idToMarketItem[itemId].nftContract).ownerOf(
        //         idToMarketItem[itemId].tokenId
        //     ) == msg.sender,
        //     "You Must Be The Owner Of This NFT To Create A Market Item"
        // );

        IERC721(idToMarketItem[itemId].nftContract).transferFrom(
            address(this),
            msg.sender,
            idToMarketItem[itemId].tokenId
        );

        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].onSale = false;
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

        uint256 j = 0;
        while (endIndex > 0 && j < pageSize) {
            items[j] = idToMarketItem[j];
            j++;
            endIndex > 0;
        }

        return items;
    }
}
