// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract PaymentSettings {
    //inputs
    // 1)userid 2)PayInsViaCircle 3)userWalletAdd 4)subnetWalletAdd 5)PayoutsViaCircle 6)PayInPaymentType 7)PayOutPaymentType
    mapping(string => string[]) map; // user id --> all datas
    string[] userIdArray;

    function savePaymentSettings(string[][] memory values) public {
        uint256 i;
        for (i = 0; i < values.length; i++) {
            map[values[i][0]] = values[i]; // pushing all datas for user id
            userIdArray.push(values[i][0]);
        }
    }

    function updatePaymentSettings(string[][] memory values) public {
        uint256 i;
        for (i = 0; i < values.length; i++) {
            map[values[i][0]] = values[i]; // pushing all datas for uid
        }
    }

    function getPaymentByUserId(string memory userId)
        public
        view
        returns (string[] memory)
    {
        return map[userId];
    }
}
