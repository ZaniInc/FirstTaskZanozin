var MyTokenn = artifacts.require("./MyTokenn.sol");
var DistributionContract = artifacts.require("./DistributionContract.sol");

module.exports = async function(deployer) {
  await deployer.deploy(MyTokenn);
  await deployer.deploy(DistributionContract , MyTokenn.address);
};
