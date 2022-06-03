const DistributionContract = artifacts.require("./DistributionContract");
const MyTokenn = artifacts.require("./MyTokenn");

const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

contract("Distribution contract", async ([owner,acc2,acc3,acc4]) => {

    let instanceToken;
    let instanceDistribution;

    beforeEach("",async() => {
        instanceToken = await MyTokenn.deployed();
        instanceDistribution = await DistributionContract.deployed();
    })

    it("Mint tokens", async () => {
        expect(await instanceToken.balanceOf(owner)).to.be.bignumber.equal(new BN(100));
    });

    it("Transfer deposit tokens", async () => {
        let approve = await instanceToken.approve(DistributionContract.address,new BN(40));
        let deposit = await instanceDistribution.deposit(new BN(40));
        expect(await instanceToken.balanceOf(DistributionContract.address)).to.be.bignumber.equal(new BN(40));
        expect(await instanceToken.balanceOf(owner)).to.be.bignumber.equal(new BN(60));
    });

    it("Add beneficiaries", async () => {
        let beneficiaries = [acc2,acc3];
        let amounts = [new BN(1),new BN(11)];
        let addBeneficiariesFunc = await instanceDistribution.addBeneficiaries(beneficiaries,amounts);
        // expect(await instanceDistribution.showArray()).to.have.lengthOf(2);
        // expect(await instanceDistribution.showArrayB()).to.have.lengthOf(2);
    });

    it("Add beneficiary", async () => {
        let addBeneficiaryFunc = await instanceDistribution.addBeneficiary(acc4,new BN(3));
        expect(await instanceDistribution.beneficiaryList(2)).to.be.eq(acc4);
        expect(await instanceDistribution.amountTokensForBencefiares([2])).to.be.bignumber.equal(new BN(3));
    });

    it("Decrease reward", async () => {
        let decreaseReward = await instanceDistribution.decreaseReward(acc3,new BN(3));
        expect(await instanceDistribution.balanceOfBeneficiares(acc3)).to.be.bignumber.equal(new BN(8));
    });

    it("Emergency withdraw" , async () => {
        let emergencyWithdraw = await instanceDistribution.emergencyWithdraw(new BN(20));
        expect(await instanceToken.balanceOf(owner)).to.be.bignumber.equal(new BN(80));
    });

    it("Lock/unlock + claim - must reverted" , async () => {
        let lockRewards = await instanceDistribution.lockRewards(false);
        expect(await instanceDistribution.lockStatus()).to.be.eq(false);
        await expect(instanceDistribution.claim({from: acc2})).to.be.rejectedWith("claim is locked !");
    });

    it("Lock/unlock + claim - success" , async () => {
        let lockRewards = await instanceDistribution.lockRewards(true);
        expect(await instanceDistribution.lockStatus()).to.be.eq(true);
        let claim = await instanceDistribution.claim({from: acc2});
        expect(await instanceToken.balanceOf(acc2)).to.be.bignumber.equal(new BN(1));
        
    });
});    