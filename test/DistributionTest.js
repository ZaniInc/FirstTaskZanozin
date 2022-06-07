const DistributionContract = artifacts.require("./DistributionContract");
const MyTokenn = artifacts.require("./MyTokenn");

const {
    ether,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');



const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

contract("Distribution contract", async ([owner, acc2, acc3, acc4]) => {

    let instanceToken;
    let instanceDistribution;

    before(async () => {
        instanceToken = await MyTokenn.deployed();
        instanceDistribution = await DistributionContract.deployed();
    });

    it("Mint tokens", async () => {
        expect(await instanceToken.balanceOf(owner)).to.be.bignumber.equal(ether('1000'));
    });

    it("Transfer deposit tokens", async () => {
        await instanceToken.approve(DistributionContract.address, ether('400'));
        await instanceDistribution.deposit(ether('400'));
        expect(await instanceToken.balanceOf(DistributionContract.address)).to.be.bignumber.equal(ether('400'));
        expect(await instanceToken.balanceOf(owner)).to.be.bignumber.equal(ether('600'));
    });

    describe("Add beneficiaries function , fill array", async () => {

        it("Add beneficiaries - fail , address = 0", async () => {
            let addr = constants.ZERO_ADDRESS;
            let beneficiaries = [addr, acc3];
            let amounts = [ether('10'), ether('110')];
            await expectRevert(instanceDistribution.addBeneficiaries(beneficiaries, amounts), "beneficiary or amount equal to 0");
        });

        it("Add beneficiaries - fail , caller is not owner", async () => {
            let beneficiaries = [acc2, acc3];
            let amounts = [ether('10'), ether('110')];
            await expectRevert(instanceDistribution.addBeneficiaries(beneficiaries, amounts, { from: acc2 }), "caller is not the owner");
        });

        it("Add beneficiaries - Array length error", async () => {
            let beneficiaries = [acc2, acc3];
            let amounts = [ether('10'), ether('110'), ether('12')];
            await expectRevert(instanceDistribution.addBeneficiaries(beneficiaries, amounts), "arrays have different length");

        });

        it("Add beneficiaries - success", async () => {
            let beneficiaries = [acc2, acc3];
            let amounts = [ether('10'), ether('110')];
            let _beneficiaries = await instanceDistribution.addBeneficiaries(beneficiaries, amounts);
            expectEvent(_beneficiaries, "RewardCollect", { beneficiaries_: acc2, amount_: ether('10'), transferStatus_: true });
            expectEvent(_beneficiaries, "RewardCollect", { beneficiaries_: acc3, amount_: ether('110'), transferStatus_: true });
            await expect(beneficiaries.length).to.be.equal(amounts.length)
        });

    });

    describe("Add beneficiary function", async () => {

        it("Add beneficiary - reverted , address = 0", async () => {
            let addr = constants.ZERO_ADDRESS;
            await expectRevert(instanceDistribution.addBeneficiary(addr, ether('30')), "beneficiary or amount equal to 0");
        });

        it("Add beneficiary - reverted , amount = 0", async () => {
            await expectRevert(instanceDistribution.addBeneficiary(acc4, new BN(0)), "beneficiary or amount equal to 0");
        });

        it("Add beneficiary - reverted , caller is not owner", async () => {
            await expectRevert(instanceDistribution.addBeneficiary(acc4, new BN(0), { from: acc2 }), "caller is not the owner");
        });

        it("Add beneficiary - success", async () => {
            let beneficiar = await instanceDistribution.addBeneficiary(acc4, ether('30'));
            expectEvent(beneficiar, "RewardCollect", { beneficiaries_: acc4, amount_: ether('30'), transferStatus_: true });
            expect(await instanceDistribution.balanceOfBeneficiares(acc4)).to.be.bignumber.equal(ether('30'));
        });

    });

    describe("Decrease reward function", async () => {

        it("Decrease reward - must reverted , amount = 0", async () => {
            await expectRevert(instanceDistribution.decreaseReward(acc3, new BN(0)), "beneficiary or amount equal to 0");
        });

        it("Decrease reward - must reverted , address = 0", async () => {
            let addr = constants.ZERO_ADDRESS;
            await expectRevert(instanceDistribution.decreaseReward(addr, ether('30')), "beneficiary or amount equal to 0");
        });

        it("Decrease reward - must reverted , caller is not the owner ", async () => {
            await expectRevert(instanceDistribution.decreaseReward(acc3, ether('30'), { from: acc2 }), "caller is not the owner");
        });

        it("Decrease reward - must success", async () => {
            await instanceDistribution.decreaseReward(acc3, ether('30'));
            expect(await instanceDistribution.balanceOfBeneficiares(acc3)).to.be.bignumber.equal(ether('80'));
        });
    });

    describe("withdraw function", async () => {

        it("Emergency withdraw - call from not owner reverted", async () => {
            await expectRevert(instanceDistribution.emergencyWithdraw(ether('200'), { from: acc2 }), "caller is not the owner");
        });

        it("Emergency withdraw", async () => {
            await instanceDistribution.emergencyWithdraw(ether('200'));
            expect(await instanceToken.balanceOf(owner)).to.be.bignumber.equal(ether('800'));
        });

    });

    describe("claim", async () => {

        it("Lock/unlock + claim - must reverted , claim is locked ", async () => {
            await instanceDistribution.lockRewards(false);
            expect(await instanceDistribution.lockStatus()).to.be.eq(false);
            await expectRevert(instanceDistribution.claim({ from: acc2 }), 'claim is locked');
        });

        it("Lock/unlock + claim - balance 0", async () => {
            await instanceDistribution.lockRewards(true);
            expect(await instanceDistribution.lockStatus()).to.be.eq(true);
            await expectRevert(instanceDistribution.claim({ from: owner }), "balance must be > 0");
        });

        it("Lock/unlock + claim - success", async () => {
            let lock = await instanceDistribution.lockRewards(true);
            expectEvent(lock, "LockStatus", { lock: true });
            expect(await instanceDistribution.lockStatus()).to.be.eq(true);
            let claim = await instanceDistribution.claim({ from: acc2 });
            expectEvent(claim, "ClaimInfo", { beneficiaries_: acc2, amount_: ether('10') });
            expect(await instanceToken.balanceOf(acc2)).to.be.bignumber.equal(ether('10'));
        });
    });
});    