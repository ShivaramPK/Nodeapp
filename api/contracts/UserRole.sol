// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract UserRole {
    //inputs
    // 1) role id 2) role name
    //sample inputs for SaveArray
    // [["r1","originator"],["r2","investor"]]

    mapping(string => string[]) map; // uid --> all datas
    string[] roleIdArray;

    function createUserRole(string[] memory values) public {
        map[values[0]] = values; // pushing all datas for uid
        roleIdArray.push(values[0]);
    }

    function updateUserRole(string[] memory values) public {
        map[values[0]] = values; // pushing all datas for uid
    }

    function getAllUserRoles() public view returns (string[][] memory) {
        string[][] memory finalUserRolesList = new string[][](roleIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < roleIdArray.length; h++) {
            finalUserRolesList[p] = map[roleIdArray[h]];
            p++;
        }
        return finalUserRolesList;
    }

}
