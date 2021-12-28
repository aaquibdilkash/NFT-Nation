// const { expect } = require("chai");
// const { ethers } = require("hardhat");

// describe("NFTMarket", async () => {
//   let Market;
//   let market;
//   let marketAddress;
//   let NFT;
//   let nft;
//   let nftContractAddress;
//   let auctionPrice = ethers.utils.parseUnits("100", "ether");
//   const [owner, adr1, addr2, addr3] = await ethers.getSigners();

//   Market = await ethers.getContractFactory("NFTMarket");
//   market = await Market.deploy();
//   await market.deployed();
//   marketAddress = market.address;

//   NFT = await ethers.getContractFactory("NFT");
//   nft = await NFT.deploy(marketAddress);
//   await nft.deployed();
//   nftContractAddress = nft.address;


//   it("should create token", async () => {
//     result = await nft.createToken("https://www.mytokenlocation.com");
//     console.log(result);
//   });

  // it("Should create and list on market", async () => {
  //     result = await nft.createToken("https://www.mytokenlocation.com");
  //     // await nft.createToken("https://www.mytokenlocation2.com");

  //     await market.connect(adr1).createMarketItem(nftContractAddress, 1, auctionPrice);
  //     // await market.createMarketItem(nftContractAddress, 2, auctionPrice);

  //     items = await market.fetchMarketItems();
  //     items = await Promise.all(
  //       items.map(async (i) => {
  //         const tokenUri = await nft.tokenURI(i.tokenId);
  //         let item = {
  //           price: i.price.toString(),
  //           tokenId: i.tokenId.toString(),
  //           seller: i.seller,
  //           owner: i.owner,
  //           tokenUri,
  //         };
  //         return item;
  //       })
  //     );
  //     console.log("items Market items: ", items);

  //     // await market
  //     //   .connect(buyerAddress)
  //     //   .createMarketSale(nftContractAddress, 1, { value: auctionPrice });

  //     items = await market.fetchMarketItems();
  //     items = await Promise.all(
  //       items.map(async (i) => {
  //         const tokenUri = await nft.tokenURI(i.tokenId);
  //         let item = {
  //           price: i.price.toString(),
  //           tokenId: i.tokenId.toString(),
  //           seller: i.seller,
  //           owner: i.owner,
  //           tokenUri,
  //         };
  //         return item;
  //       })
  //     );
  //     console.log("items Market items: ", items);

  //     items = await market.fetchMyNFTs();
  //     items = await Promise.all(
  //       items.map(async (i) => {
  //         const tokenUri = await nft.tokenURI(i.tokenId);
  //         let item = {
  //           price: i.price.toString(),
  //           tokenId: i.tokenId.toString(),
  //           seller: i.seller,
  //           owner: i.owner,
  //           tokenUri,
  //         };
  //         return item;
  //       })
  //     );
  //     console.log("items My NFTs: ", items);

  //     items = await market.fetchItemsCreated();
  //     items = await Promise.all(
  //       items.map(async (i) => {
  //         const tokenUri = await nft.tokenURI(i.tokenId);
  //         let item = {
  //           price: i.price.toString(),
  //           tokenId: i.tokenId.toString(),
  //           seller: i.seller,
  //           owner: i.owner,
  //           tokenUri,
  //         };
  //         return item;
  //       })
  //     );
  //     console.log("items Items created: ", items);
  // })
// });
