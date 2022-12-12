// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract Date {
    //inputs
    //  1.dealid 2)prevpaymentdate 3)currentpaymentdate 4)nextpaymentdate 5)month 6)year 7)confirmation(yes/no)
    //8)assetclass
    mapping(string => string[]) map; // deal id --> all datas
    string[] dealIdArray;

    function saveDate(string[][] memory values) public {
        uint256 i;
        for (i = 0; i < values.length; i++) {
            map[values[i][0]] = values[i]; // pushing all datas for deal id
            dealIdArray.push(values[i][0]);
        }
    }

    function updateDate(string memory dealId, string[] memory values) public {
        map[dealId] = values; // pushing all datas for tranche id
    }

    function getByDealId(string memory dealId)
        public
        view
        returns (string[] memory)
    {
        string[] memory data = map[dealId];
        return data;
    }

    function getByArrayOfDealIds(string[] memory dealIds)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory finalDatesList = new string[][](dealIds.length);
        uint256 p = 0;
        for (uint256 h = 0; h < dealIds.length; h++) {
            finalDatesList[p] = map[dealIds[h]];
            p++;
        }
        return finalDatesList;
    }
}
