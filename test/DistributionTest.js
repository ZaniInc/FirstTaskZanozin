const DistributionContract = artifacts.require("./DistributionContract");
const MyTokenn = artifacts.require("./MyTokenn");

const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

contract("Distribution contract", accounts => {

    const [owner,acc2,acc3,acc4] = accounts;

    it("Mint tokens", async () => {
        let instanceToken = await MyTokenn.deployed();
        let instanceDistribution = await DistributionContract.deployed();
        let mintToken = await instanceToken.testMint();
        expect(await instanceToken.balanceOf(owner)).to.be.a.bignumber.eq(new BN(100));
    });

    it("Transfer deposit tokens", async () => {
        let instanceToken = await MyTokenn.deployed();
        let instanceDistribution = await DistributionContract.deployed();
        let approve = await instanceToken.approve(DistributionContract.address,new BN(40));
        let deposit = await instanceDistribution.deposit(new BN(40));
        expect(await instanceToken.balanceOf(DistributionContract.address)).to.be.a.bignumber.eq(new BN(40));
        expect(await instanceToken.balanceOf(owner)).to.be.a.bignumber.eq(new BN(60));
    });

    it("Add beneficiaries", async () => {
        let instanceToken = await MyTokenn.deployed();
        let instanceDistribution = await DistributionContract.deployed();
        let beneficiaries = [acc2,acc3];
        let amounts = [new BN(1),new BN(11)];
        let addBeneficiariesFunc = await instanceDistribution.addBeneficiaries(beneficiaries,amounts);
        console.log(await instanceDistribution.showArray());
        console.log(await instanceDistribution.showArrayB());
    });

    it("Add beneficiary", async () => {
        let instanceDistribution = await DistributionContract.deployed();
        let addBeneficiaryFunc = await instanceDistribution.addBeneficiary(acc4,new BN(3));
        console.log(await instanceDistribution.showArray());
        console.log(await instanceDistribution.showArrayB());
    });

    it("Decrease reward", async () => {
        let instanceDistribution = await DistributionContract.deployed();
        let decreaseReward = await instanceDistribution.decreaseReward(1,new BN(3));
        console.log(await instanceDistribution.showArrayB());
    });

    it("Emergency withdraw" , async () => {
        let instanceDistribution = await DistributionContract.deployed();
        let instanceToken = await MyTokenn.deployed();
        let emergencyWithdraw = await instanceDistribution.emergencyWithdraw(new BN(20));
        expect(await instanceToken.balanceOf(owner)).to.be.a.bignumber.eq(new BN(80));
    });

    it("Lock/unlock + claim - must reverted" , async () => {
        let instanceDistribution = await DistributionContract.deployed();
        let instanceToken = await MyTokenn.deployed();
        let lockRewards = await instanceDistribution.lockRewards(false);
        expect(await instanceDistribution.lockStatus()).to.be.eq(false);
        expect(await instanceDistribution.claim({from: acc2})).to.be.revertedWith("claim is locked !");
    });

    it("Lock/unlock + claim - success" , async () => {
        let instanceDistribution = await DistributionContract.deployed();
        let instanceToken = await MyTokenn.deployed();
        let lockRewards = await instanceDistribution.lockRewards(true);
        expect(await instanceDistribution.lockStatus()).to.be.eq(true);
        let claim = await instanceDistribution.claim({from: acc2});
        expect(await instanceToken.balanceOf(acc2)).to.be.a.bignumber.eq(new BN(1));
        
    });
});    