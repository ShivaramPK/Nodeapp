// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract LoanSave {
    //inputs
    //0)uniqueid 1)Dealname 2)Month 3)Year 4)filehash 5)privatekey

    mapping(string => string[]) map; // unique id --> all datas
    string[] uniqueIdArray;

    function createLoanTape(string[][] memory values) public {
        uint256 i;
        for (i = 0; i < values.length; i++) {
            map[values[i][0]] = values[i]; // pushing all datas for uid
            uniqueIdArray.push(values[i][0]);
        }
    }

    function updateLoanTape(string[][] memory values) public {
        uint256 i;
        for (i = 0; i < values.length; i++) {
            map[values[i][0]] = values[i]; // pushing all datas for uid
        }
    }

    function getDataByDealMonthYear(
        string memory dealId,
        string memory month,
        string memory year
    ) public view returns (string[][] memory) {
        string[][] memory loansList = new string[][](uniqueIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 4) {
                if (
                    (keccak256(abi.encodePacked(dealId)) ==
                        keccak256(abi.encodePacked(temp[1]))) &&
                    (keccak256(abi.encodePacked(month)) ==
                        keccak256(abi.encodePacked(temp[2]))) &&
                    (keccak256(abi.encodePacked(year)) ==
                        keccak256(abi.encodePacked(temp[3])))
                ) {
                    loansList[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalLoansList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalLoansList[m] = loansList[m];
        }
        return finalLoansList;
    }
}
