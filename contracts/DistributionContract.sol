// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DistributionContract {

    mapping(address=>uint256)_balanceOfBeneficiares;

    address [] beneficiaryList;
    uint [] amountTokensForBencefiares;

    address contractOwner;
    bool public lockStatus;
    IERC20 private token;

    constructor (address _myToken) {
        token = IERC20(_myToken);
        contractOwner = msg.sender;
    }

    modifier onlyOwner () {
        require(contractOwner==msg.sender);
        _;
    }

    function deposit (uint256 _amount) public onlyOwner {
        
        // token.transfer(address(this) , _amount); - doesn't work in test
        token.transferFrom(msg.sender,address(this), _amount);
    }

    function addBeneficiaries (address [] memory _beneficiaries , uint256 [] memory _amount) public onlyOwner {
        for(uint256 a = 0 ; a < _beneficiaries.length ; a++){
            _balanceOfBeneficiares[_beneficiaries[a]] = _amount[a];
            beneficiaryList.push(_beneficiaries[a]);
            amountTokensForBencefiares.push(_amount[a]);
        }
    }

    function addBeneficiary (address _beneficiary , uint256 _amount) public onlyOwner {
        require(_amount != 0 && _beneficiary != address(0));
        beneficiaryList.push(_beneficiary);
        amountTokensForBencefiares.push(_amount);
         _balanceOfBeneficiares[_beneficiary] = _amount;
    }

    function decreaseReward (uint _beneficiary , uint256 _amount) public onlyOwner {
        require(_amount != 0 && _beneficiary != 0);
        amountTokensForBencefiares[_beneficiary] -= _amount;
    }

    function emergencyWithdraw (uint256 _amount) public onlyOwner {
        token.transfer(msg.sender, _amount);
    }

    function lockRewards (bool lock) public onlyOwner returns (bool status){
            lockStatus = lock;
            return lockStatus;
    }

    function claim () public {
        require(lockStatus == true , "claim is locked !");
        uint256 amount = _balanceOfBeneficiares[msg.sender];
        _balanceOfBeneficiares[msg.sender] = 0;
        token.transfer(msg.sender , amount);
    }

    function showArray () public view returns (address [] memory) {
        return beneficiaryList;
    }

     function showArrayB () public view returns (uint [] memory) {
        return amountTokensForBencefiares;
    }



}    