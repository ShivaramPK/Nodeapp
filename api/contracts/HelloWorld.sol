pragma solidity ^0.8.13;

// We import this library to be able to use winlog.info


contract HelloWorld {
    string public message;
    
    constructor(string memory initMessage) {
        message = initMessage;
    }
    
    function update(string memory newMessage) public {

        message = newMessage;
    }
}
