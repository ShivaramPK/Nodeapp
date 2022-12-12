// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract DealDocuments {
    //inputs
    // 1)documentid 2)dealId 3)name 4)description 5) privacymode
    // 6)documentpath 7)underwriterid

    mapping(string => string) map1; //deal id --> doc id
    mapping(string => string[]) map; // doc id --> all datas
    string[] docIdArray;

    function addDocuments(string[][] memory values) public {
        uint256 i;
        for (i = 0; i < values.length; i++) {
            map1[values[i][1]] = values[i][0]; // dealId  --> doc id
            map[values[i][0]] = values[i]; // pushing all datas for uid
            docIdArray.push(values[i][0]);
        }
    }

    function updateDocument(string[][] memory values) public {
        uint256 i;
        for (i = 0; i < values.length; i++) {
            map1[values[i][1]] = values[i][0]; // dealid  --> doc id
            map[values[i][0]] = values[i]; // pushing all datas for uid
        }
    }

    function getDocumentByDocumentId(string memory docId)
        public
        view
        returns (string[] memory)
    {
        string[] memory data = map[docId];
        return data;
    }

    function getAllDocumentsByDealId(string memory dealId)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory docList = new string[][](docIdArray.length);
        uint256 p = 0;
        for (uint256 h = 0; h < docIdArray.length; h++) {
            string[] memory temp = map[docIdArray[h]];
            if (temp.length >= 2) {
                if (
                    (keccak256(abi.encodePacked(dealId)) ==
                        keccak256(abi.encodePacked(temp[1])))
                ) {
                    docList[p] = map[docIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalDocumentList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalDocumentList[m] = docList[m];
        }
        return finalDocumentList;
    }
}
