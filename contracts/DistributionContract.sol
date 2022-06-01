// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DistributionContract {


    struct beneficiaryMain {
        address _addressOfBeneficiary;
        uint256 _reward;
        bool transferStatus;
    }

    mapping(address=>uint256)_deposit;
    mapping(address => beneficiaryMain)listOfBeneficiaries;

    beneficiaryMain [] beneficiary;

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

    function addBeneficiaries (address _beneficiaries , uint256 _amount) public onlyOwner {

        listOfBeneficiaries[_beneficiaries]._addressOfBeneficiary = _beneficiaries;
        listOfBeneficiaries[_beneficiaries]._reward = _amount;
    }

    function addBeneficiary (address _beneficiary , uint256 _amount) public onlyOwner {

        listOfBeneficiaries[_beneficiary]._addressOfBeneficiary = _beneficiary;
        listOfBeneficiaries[_beneficiary]._reward = _amount;
    }

    function decreaseReward (address _beneficiary , uint256 _amount) public onlyOwner {
        listOfBeneficiaries[_beneficiary]._reward = _amount;
    }

    function emergencyWithdraw (uint256 _amount) public onlyOwner {
        token.transferFrom(address(this),contractOwner, _amount);
    }

    function lockRewards (uint256 beneficiaryIndex) public onlyOwner {
        if(beneficiary[beneficiaryIndex].transferStatus == false) {
            beneficiary[beneficiaryIndex].transferStatus = true;
        }
        else if(beneficiary[beneficiaryIndex].transferStatus == true) {
            beneficiary[beneficiaryIndex].transferStatus = false;
        }
    }

    function claim () public {
        token.transferFrom(address(this),
        listOfBeneficiaries[msg.sender]._addressOfBeneficiary,
        listOfBeneficiaries[msg.sender]._reward);
    }



}    