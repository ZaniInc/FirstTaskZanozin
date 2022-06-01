const DistributionContract = artifacts.require("./DistributionContract");
const MyTokenn = artifacts.require("./MyTokenn");

const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

contract("Distribution contract", accounts => {

    const [owner,acc2,acc3] = accounts;

    it("Mint tokens", async () => {
        let instanceToken = await MyTokenn.deployed();
        let instanceDistribution = await DistributionContract.deployed();
        let mintToken = await instanceToken.testMint();
        expect(await instanceToken.balanceOf(owner)).to.be.a.bignumber.eq(new BN(100));
        console.log(await instanceToken.balanceOf(owner));
    });

    it("Transfer deposit tokens", async () => {
        let instanceToken = await MyTokenn.deployed();
        let instanceDistribution = await DistributionContract.deployed();
        let deposit = await instanceDistribution.deposit(new BN(20));
        // expect(await instanceToken.balanceOf(DistributionContract)).to.be.a.bignumber.eq(new BN(20));
    });
});    