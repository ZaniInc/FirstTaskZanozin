// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DistributionContract {
    mapping(address => uint256) public balanceOfBeneficiares;

    bool public lockStatus;

    address private _contractOwner;
    IERC20 private _token;

    event RewardCollect(
        address beneficiaries_,
        uint256 amount_,
        bool transferStatus_
    );
    event ClaimInfo(address beneficiaries_, uint256 amount_);
    event LockStatus(bool lock);

    modifier onlyOwner() {
        require(_contractOwner == msg.sender, "caller is not the owner");
        _;
    }

    constructor(address myToken_) {
        _token = IERC20(myToken_);
        _contractOwner = msg.sender;
    }

    function deposit(uint256 amount_) external onlyOwner {
        _token.transferFrom(msg.sender, address(this), amount_);
    }

    function addBeneficiaries(
        address[] calldata beneficiaries_,
        uint256[] calldata amount_
    ) external onlyOwner {
        for (uint256 i; i < beneficiaries_.length; i++) {
            require(
                beneficiaries_[i] != address(0) && amount_[i] != 0,
                "beneficiary or amount equal to 0"
            );
            require(
                beneficiaries_.length == amount_.length,
                "arrays have different length"
            );
            balanceOfBeneficiares[beneficiaries_[i]] += amount_[i];
            emit RewardCollect(beneficiaries_[i], amount_[i], true);
        }
    }

    function addBeneficiary(address beneficiary_, uint256 amount_)
        external
        onlyOwner
    {
        require(
            amount_ != 0 && beneficiary_ != address(0),
            "beneficiary or amount equal to 0"
        );
        balanceOfBeneficiares[beneficiary_] += amount_;
        emit RewardCollect(beneficiary_, amount_, true);
    }

    function decreaseReward(address beneficiary_, uint256 amount_)
        external
        onlyOwner
    {
        require(
            amount_ != 0 && beneficiary_ != address(0),
            "beneficiary or amount equal to 0"
        );
        balanceOfBeneficiares[beneficiary_] -= amount_;
    }

    function emergencyWithdraw(uint256 amount_) external onlyOwner {
        _token.transfer(msg.sender, amount_);
    }

    function lockRewards(bool lock_) external onlyOwner {
        lockStatus = lock_;
        emit LockStatus(lockStatus);
    }

    function claim() external {
        require(lockStatus, "claim is locked !");
        require(balanceOfBeneficiares[msg.sender] > 0, "balance must be > 0");
        uint256 amount = balanceOfBeneficiares[msg.sender];
        balanceOfBeneficiares[msg.sender] = 0;
        _token.transfer(msg.sender, amount);
        emit ClaimInfo(msg.sender, amount);
    }
}
