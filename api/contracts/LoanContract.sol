// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract LoanContract {
    //inputs
    //1)Deployed address 2)LoanID 3) PoolID 4)remaing loan details

    //mapping(string=>string)map1;  //loan id --> u id
    mapping(string => string[]) map; // uid --> all datas
    string[] uniqueIdArray;

    function createLoansArray(string[][] memory values) public {
        uint256 i;
        for (i = 0; i < values.length; i++) {
            map[values[i][1]] = values[i]; // pushing all datas for uid
            uniqueIdArray.push(values[i][1]);
        }
    }

    function updateLoansArray(string[][] memory values) public {
        uint256 i;
        for (i = 0; i < values.length; i++) {
            map[values[i][1]] = values[i]; // pushing all datas for uid
        }
    }

    function getLoansByPoolId(string memory poolId)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory loanContractList = new string[][](
            uniqueIdArray.length
        );
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 3) {
                if (
                    (keccak256(abi.encodePacked(poolId)) ==
                        keccak256(abi.encodePacked(temp[2])))
                ) {
                    loanContractList[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalLoanContractList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalLoanContractList[m] = loanContractList[m];
        }
        return finalLoanContractList;
    }
}
