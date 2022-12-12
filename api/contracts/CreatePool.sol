// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract CreatePool {
    //inputs
    // 1)unique id 2)PoolID 3)PoolName 4)IssuerID 5)AssetClass 6)AssignVerificationAgent 7)AssignServicer
    // 8)AssignUnderWriter 9)NumberOfLoans 10)SetUpOn(CreatedDate) 11)OriginalBalance 12)Status
    // 13)LoanIDs 14)TypeName 15)Filepath 16)TypePurpose 17)attributes 18)issuerName 19)assignpayingagent

    mapping(string => string) map1; //pool id --> u id
    mapping(string => string[]) map; // uid --> all datas
    string[] uniqueIdArray;

    function createPool(string[][] memory values) public {
        uint256 i;
        for (i = 0; i < values.length; i++) {
            map1[values[i][1]] = values[i][0]; // pool id  --> uid
            map[values[i][0]] = values[i]; // pushing all datas for uid
            uniqueIdArray.push(values[i][0]);
        }
    }

    function updatePool(string[][] memory values) public {
        uint256 i;
        for (i = 0; i < values.length; i++) {
            map1[values[i][1]] = values[i][0]; // pool id  --> uid
            map[values[i][0]] = values[i]; // pushing all datas for uid
        }
    }

    function getAllPools() public view returns (string[][] memory) {
        string[][] memory finalPoolList = new string[][](uniqueIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            finalPoolList[p] = map[uniqueIdArray[h]];
            p++;
        }
        return finalPoolList;
    }

    function getPoolByPoolId(string memory poolId)
        public
        view
        returns (string[] memory)
    {
        string memory uid = map1[poolId];
        string[] memory data = map[uid];
        return data;
    }

    function getPoolsByUnderWriter(string memory underWriterId)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory poolDetails = new string[][](uniqueIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 8) {
                if (
                    (keccak256(abi.encodePacked(underWriterId)) ==
                        keccak256(abi.encodePacked(temp[7])))
                ) {
                    poolDetails[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalPoolDetails = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalPoolDetails[m] = poolDetails[m];
        }
        return finalPoolDetails;
    }

    function getPoolsByIssuer(string memory issuerId)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory poolDetails = new string[][](uniqueIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length > 4) {
                if (
                    (keccak256(abi.encodePacked(issuerId)) ==
                        keccak256(abi.encodePacked(temp[3])))
                ) {
                    poolDetails[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalPoolDetails = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalPoolDetails[m] = poolDetails[m];
        }
        return finalPoolDetails;
    }
}
