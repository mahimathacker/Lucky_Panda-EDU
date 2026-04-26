// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./LotteryEscrow.sol";
 contract LotteryEscrowParent is Ownable(msg.sender),IERC721Receiver{
  event TokenCreated(address, address);
    event TokenTransfered(address, address, address, uint256);
    uint public getNFTCount; 
    uint getAddressCount;
    mapping(address => address[]) private tokens;
    mapping (address => uint256[] ) contractTokenIds;
    mapping (address => string) collections;
    mapping (address => uint256) collectionsOfTokenId;
         address[] public CollectionAddresses;
    address vrfCoordinator = 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B;
        bytes32 vrfKeyHash = 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;
        uint256 subscriptionId;

    function setVRFConfig(
        address _vrfCoordinator,
        bytes32 _vrfKeyHash,
        uint256 _subscriptionId
    ) external onlyOwner {
        vrfCoordinator = _vrfCoordinator;
        vrfKeyHash = _vrfKeyHash;
        subscriptionId = _subscriptionId;
    }

    function createToken(string memory name, string memory symbol, uint256 updateInterval, uint256 winnerPercentage) public {
       address _address = address(new LotteryEscrow(name, symbol, updateInterval,winnerPercentage, vrfCoordinator, vrfKeyHash, subscriptionId, address(this)));
       uint256 count = 0;
       tokens[msg.sender].push(_address);
       CollectionAddresses.push(_address);
       count++;       
        emit TokenCreated(msg.sender, _address);
    }
    function setCollectionUri(address collectionContract, string memory uri) public{
            collections[collectionContract] = uri;
    }
    function getCollectionUri(address collectionContract) public view returns(string memory){
       return collections[collectionContract];
    }
    function getCollectionTokenId(address collectionContract) public view returns(uint256){
        return collectionsOfTokenId[collectionContract];
    }
function bulkMintERC721(
    address tokenAddress,
    uint256 start,
    uint256 end,
    uint256 price
) public {
    uint256 count = 0;
    for (uint256 i = start; i < end; i++) {
        uint256 tokenId = LotteryEscrow(tokenAddress).safeMint(payable(msg.sender));
        contractTokenIds[tokenAddress].push(tokenId);
        collectionsOfTokenId[tokenAddress] = tokenId;
       LotteryEscrow(tokenAddress).createMarketItem(tokenId, price);
        count++;
    }
    getNFTCount = count;
}


   function getAllContractAddresses() public view returns(address[] memory) {
   return CollectionAddresses;
  }
function getContractAddresses() public view returns(address[] memory) {
  return tokens[msg.sender];
}
function getAllTokenId(address tokenContractAddress) public view returns (uint[] memory){
    uint[] memory ret = new uint[](getNFTCount);
    for (uint i = 0; i < getNFTCount; i++) {
        ret[i] = contractTokenIds[tokenContractAddress][i];
    } 
    return ret;
}
  function getWinner(address tokenAddress) public view returns (address) {
        require(tokenAddress != address(0), "Invalid token address");
        return LotteryEscrow(tokenAddress).winner();
    }
 function callRequestRandomWords(address tokenAddress) public onlyOwner returns(uint256) {
return LotteryEscrow(tokenAddress).requestRandomWords();       
    }

    function callPurchaseItem(
    uint256 tokenId,
    address tokenAddress
) public payable {
LotteryEscrow(tokenAddress).purchaseItem{value: msg.value}(tokenId, msg.sender);

}
   function getSoldItems(address tokenAddress) public view returns(uint256[] memory){
    return LotteryEscrow(tokenAddress).getAllSoldItems();
    }
    function getTotalPrice(address tokenAddress, uint256 tokenId) public view returns(uint256){
        return LotteryEscrow(tokenAddress).getTotalPrice(tokenId);
    }
      
      function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
      }
    function transferToken(
        address from,
        address payable to,
        address  token,
        uint256 amount
    ) public {
        LotteryEscrow(token).transferTokens(from, to, token, amount);
        emit TokenTransfered(from, to, token, amount);
    }
}
