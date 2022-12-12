// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract PaymentRules {
    //inputs
    // 1)uniqueID 2)dealId 3)underwriterId 4)paymentRule 5)amount paid 6)month 7)year
    mapping(string => string) map1; //deal id --> u id
    mapping(string => string[]) map; // uid --> all datas
    string[] uniqueIdArray;

    function createPaymentRule(string[][] memory values) public {
        uint256 i;
        for (i = 0; i < values.length; i++) {
            map1[values[i][1]] = values[i][0]; // dealId  --> uid
            map[values[i][0]] = values[i]; // pushing all datas for uid
            uniqueIdArray.push(values[i][0]);
        }
    }

    function updatePaymentRule(string[][] memory values) public {
        uint256 i;
        for (i = 0; i < values.length; i++) {
            map1[values[i][1]] = values[i][0]; // dealid  --> uid
            map[values[i][0]] = values[i]; // pushing all datas for uid
        }
    }

    function getPaymentRulesByDealIdMonthAndYear(
        string memory dealId,
        string memory month,
        string memory year
    ) public view returns (string[][] memory) {
        string[][] memory paymentRulesList = new string[][](uniqueIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 7) {
                if (
                    (keccak256(abi.encodePacked(dealId)) ==
                        keccak256(abi.encodePacked(temp[1]))) &&
                    (keccak256(abi.encodePacked(month)) ==
                        keccak256(abi.encodePacked(temp[5]))) &&
                    (keccak256(abi.encodePacked(year)) ==
                        keccak256(abi.encodePacked(temp[6])))
                ) {
                    paymentRulesList[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalPaymentRulesList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalPaymentRulesList[m] = paymentRulesList[m];
        }
        return finalPaymentRulesList;
    }
}
