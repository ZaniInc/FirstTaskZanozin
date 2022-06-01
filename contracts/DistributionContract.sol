// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DistributionContract {


    struct beneficiary {
        address _addressOfBeneficiary;
        uint256 _reward;
        bool transferStatus;
    }

    mapping(address=>uint256)_deposit;

    beneficiary [] beneficiaryList;

    address contractOwner;
    IERC20 private token;

    constructor (address _myToken) {
        token = IERC20(_myToken);
    }

    modifier onlyOwner () {
        require(contractOwner==msg.sender);
        _;
    }

    function deposit (uint256 _amount) public onlyOwner {
        _deposit[contractOwner] += _amount;
        token.transferFrom(contractOwner, address(this), _amount);
    }

    function addBeneficiaries (uint256 _beneficiaries , uint256 _amount) public onlyOwner {

        for(uint256 a = 0 ; a <= _beneficiaries ; a++){
             beneficiaryList[a]._reward = _amount;
             beneficiaryList[a].transferStatus = false;
        }
    }

    function addBeneficiary (address _beneficiary , uint256 _amount) public onlyOwner {

        beneficiaryList.push(beneficiary(_beneficiary,_amount,false));
    }

    function decreaseReward (uint _beneficiary , uint256 _amount) public onlyOwner {
        beneficiaryList[_beneficiary]._reward = _amount;
    }

    function emergencyWithdraw (uint256 _amount) public onlyOwner {
        token.transferFrom(address(this),contractOwner, _amount);
    }

    function lockRewards (uint256 beneficiaryIndex) public onlyOwner {
        if(beneficiaryList[beneficiaryIndex].transferStatus == false) {
            beneficiaryList[beneficiaryIndex].transferStatus = true;
        }
        else if(beneficiaryList[beneficiaryIndex].transferStatus == true) {
            beneficiaryList[beneficiaryIndex].transferStatus = false;
        }
    }

    function claim () public {
        token.transferFrom(address(this),
        beneficiaryList[msg.sender]._addressOfBeneficiary,
        beneficiaryList[msg.sender]._reward);
    }



}    