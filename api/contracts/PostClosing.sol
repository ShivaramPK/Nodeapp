// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract PostClosing {
    //inputs
    // 0)uniqueid 1.dealid 2)month 3)year 4)currentpaymentdate 5)input
    mapping(string => string[]) map; // unique id --> all datas
    string[] uniqueIdArray;

    function savePostClosing(string[][] memory values) public {
        uint256 i;
        for (i = 0; i < values.length; i++) {
            map[values[i][0]] = values[i]; // pushing all datas for unique id
            uniqueIdArray.push(values[i][0]);
        }
    }

    function updatePostClosing(string[][] memory values) public {
        uint256 i;
        for (i = 0; i < values.length; i++) {
            map[values[i][0]] = values[i]; // pushing all datas for uid
        }
    }

    function getPostClosingByDealIdMonthAndYear(
        string memory dealId,
        string memory month,
        string memory year
    ) public view returns (string[][] memory) {
        string[][] memory postClosingList = new string[][](
            uniqueIdArray.length
        );
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
                    postClosingList[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalPostClosingList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalPostClosingList[m] = postClosingList[m];
        }
        return finalPostClosingList;
    }

    function getByDealId(string memory dealId)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory postClosingList = new string[][](
            uniqueIdArray.length
        );
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 2) {
                if (
                    (keccak256(abi.encodePacked(dealId)) ==
                        keccak256(abi.encodePacked(temp[1])))
                ) {
                    postClosingList[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalPostClosingList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalPostClosingList[m] = postClosingList[m];
        }
        return finalPostClosingList;
    }
}
