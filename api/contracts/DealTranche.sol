// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract DealTranche {
    mapping(string => string[]) map; // tranche id --> all datas
    string[] trancheIdArray;

    function createTranche(string[][] memory values) public {
        uint256 i;
        for (i = 0; i < values.length; i++) {
            map[values[i][0]] = values[i]; // pushing all datas for tranche id
            trancheIdArray.push(values[i][0]);
        }
    }

    function updateTrancheArray(string[][] memory values) public {
        uint256 i;
        for (i = 0; i < values.length; i++) {
            map[values[i][0]] = values[i]; // pushing all datas for tranche id
        }
    }

    function getTrancheByTrancheId(string memory trancheId)
        public
        view
        returns (string[] memory)
    {
        string[] memory data = map[trancheId];
        return data;
    }

    function getTranchesByArrayOfTrancheIds(string[] memory trancheIds)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory trancheList = new string[][](trancheIds.length);
        uint256 p = 0;
        for (uint256 h = 0; h < trancheIds.length; h++) {
            trancheList[p] = map[trancheIds[h]];
            p++;
        }
        return trancheList;
    }

    function getTrancheByDealId(string memory dealId)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory trancheList = new string[][](trancheIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < trancheIdArray.length; h++) {
            string[] memory temp = map[trancheIdArray[h]];
            if (temp.length >= 2) {
                if (
                    (keccak256(abi.encodePacked(dealId)) ==
                        keccak256(abi.encodePacked(temp[1])))
                ) {
                    trancheList[p] = map[trancheIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalTrancheList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalTrancheList[m] = trancheList[m];
        }
        return finalTrancheList;
    }
}
