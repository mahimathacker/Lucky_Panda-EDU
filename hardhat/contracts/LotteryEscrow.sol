// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@chainlink/contracts/src/v0.8/dev/vrf/VRFConsumerBaseV2Plus.sol";
import "@chainlink/contracts/src/v0.8/dev/vrf/libraries/VRFV2PlusClient.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract LotteryEscrow is ERC721, VRFConsumerBaseV2Plus, AutomationCompatibleInterface{
    uint256 private _tokenIdCounter;
        uint256 private _ItemIdsCounter;

     address payable public immutable feeAccount;
    uint256 public feePercent = 2; //the fee percntage on sales
    mapping(uint256 => address payable) public OwnerOfAnNFT;
    uint256[] public allSoldItems;
    address payable public winner;
    uint256 public winnerPercentage;
    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);

    struct RequestStatus {
        bool fulfilled; // whether the request has been successfully fulfilled
        bool exists; // whether a requestId exists
        uint256[] randomWords;
    }
    mapping(uint256 => RequestStatus)
        public s_requests; /* requestId --> requestStatus */

    mapping(address => uint256) public addressToRequestId;
    // Your subscription ID.
    uint256 s_subscriptionId;
    bool public nativePayment = true;

    // past requests Id.
    uint256[] public requestIds;
    uint256 public lastRequestId;

    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price
    );
    event Bought(
        uint256 itemId,
        address indexed nft,
        uint256 tokenId,
        uint256 price,
        address indexed seller,
        address indexed buyer
    );
        mapping(uint256 => MarketItem) public marketItems;
            address marketplaceAddress;

    //   bytes32 keyHash =
    //     0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;
     event RandomnessRequestSent(uint256 requestId, uint32 numWords);
    event RandomnessRequestFulfilled(uint256 requestId, uint256[] randomWords);


    bytes32 public keyHash;
    uint32 public callbackGasLimit = 100000;
    uint16 public requestConfirmations = 3;
    uint32 public numWords = 1;
    uint256 public immutable interval;
    uint256 public lastTimeStamp;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 updateInterval,
        uint256 _winnerPercentage,
        address vrfCoordinator,
        bytes32 vrfKeyHash,
        uint256 subscriptionId,
        address _marketplaceAddress
    ) ERC721(_name, _symbol) 
      VRFConsumerBaseV2Plus(vrfCoordinator) 
    {
        marketplaceAddress = _marketplaceAddress;
        feeAccount = payable(address(this));
        interval = updateInterval;
        lastTimeStamp = block.timestamp;
        winnerPercentage = _winnerPercentage;
        keyHash = vrfKeyHash;
        s_subscriptionId = subscriptionId;
    }
   


    function safeMint (address payable to) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
         require(OwnerOfAnNFT[tokenId] == address(0), "The tokenId is already taken");
            OwnerOfAnNFT[tokenId] = to;
           _safeMint(to, tokenId);        
           setApprovalForAll(marketplaceAddress, true);       
          _tokenIdCounter++;
          return tokenId;
    }
       function createMarketItem(
        uint256 tokenId,
        uint256 price
    ) public {
        uint256 itemId = _ItemIdsCounter;
            marketItems[itemId] = MarketItem(
            itemId,
            address(this),
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );

        IERC721(address(this)).transferFrom(msg.sender, address(this), tokenId);
        _ItemIdsCounter++;
        emit MarketItemCreated(
            itemId,
            address(this),
            tokenId,
            msg.sender,
            address(0),
            price
        );
    }
         
         function requestRandomWords()
        external
        returns (uint256 requestId)
    {
        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: s_subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: nativePayment})
                )
            })
        );
        s_requests[requestId] = RequestStatus({
            randomWords: new uint256[](0),
            exists: true,
            fulfilled: false
        });
        addressToRequestId[msg.sender] = requestId;
        requestIds.push(requestId);
        lastRequestId = requestId;
        emit RequestSent(requestId, numWords);
        return requestId;
    }
  function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        require(s_requests[_requestId].exists, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
        emit RequestFulfilled(_requestId, _randomWords);
    }

   function playLottery() public {
    require(address(this).balance > 0, "No funds available for transfer");
    
    uint256 randomTokenId = getRandomTokenId(msg.sender);
    require(randomTokenId < _tokenIdCounter, "Invalid random token ID");

        RequestStatus memory requestStatus = getRandomnessRequestState(msg.sender);
    require(requestStatus.fulfilled, "Randomness request not fulfilled");


    winner = OwnerOfAnNFT[randomTokenId];
    require(winner != address(0), "Winner address is invalid");
    uint256 totalPrize = address(this).balance;
    uint256 winnerAmount = (totalPrize * winnerPercentage) / 100;
    uint256 creatorAmount = totalPrize - winnerPercentage;

     // Deduct fees from the winner and creator amounts
    uint256 winnerFinalAmount = winnerAmount - ((winnerAmount * feePercent) / 100);
    uint256 creatorFinalAmount = creatorAmount - ((creatorAmount * feePercent) / 100);

    payable(winner).transfer(winnerFinalAmount);
    payable(msg.sender).transfer(creatorFinalAmount);    
}

  function getRandomnessRequestState(address requester)
        public
        view
        returns (RequestStatus memory)
    {
        return s_requests[addressToRequestId[requester]];
    }
  function getRandomTokenId(address requester)
        public
        view
        returns (uint256 randomTokenId)
    {
    RequestStatus memory requestStatus = getRandomnessRequestState(requester);
    
    require(requestStatus.fulfilled, "Request not fulfilled");
    uint256 randomWord = requestStatus.randomWords[0];
     if (_tokenIdCounter > 0) {
        randomTokenId = randomWord % _tokenIdCounter;
    } else {
        revert("No tokens minted yet");
    }
     return randomTokenId;
}

function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        upkeepNeeded = (block.timestamp - lastTimeStamp) > interval;
    }
   
function performUpkeep(bytes calldata /* performData */) external override {
        if ((block.timestamp - lastTimeStamp) > interval) {
            lastTimeStamp = block.timestamp;
           playLottery();
        }
    }
    function transferTokens(
        address from,
        address payable to,
        address token,
        uint256 amount
    ) public {
        if (token != address(0)) {
            IERC721(token).transferFrom(from, to, amount);
        } else {
            require(to.send(amount), "Transfer of ETH to receiver failed");
        }
    }
    function purchaseItem(uint256 tokenId, address to) external payable {
        uint256 _totalPrice = getTotalPrice(tokenId);
        MarketItem storage item = marketItems[tokenId];
           require(
            msg.value >= _totalPrice,
            "not enough matic to cover item price and market fee"
        );
        require(!item.sold, "item already sold");
        item.seller.transfer(item.price);
        feeAccount.transfer(_totalPrice - item.price);
        item.sold = true; 
        IERC721(item.nftContract).transferFrom(address(this), to, item.tokenId);
        marketItems[tokenId].owner = payable(to);
        allSoldItems.push(tokenId);
        emit Bought(item.itemId, address(this), item.tokenId, item.price, item.seller, to);
    } 

    function getAllSoldItems() external view returns (uint256[] memory) {
        return allSoldItems;
    }
    function getTotalPrice(uint256 tokenId) public view returns (uint256) {
        return ((marketItems[tokenId].price * (100 + feePercent)) / 100);
    }
} 
