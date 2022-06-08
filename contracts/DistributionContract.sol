// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title DistributionContract
 * @author ZaniInc
 * @notice This smart contract is used for sends ERC20 tokens to beneficiaries
 */
contract DistributionContract {
    using SafeERC20 for IERC20;

    /**
     * @notice store balances of beneficiaries
     * @return amounts of tokens
     */
    mapping(address => uint256) public balanceOfBeneficiares;

    /**
     * @dev contains status of claim function
     * @notice if lockStatus == false , can't call claim
     */
    bool public lockStatus;

    address private _contractOwner;
    IERC20 private _token;

    /**
     * @dev 'RewardCollect' info about success filled balance of beneficiaries
     * @notice used in two functions 'addBeneficiaries' and 'addBeneficiary'
     *
     * @param beneficiaries - account whose balance we filled
     * @param amount - how many tokens will receive by beneficiar
     */
    event RewardCollectBeneficiaries(address[] beneficiaries, uint256[] amount);

    /**
     * @dev 'RewardCollect' info about success filled balance of beneficiaries
     * @notice used in two functions 'addBeneficiaries' and 'addBeneficiary'
     *
     * @param beneficiary - account address of beneficiary
     * @param amount - how many tokens will receive by beneficiary
     */
    event RewardCollectBeneficiary(address beneficiary, uint256 amount);

    /**
     * @dev 'ClaimInfo' info about success withdraw balance by beneficiaries
     * @notice used in function 'Claim'
     *
     * @param beneficiaries - account which call function and get tokens
     * @param amount - how many tokens received to beneficiar
     */
    event ClaimInfo(address beneficiaries, uint256 amount);

    /**
     * @dev 'LockStatus' need to inform about changes of state variable 'lockStatus'
     *
     * @param lock - get 'true' or 'false' , has impact on work 'claim' function
     */
    event LockStatus(bool lock);

    /**
     * @dev 'Deposit' inform about transfer ERC20 tokens from owner to contract balance
     *
     * @param owner - address of contract owner
     * @param amount - how many tokens transfers
     */
    event Deposit(address owner, uint256 amount);

    /**
     * @dev 'DecreaseReward' inform about how much balance reduced
     *
     * @param beneficiary - address of beneficiary
     * @param amount - how many tokens will reduced
     */
    event DecreaseReward(address beneficiary, uint256 amount);

    /**
     * @dev 'EmergencyWithdraw' inform about how many tokens will
     * returns to owner balance
     *
     * @param amount - how many tokens will returns
     */
    event EmergencyWithdraw(uint256 amount);

    /**
     * @dev modifier which contains conditions who's can call functions
     *
     * NOTE : if function have 'onlyOwner' thats mean call this function
     * can only address which contained in '_contractOwner'
     */
    modifier onlyOwner() {
        require(_contractOwner == msg.sender, "caller is not the owner");
        _;
    }

    /**
     * @dev Set _token IERC20 to interact with thrid party token
     *
     * Put address to state variable '_contractOwner'
     *
     * @param myToken_ of ERC20 contract
     */
    constructor(address myToken_) {
        require(
            myToken_.code.length > 0,
            "Incorrect address , only contract address"
        );
        _token = IERC20(myToken_);
        _contractOwner = msg.sender;
    }

    /**
     * @dev send ERC20 tokens from '_contractOwner' balance to SC
     *
     * @param amount_ how many tokens send
     *
     * NOTE : this function use wrapper of safeERC20 library
     * check 'SafeERC20.sol' for more information
     */
    function deposit(uint256 amount_) external onlyOwner {
        _token.safeTransferFrom(msg.sender, address(this), amount_);
        emit Deposit(msg.sender, amount_);
    }

    /**
     * @dev filling beneficiaries balances
     *
     * @param beneficiaries_ , contains who's will get tokens
     * @param amount_ , how many tokens will get
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     * - 'beneficiaries_' & 'amount_' must have same length
     */
    function addBeneficiaries(
        address[] calldata beneficiaries_,
        uint256[] calldata amount_
    ) external onlyOwner {
        require(
            beneficiaries_.length == amount_.length,
            "arrays have different length"
        );
        for (uint256 i; i < beneficiaries_.length; i++) {
            require(
                beneficiaries_[i] != address(0) && amount_[i] != 0,
                "beneficiary or amount equal to 0"
            );
            balanceOfBeneficiares[beneficiaries_[i]] += amount_[i];
        }
        emit RewardCollectBeneficiaries(beneficiaries_, amount_);
    }

    /**
     * @dev filling beneficiary balance
     *
     * @param beneficiary_ , contains who's will get tokens
     * @param amount_ , how many tokens will get
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     */
    function addBeneficiary(address beneficiary_, uint256 amount_)
        external
        onlyOwner
    {
        require(
            amount_ != 0 && beneficiary_ != address(0),
            "beneficiary or amount equal to 0"
        );
        balanceOfBeneficiares[beneficiary_] += amount_;
        emit RewardCollectBeneficiary(beneficiary_, amount_);
    }

    /**
     * @dev decrease balance of beneficiary
     *
     * @param beneficiary_ , contains which balance will reduced
     * @param amount_ , how many tokens will reduced
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     */
    function decreaseReward(address beneficiary_, uint256 amount_)
        external
        onlyOwner
    {
        require(
            amount_ != 0 && beneficiary_ != address(0),
            "beneficiary or amount equal to 0"
        );
        require(
            balanceOfBeneficiares[beneficiary_] >= amount_,
            "balance lower then amount_"
        );
        balanceOfBeneficiares[beneficiary_] -= amount_;
        emit DecreaseReward(beneficiary_, amount_);
    }

    /**
     * @dev this function allow owner get back tokens
     *
     * @param amount_ , how many tokens will withdraw
     *
     */
    function emergencyWithdraw(uint256 amount_) external onlyOwner {
        _token.safeTransfer(msg.sender, amount_);
        emit EmergencyWithdraw(amount_);
    }

    /**
     * @dev change state of 'lockStatus'
     *
     * @param lock_ , contains boolean value
     *
     * NOTE : this function affects the ability of the beneficiary
     * to receive tokens
     */
    function lockRewards(bool lock_) external onlyOwner {
        lockStatus = lock_;
        emit LockStatus(lockStatus);
    }

    /**
     * @dev this function allows beneficiary to withdraw
     * their tokens
     *
     * NOTE : send all tokens that are available on the balance
     *
     */
    function claim() external {
        require(lockStatus, "claim is locked !");
        require(balanceOfBeneficiares[msg.sender] > 0, "balance must be > 0");
        uint256 amount = balanceOfBeneficiares[msg.sender];
        balanceOfBeneficiares[msg.sender] = 0;
        _token.safeTransfer(msg.sender, amount);
        emit ClaimInfo(msg.sender, amount);
    }
}
