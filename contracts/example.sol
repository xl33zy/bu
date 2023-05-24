// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.19;

contract Example {
    uint256 number;
    string str;
    uint256[] data;

    event Receive(address indexed sender, uint256 indexed value);
    event SetData(uint256 indexed number, string str, uint256[] data);

    constructor(uint256 _number, string memory _str, uint256[] memory _data) {
        number = _number;
        str = _str;
        data = _data;
    }

    receive() external payable {
        emit Receive(msg.sender, msg.value);
    }

    function setData(uint256 _number, string memory _str, uint256[] memory _data) public  {
        emit SetData(_number, _str, _data); 
    }
}