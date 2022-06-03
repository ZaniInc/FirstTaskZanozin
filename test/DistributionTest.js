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
        expect(await instanceToken.balanceOf(owner)).to.be.bignumber.equal(web3.utils.toWei("1000","ether"));
    });

    it("Transfer deposit tokens", async () => {
        await instanceToken.approve(DistributionContract.address,web3.utils.toWei("400","ether"));
        await instanceDistribution.deposit(web3.utils.toWei("400","ether"));
        expect(await instanceToken.balanceOf(DistributionContract.address)).to.be.bignumber.equal(web3.utils.toWei("400","ether"));
        expect(await instanceToken.balanceOf(owner)).to.be.bignumber.equal(web3.utils.toWei("600","ether"));
    });

    describe ("Add beneficiaries function , fill array", async() => { 

        it("Add beneficiaries - fail , address = 0", async () => {
            let addr = "0x0000000000000000000000000000000000000000";
            let beneficiaries = [addr,acc3];
            let amounts = [web3.utils.toWei("10","ether"),web3.utils.toWei("110","ether")];
            await expect(instanceDistribution.addBeneficiaries(beneficiaries,amounts)).to.be.rejectedWith("beneficiary address equal to 0");
        });

        it("Add beneficiaries - fail , caller is not owner", async () => {
            let beneficiaries = [acc2,acc3];
            let amounts = [web3.utils.toWei("10","ether"),web3.utils.toWei("110","ether")];
            await expect(instanceDistribution.addBeneficiaries(beneficiaries,amounts,{from:acc2})).to.be.rejectedWith("caller is not the owner");
        });

        it("Add beneficiaries - success", async () => {
            let beneficiaries = [acc2,acc3];
            let amounts = [web3.utils.toWei("10","ether"),web3.utils.toWei("110","ether")];
            await instanceDistribution.addBeneficiaries(beneficiaries,amounts);
            expect(await instanceDistribution.beneficiaryList.length()).to.be.bignumber.equal(new BN(2));
            expect(await instanceDistribution.amountTokensForBencefiares.length()).to.be.bignumber.equal(new BN(2));
        });

    });

    describe ("Add beneficiary function", async() => { 

        it("Add beneficiary - reverted , address = 0", async () => {
            let addr = "0x0000000000000000000000000000000000000000";
            await expect(instanceDistribution.addBeneficiary(addr,web3.utils.toWei("30","ether"))).to.be.rejectedWith("beneficiary or amount equal to 0");
        });

        it("Add beneficiary - reverted , amount = 0", async () => {
            await expect(instanceDistribution.addBeneficiary(acc4,new BN(0))).to.be.rejectedWith("beneficiary or amount equal to 0");
        });

        it("Add beneficiary - reverted , caller is not owner", async () => {
            await expect(instanceDistribution.addBeneficiary(acc4,web3.utils.toWei("30","ether"),{from:acc2})).to.be.rejectedWith("caller is not the owner");
        });

        it("Add beneficiary - success", async () => {
            await instanceDistribution.addBeneficiary(acc4,web3.utils.toWei("30","ether"));
            expect(await instanceDistribution.beneficiaryList(2)).to.be.eq(acc4);
            expect(await instanceDistribution.amountTokensForBencefiares([2])).to.be.bignumber.equal(web3.utils.toWei("30","ether"));
        });

    });

    describe ("Decrease reward function", async() => { 

        it("Decrease reward - must reverted , amount = 0", async () => {
            await expect(instanceDistribution.decreaseReward(acc3,new BN(0))).to.be.rejectedWith("beneficiary or amount equal to 0");
        });

        it("Decrease reward - must reverted , address = 0", async () => {
            let addr = "0x0000000000000000000000000000000000000000"
            await expect(instanceDistribution.decreaseReward(addr,web3.utils.toWei("30","ether"))).to.be.rejectedWith("beneficiary or amount equal to 0");
        });

        it("Decrease reward - must reverted , caller is not the owner ", async () => {
            await expect(instanceDistribution.decreaseReward(acc3,web3.utils.toWei("30","ether"),{from:acc2})).to.be.rejectedWith("caller is not the owner");
        });

        it("Decrease reward - must success", async () => {
            await instanceDistribution.decreaseReward(acc3,web3.utils.toWei("30","ether"));
            expect(await instanceDistribution.balanceOfBeneficiares(acc3)).to.be.bignumber.equal(web3.utils.toWei("80","ether"));
        });
    });

    describe ("withdraw function", async() => { 

        it("Emergency withdraw - call from not owner reverted" , async () => {
            await expect(instanceDistribution.emergencyWithdraw(web3.utils.toWei("200","ether"),{from:acc2})).to.be.rejectedWith("caller is not the owner");
        });

        it("Emergency withdraw" , async () => {
            await instanceDistribution.emergencyWithdraw(web3.utils.toWei("200","ether"));
            expect(await instanceToken.balanceOf(owner)).to.be.bignumber.equal(web3.utils.toWei("800","ether"));
        });

    });

    describe ("claim", async() => { 

        it("Lock/unlock + claim - must reverted" , async () => {
            await instanceDistribution.lockRewards(false);
            expect(await instanceDistribution.lockStatus()).to.be.eq(false);
            await expect(instanceDistribution.claim({from: acc2})).to.be.rejectedWith("claim is locked !");
        });
    
        it("Lock/unlock + claim - success" , async () => {
            await instanceDistribution.lockRewards(true);
            expect(await instanceDistribution.lockStatus()).to.be.eq(true);
            await instanceDistribution.claim({from: acc2});
            expect(await instanceToken.balanceOf(acc2)).to.be.bignumber.equal(web3.utils.toWei("10","ether"));
            
        });
     });
});    