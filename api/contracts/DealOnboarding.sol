// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract DealOnboarding {
    //inputs
    // 1)uniqueID 2)dealId 3)dealName 4)assetclass 5)vaId 6)servicerId 7)issuerId
    // 8)underwriterId 9)originalbalance 10)numberofloans 11)loanIds 12)numberofTranches
    // 13)trancheIds 14)createdDate 15)status 16)colsingDate 17) maturityDate 18)firstPaymentDate
    // 19) paymentFrequency 20)dealsummary 21)upload approach 22)payingagentid 23)reviewstatus

    mapping(string => string) map1; //deal id --> u id
    mapping(string => string[]) map; // uid --> all datas
    string[] uniqueIdArray;

    function createDeal(string[][] memory values) public {
        uint256 i;
        for (i = 0; i < values.length; i++) {
            map1[values[i][1]] = values[i][0]; // dealId  --> uid
            map[values[i][0]] = values[i]; // pushing all datas for uid
            uniqueIdArray.push(values[i][0]);
        }
    }

    function updateDeal(string[][] memory values) public {
        uint256 i;
        for (i = 0; i < values.length; i++) {
            map1[values[i][1]] = values[i][0]; // dealid  --> uid
            map[values[i][0]] = values[i]; // pushing all datas for uid
        }
    }

    function getAllData() public view returns (string[][] memory) {
        string[][] memory finalDealOnboardList = new string[][](
            uniqueIdArray.length
        );
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            finalDealOnboardList[p] = map[uniqueIdArray[h]];
            p++;
        }
        return finalDealOnboardList;
    }

    function getDealByDealId(string memory dealId)
        public
        view
        returns (string[] memory)
    {
        string memory uid = map1[dealId];
        string[] memory data = map[uid];
        return data;
    }

    function getDealByArrayOfDealIds(string[] memory dealIds)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory dealOnboardingList = new string[][](dealIds.length);
        uint256 p = 0;
        for (uint256 h = 0; h < dealIds.length; h++) {
            string memory uid = map1[dealIds[h]];
            dealOnboardingList[p] = map[uid];
            p++;
        }
        return dealOnboardingList;
    }

    function getDealByUnderWriter(string memory underWriterId)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory dealOnboardingList = new string[][](
            uniqueIdArray.length
        );
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 8) {
                if (
                    (keccak256(abi.encodePacked(underWriterId)) ==
                        keccak256(abi.encodePacked(temp[7])))
                ) {
                    dealOnboardingList[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalDealOnboardingList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalDealOnboardingList[m] = dealOnboardingList[m];
        }
        return finalDealOnboardingList;
    }

    function getDealByIssuerId(string memory issuerId)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory dealOnboardingList = new string[][](
            uniqueIdArray.length
        );
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 7) {
                if (
                    (keccak256(abi.encodePacked(issuerId)) ==
                        keccak256(abi.encodePacked(temp[6])))
                ) {
                    dealOnboardingList[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalDealOnboardingList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalDealOnboardingList[m] = dealOnboardingList[m];
        }
        return finalDealOnboardingList;
    }

    function getDealByServicer(string memory servicer)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory dealOnboardingList = new string[][](
            uniqueIdArray.length
        );
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 6) {
                if (
                    (keccak256(abi.encodePacked(servicer)) ==
                        keccak256(abi.encodePacked(temp[5])))
                ) {
                    dealOnboardingList[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalDealOnboardingList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalDealOnboardingList[m] = dealOnboardingList[m];
        }
        return finalDealOnboardingList;
    }

    function getDealByPayingAgent(string memory payingAgent)
        public
        view
        returns (string[][] memory)
    {
        string[][] memory dealOnboardingList = new string[][](
            uniqueIdArray.length
        );
        uint256 p = 0;
        for (uint256 h = 0; h < uniqueIdArray.length; h++) {
            string[] memory temp = map[uniqueIdArray[h]];
            if (temp.length >= 22) {
                if (
                    (keccak256(abi.encodePacked(payingAgent)) ==
                        keccak256(abi.encodePacked(temp[21])))
                ) {
                    dealOnboardingList[p] = map[uniqueIdArray[h]];
                    p++;
                }
            }
        }
        string[][] memory finalDealOnboardingList = new string[][](p);
        for (uint256 m = 0; m < p; m++) {
            finalDealOnboardingList[m] = dealOnboardingList[m];
        }
        return finalDealOnboardingList;
    }
}
