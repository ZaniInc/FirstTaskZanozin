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

contract("DistributionContract", async ([owner, acc2, acc3, acc4]) => {

    let instanceToken;
    let instanceDistribution;

    before(async () => {
        instanceToken = await MyTokenn.deployed();
        instanceDistribution = await DistributionContract.deployed();
    });

    describe("Contract Initialyze", async () => {
        it("Mint tokens", async () => {
            expect(await instanceToken.balanceOf(owner)).to.be.bignumber.equal(ether('1000'));
        });

        it("Transfer deposit tokens", async () => {
            await instanceToken.approve(DistributionContract.address, ether('400'));
            await instanceDistribution.deposit(ether('400'));
            expect(await instanceToken.balanceOf(DistributionContract.address)).to.be.bignumber.equal(ether('400'));
            expect(await instanceToken.balanceOf(owner)).to.be.bignumber.equal(ether('600'));
        });
    });
    describe("Add beneficiaries function , fill array", async () => {

        describe("Add beneficiaries function - fail group", async () => {

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

        });

        describe("Add beneficiaries function - success group", async () => {

            it("Add beneficiaries - success", async () => {
                expect(await instanceDistribution.balanceOfBeneficiares(acc2)).to.be.bignumber.equal(new BN(0));
                expect(await instanceDistribution.balanceOfBeneficiares(acc3)).to.be.bignumber.equal(new BN(0));
                let beneficiaries_ = [acc2, acc3];
                let amounts_ = [ether('10'), ether('110')];
                let tx = await instanceDistribution.addBeneficiaries(beneficiaries_, amounts_);
                // expectEvent(tx, "RewardCollectBeneficiaries", { beneficiaries: beneficiaries_, amount: [ether('10'), ether('110')] });
                await expect(beneficiaries_.length).to.be.equal(amounts_.length);
                expect(await instanceDistribution.balanceOfBeneficiares(acc2)).to.be.bignumber.equal(ether('10'));
                expect(await instanceDistribution.balanceOfBeneficiares(acc3)).to.be.bignumber.equal(ether('110'));
            });

        });
    });

    describe("Add beneficiary function", async () => {

        describe("Add beneficiary function - fail group", async () => {

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

        });

        describe("Add beneficiary function - success group", async () => {

            it("Add beneficiary - success", async () => {
                expect(await instanceDistribution.balanceOfBeneficiares(acc4)).to.be.bignumber.equal(new BN(0));
                let tx = await instanceDistribution.addBeneficiary(acc4, ether('30'));
                expectEvent(tx, "RewardCollectBeneficiary", { beneficiary: acc4, amount: ether('30') });
                expect(await instanceDistribution.balanceOfBeneficiares(acc4)).to.be.bignumber.equal(ether('30'));
            });

        });

    });

    describe("Decrease reward function", async () => {

        describe("Decrease reward function - fail group", async () => {

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

            it("Decrease reward - must reverted , balance lower than amount ", async () => {
                await expectRevert(instanceDistribution.decreaseReward(acc3, ether('300')), "balance lower then amount_");
            });

        });

        describe("Decrease reward function - success group", async () => {
            it("Decrease reward - must success", async () => {
                expect(await instanceDistribution.balanceOfBeneficiares(acc3)).to.be.bignumber.equal(ether('110'));
                let tx = await instanceDistribution.decreaseReward(acc3, ether('30'));
                expect(await instanceDistribution.balanceOfBeneficiares(acc3)).to.be.bignumber.equal(ether('80'));
                await expectEvent(tx, "DecreaseReward", { beneficiary: acc3, amount: ether('30') });
            });
        });
    });

    describe("withdraw function", async () => {

        it("Emergency withdraw - call from not owner reverted", async () => {
            await expectRevert(instanceDistribution.emergencyWithdraw(ether('200'), { from: acc2 }), "caller is not the owner");
        });

        it("Emergency withdraw", async () => {
            expect(await instanceToken.balanceOf(owner)).to.be.bignumber.equal(ether('600'));
            let tx = await instanceDistribution.emergencyWithdraw(ether('200'));
            expect(await instanceToken.balanceOf(owner)).to.be.bignumber.equal(ether('800'));
            await expectEvent(tx, "EmergencyWithdraw", { amount: ether('200') });
        });

    });

    describe("claim", async () => {

        describe("claim/lockRewards - fail group", async () => {

            it("Lock/unlock + claim - must reverted , claim is locked ", async () => {
                await instanceDistribution.lockRewards(false);
                expect(await instanceDistribution.lockStatus()).to.be.equal(false);
                await expectRevert(instanceDistribution.claim({ from: acc2 }), 'claim is locked');
            });

            it("Lock/unlock + claim - balance 0", async () => {
                await instanceDistribution.lockRewards(true);
                expect(await instanceDistribution.lockStatus()).to.be.equal(true);
                await expectRevert(instanceDistribution.claim({ from: owner }), "balance must be > 0");
            });

            it("lockRewards function - fail , caller is not the owner", async () => {
                await expectRevert(instanceDistribution.lockRewards(true, { from: acc2 }), "caller is not the owner");
                expect(await instanceDistribution.lockStatus()).to.be.equal(true);
            });

        });
        describe("claim - success group", async () => {
            it("Lock/unlock + claim - success", async () => {
                let lock = await instanceDistribution.lockRewards(true);
                expectEvent(lock, "LockStatus", { lock: true });
                expect(await instanceDistribution.lockStatus()).to.be.equal(true);
                expect(await instanceDistribution.balanceOfBeneficiares(acc2)).to.be.bignumber.equal(ether('10'));
                let claim = await instanceDistribution.claim({ from: acc2 });
                expectEvent(claim, "ClaimInfo", { beneficiaries: acc2, amount: ether('10') });
                expect(await instanceToken.balanceOf(acc2)).to.be.bignumber.equal(ether('10'));
                expect(await instanceDistribution.balanceOfBeneficiares(acc2)).to.be.bignumber.equal(ether('0'));
            });
        });
    });
});    