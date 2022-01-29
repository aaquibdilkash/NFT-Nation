// test/SimpleToken.test.js
// SPDX-License-Identifier: MIT

// Based on https://github.com/OpenZeppelin/openzeppelin-solidity/blob/v2.5.1/test/examples/SimpleToken.test.js

const { expect } = require('chai');
const { ethers } = require("hardhat");


// Import utilities from Test Helpers

// Load compiled artifacts

// Start test block
describe('ERC20Token', async function ([ creator, other ]) {

  
  const NAME = 'NFT Nation Token';
  const SYMBOL = 'NNT';
  const TOTAL_SUPPLY = ethers.utils.parseUnits("1000", "ether")
  
  beforeEach(async function () {
    const SimpleToken = await ethers.getContractFactory('ERC20Token');
    this.token = await SimpleToken.deploy(NAME, SYMBOL, TOTAL_SUPPLY, { from: creator });
  });

  it('retrieve returns a value previously stored', async function () {
    // Use large integer comparisons
    expect(await this.token.totalSupply()).to.be.bignumber.equal(TOTAL_SUPPLY);
  });

  it('has a name', async function () {
    expect(await this.token.name()).to.be.equal(NAME);
  });

  it('has a symbol', async function () {
    expect(await this.token.symbol()).to.be.equal(SYMBOL);
  });

  it('assigns the initial total supply to the creator', async function () {
    expect(await this.token.balanceOf(creator)).to.be.bignumber.equal(TOTAL_SUPPLY);
  });
});