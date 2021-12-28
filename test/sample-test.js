const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarket", () => {
  it("Should create and execute market sales", async () => {
    const Market = await ethers.getContractFactory("NFTMarket")
    const market = await Market.deploy()
    await market.deployed()
    const marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT")
    const nft = await NFT.deploy(marketAddress)
    await nft.deployed()
    const nftContractAddress = nft.address

    const auctionPrice = ethers.utils.parseUnits("100", "ether")

    await nft.createToken("https://www.mytokenlocation.com")
    await nft.createToken("https://www.mytokenlocation2.com")
    await nft.createToken("https://www.mytokenlocation3.com")
  
    await market.createMarketItem(nftContractAddress, 1, auctionPrice)
    await market.createMarketItem(nftContractAddress, 2, auctionPrice )
    await market.createMarketItem(nftContractAddress, 3, auctionPrice )
    
    const [_, buyerAddress] = await ethers.getSigners()

    // await market.connect(buyerAddress).executeMarketSale(nftContractAddress, 1, { value: auctionPrice})

    // items = await market.fetchMarketItems()
    // items = await Promise.all(items.map(async i => {
    //   const tokenUri = await nft.tokenURI(i.tokenId)
    //   let item = {
    //     price: i.price.toString(),
    //     tokenId: i.tokenId.toString(),
    //     seller: i.seller,
    //     owner: i.owner,
    //     tokenUri
    //   }
    //   return item
    // }))
    // console.log('items Market items: ', items)



    await market.cancelSale(nftContractAddress, 1)
    await market.cancelSale(nftContractAddress, 2)

    items = await market.fetchMarketItems()
    items = await Promise.all(items.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId)
      let item = {
        itemId: i.itemId.toString(),
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item
    }))

    // result = await market.idToMarketItem(4)
    // console.log(result)
    console.log('before cancelling sale items Market items: ', items)

    await market.createMarketSale(nftContractAddress, 1, auctionPrice)

    items = await market.fetchMarketItems()
    items = await Promise.all(items.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId)
      let item = {
        itemId: i.itemId.toString(),
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item
    }))

    // result = await market.idToMarketItem(4)
    // console.log(result)
    console.log('after cancelling sale items Market items: ', items)



    // items = await market.fetchMyNFTs()
    // items = await Promise.all(items.map(async i => {
    //   const tokenUri = await nft.tokenURI(i.tokenId)
    //   let item = {
    //     price: i.price.toString(),
    //     tokenId: i.tokenId.toString(),
    //     seller: i.seller,
    //     owner: i.owner,
    //     tokenUri
    //   }
    //   return item
    // }))
    // console.log('items My NFTs: ', items)


    // items = await market.fetchItemsCreated()
    // items = await Promise.all(items.map(async i => {
    //   const tokenUri = await nft.tokenURI(i.tokenId)
    //   let item = {
    //     price: i.price.toString(),
    //     tokenId: i.tokenId.toString(),
    //     seller: i.seller,
    //     owner: i.owner,
    //     tokenUri
    //   }
    //   return item
    // }))
    // console.log('items Items created: ', items)
  });
});
