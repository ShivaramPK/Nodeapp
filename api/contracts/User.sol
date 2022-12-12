// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract User {
    //inputs
    // 1)UserId 2)EmailAddress 3)UserHash 4)UserSatus 5)UserAccAddress 6) userRole 7)username

    //sample inputs save array
    // [["1","xyz@gmail.com","hsdgsh","pending","abc"],["2","abc@gmail.com","adsafe","approved","mno"]]

    mapping(string => string[]) map; // uid --> all datas
    string[] userIdArray;

    function saveUser(string[] memory values) public {
        map[values[0]] = values; // pushing all datas for uid
        userIdArray.push(values[0]);
    }

    function updateUser(string[] memory values) public {
        map[values[0]] = values; // pushing all datas for uid
    }

    function getAllUsers() public view returns (string[][] memory) {
        string[][] memory finalUsersList = new string[][](userIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < userIdArray.length; h++) {
            finalUsersList[p] = map[userIdArray[h]];
            p++;
        }
        return finalUsersList;
    }

    function getUserById(string memory userID)
        public
        view
        returns (string[] memory)
    {
        string[] memory data = map[userID];
        return data;
    }

    function getUserByEmailAndStatus(
        string memory emailID,
        string memory status
    ) public view returns (string[][] memory) {
        string[][] memory userDetails = new string[][](userIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < userIdArray.length; h++) {
            string[] memory temp = map[userIdArray[h]];
            if (temp.length >= 4) {
                if (
                    (keccak256(abi.encodePacked(emailID)) ==
                        keccak256(abi.encodePacked(temp[1]))) &&
                    (keccak256(abi.encodePacked(status)) ==
                        keccak256(abi.encodePacked(temp[3])))
                ) {
                    userDetails[p] = map[userIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalUserDetails = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalUserDetails[m] = userDetails[m];
        }
        return finalUserDetails;
    }
}
