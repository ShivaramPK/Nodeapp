// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract UserTransaction {
    //inputs
    // 1)uniqueid 2)dealid 3)month 4)year 5)amountpaiddate 6)senderid 7)receiverid
    //8)amountpaid 9)transactionhash 10)trancheid

    mapping(string => string[]) map; // uid --> all datas
    string[] uniqueIdArray;

    function createUserTransaction(string[][] memory values) public {
        uint256 i;
        for (i = 0; i < values.length; i++) {
            map[values[i][0]] = values[i]; // pushing all datas for uid
            uniqueIdArray.push(values[i][0]);
        }
    }

    function getTransactionByMonthAndYear(
        string memory month,
        string memory year
    ) public view returns (string[][] memory) {
        string[][] memory userTransactionList = new string[][](
            uniqueIdArray.length
        );
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 4) {
                if (
                    (keccak256(abi.encodePacked(month)) ==
                        keccak256(abi.encodePacked(temp[2]))) &&
                    (keccak256(abi.encodePacked(year)) ==
                        keccak256(abi.encodePacked(temp[3])))
                ) {
                    userTransactionList[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalUserTransactionList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalUserTransactionList[m] = userTransactionList[m];
        }
        return finalUserTransactionList;
    }

    function getTransactionBySenderId(string memory senderId)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory userTransactionList = new string[][](
            uniqueIdArray.length
        );
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 6) {
                if (
                    (keccak256(abi.encodePacked(senderId)) ==
                        keccak256(abi.encodePacked(temp[5])))
                ) {
                    userTransactionList[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalUserTransactionList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalUserTransactionList[m] = userTransactionList[m];
        }
        return finalUserTransactionList;
    }

    function getTransactionByReceiverId(string memory receiverId)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory userTransactionList = new string[][](
            uniqueIdArray.length
        );
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 7) {
                if (
                    (keccak256(abi.encodePacked(receiverId)) ==
                        keccak256(abi.encodePacked(temp[6])))
                ) {
                    userTransactionList[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalUserTransactionList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalUserTransactionList[m] = userTransactionList[m];
        }
        return finalUserTransactionList;
    }
}
