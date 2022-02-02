const hre = require("hardhat");
const fs = require('fs');
const { ethers } = require("ethers");
// const { parseAmount } = require("../utils/data");

async function main() {

  const NAME = 'NFT Nation Token';
  const SYMBOL = 'NNT';
  // const TOTAL_SUPPLY = parseAmount(1000000000)
  const TOTAL_SUPPLY = ethers.utils.parseUnits("1000000000", "ether")

  const ERCToken = await hre.ethers.getContractFactory("Token");
  const ercToken = await ERCToken.deploy(NAME, SYMBOL, TOTAL_SUPPLY);
  await ercToken.deployed();
  console.log("ERC20 Token deployed to:", ercToken.address);
  
  const NFTMarket = await hre.ethers.getContractFactory("NFTMarket");
  const nftMarket = await NFTMarket.deploy(ercToken.address);
  await nftMarket.deployed(ercToken.address);
  console.log("nftMarket deployed to:", nftMarket.address);

  // await ercToken.transfer(nftMarket.address, parseAmount(500000000))
  await ercToken.transfer(nftMarket.address, ethers.utils.parseUnits("500000000", "ether"))

  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(NAME, SYMBOL);
  await nft.deployed();
  console.log("nft deployed to:", nft.address);

  let config = `
  export const nftmarketaddress = "${nftMarket.address}"
  export const nftaddress = "${nft.address}"
  export const erc20tokenaddress = "${ercToken.address}"
  `

  let data = JSON.stringify(config)
  fs.writeFileSync('config.js', JSON.parse(data))

  console.log("config returned")

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
