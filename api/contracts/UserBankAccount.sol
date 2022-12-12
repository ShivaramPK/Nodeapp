// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract UserBankAccount {
    mapping(string => string[]) map; // userid --> all datas
    string[] userIdArray;

    function createUserBankAccount(string[][] memory values) public {
        uint256 i;
        for (i = 0; i < values.length; i++) {
            map[values[i][0]] = values[i]; // pushing all datas for userid
            userIdArray.push(values[i][0]);
        }
    }

    function updateUserBankAccount(string[][] memory values) public {
        uint256 i;
        for (i = 0; i < values.length; i++) {
            map[values[i][0]] = values[i]; // pushing all datas for userid
        }
    }

    function getBankDetailsByUserId(string memory userId)
        public
        view
        returns (string[] memory)
    {
        return map[userId];
    }

    function getById(string memory id) public view returns (string[][] memory) {
        string[][] memory bankAccountList = new string[][](userIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < userIdArray.length; h++) {
            string[] memory temp = map[userIdArray[h]];
            if (temp.length >= 3) {
                if (
                    (keccak256(abi.encodePacked(id)) ==
                        keccak256(abi.encodePacked(temp[2])))
                ) {
                    bankAccountList[p] = map[userIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalBankAccountList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalBankAccountList[m] = bankAccountList[m];
        }
        return finalBankAccountList;
    }

    function getByVan(string memory van)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory bankAccountList = new string[][](userIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < userIdArray.length; h++) {
            string[] memory temp = map[userIdArray[h]];
            if (temp.length >= 4) {
                if (
                    (keccak256(abi.encodePacked(van)) ==
                        keccak256(abi.encodePacked(temp[3])))
                ) {
                    bankAccountList[p] = map[userIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalBankAccountList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalBankAccountList[m] = bankAccountList[m];
        }
        return finalBankAccountList;
    }

    function getByIdAndVan(string memory id, string memory van)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory bankAccountList = new string[][](userIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < userIdArray.length; h++) {
            string[] memory temp = map[userIdArray[h]];
            if (temp.length >= 4) {
                if (
                    (keccak256(abi.encodePacked(id)) ==
                        keccak256(abi.encodePacked(temp[2]))) &&
                    (keccak256(abi.encodePacked(van)) ==
                        keccak256(abi.encodePacked(temp[3])))
                ) {
                    bankAccountList[p] = map[userIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalBankAccountList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalBankAccountList[m] = bankAccountList[m];
        }
        return finalBankAccountList;
    }
}
