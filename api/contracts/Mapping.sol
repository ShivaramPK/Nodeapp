// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract Mapping {
    //inputs
    //0)uniqueid  1.dealid 2)month 3)year 4)input

    mapping(string => string[]) map; // unique id --> all datas
    string[] uniqueIdArray;

    function saveMapping(string[][] memory values) public {
        uint256 i;
        for (i = 0; i < values.length; i++) {
            map[values[i][0]] = values[i]; // pushing all datas for unique id
            uniqueIdArray.push(values[i][0]);
        }
    }

    function updateMapping(string[][] memory values) public {
        uint256 i;
        for (i = 0; i < values.length; i++) {
            map[values[i][0]] = values[i]; // pushing all datas for uid
        }
    }

    function getMappingByDealIdMonthAndYear(
        string memory dealId,
        string memory month,
        string memory year
    ) public view returns (string[][] memory) {
        string[][] memory mappingList = new string[][](uniqueIdArray.length);
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
                    mappingList[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalMappingList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalMappingList[m] = mappingList[m];
        }
        return finalMappingList;
    }
}
