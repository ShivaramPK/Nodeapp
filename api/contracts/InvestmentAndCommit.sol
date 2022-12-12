// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract InvestmentAndCommit {
    //inputs
    //0)uniqueid 1)dealid 2)tranchename 3)trancheid 4)investorid 5)commitAmount 6)investAmount

    mapping(string => string[]) map; // uid --> all datas
    string[] uniqueIdArray;

    function createInvestAndCommit(string[][] memory values) public {
        uint256 i;
        for (i = 0; i < values.length; i++) {
            map[values[i][0]] = values[i]; // pushing all datas for uid
            uniqueIdArray.push(values[i][0]);
        }
    }

    function updateInvestment(string[][] memory values) public {
        uint256 i;
        for (i = 0; i < values.length; i++) {
            map[values[i][0]] = values[i]; // pushing all datas for uid
        }
    }

    function getTrancheDetailsByInvestorIdAndDealId(
        string memory investorId,
        string memory dealId
    ) public view returns (string[][] memory) {
        string[][] memory trancheList = new string[][](uniqueIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 5) {
                if (
                    (keccak256(abi.encodePacked(investorId)) ==
                        keccak256(abi.encodePacked(temp[4]))) &&
                    (keccak256(abi.encodePacked(dealId)) ==
                        keccak256(abi.encodePacked(temp[1])))
                ) {
                    trancheList[p] = map[uniqueIdArray[h]];
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

    function getTrancheDetailsByTrancheIdAndInvestorId(
        string memory trancheId,
        string memory investorId
    ) public view returns (string[] memory) {
        string[] memory trancheList = new string[](1);
        //uint256 p=0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 5) {
                if (
                    (keccak256(abi.encodePacked(trancheId)) ==
                        keccak256(abi.encodePacked(temp[3]))) &&
                    (keccak256(abi.encodePacked(investorId)) ==
                        keccak256(abi.encodePacked(temp[4])))
                ) {
                    trancheList = temp;
                }
            }
        }
        return trancheList;
    }

    function getTrancheDetailsByInvestorId(string memory investorId)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory trancheList = new string[][](uniqueIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 5) {
                if (
                    (keccak256(abi.encodePacked(investorId)) ==
                        keccak256(abi.encodePacked(temp[4])))
                ) {
                    trancheList[p] = map[uniqueIdArray[h]];
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

    function getTrancheByDealId(string memory dealId)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory trancheList = new string[][](uniqueIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 2) {
                if (
                    (keccak256(abi.encodePacked(dealId)) ==
                        keccak256(abi.encodePacked(temp[1])))
                ) {
                    trancheList[p] = map[uniqueIdArray[h]];
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
