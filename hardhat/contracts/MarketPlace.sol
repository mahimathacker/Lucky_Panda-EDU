// Legacy commented contract version.
// pragma solidity ^0.8.20;

// import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

// import './NFT.sol';
// import './ChainlinkVRF.sol';

// contract Marketplace is Ownable(msg.sender), ReentrancyGuard, AutomationCompatible{

//     mapping (address => address[]) private tokens;
//     mapping (address => uint256[] ) contractTokenIds;
//     mapping (address => uint256[]) contractItemIds;  // Added mapping for contract to itemIds
//     mapping (address => uint256[]) collectionsOfSoldItems;
//     mapping (address => mapping(uint256 => MarketItem)) public marketItems;  // Updated mapping for collection to MarketItem
//     mapping (address => string) collections;
//     mapping(address => uint256) public lotteryRequestIds;

//     address payable public feeAccount =  payable(address(this));
//     address[] public CollectionAddresses;
//     uint256 public feePercent = 2;
//     uint256 public getNFTCount;
//     uint256 private _ItemIdsCounter;
//     uint256 public totalFeesCollected;
//     uint256 totalEscrowedAmount;

//     ChainlinkVRF public vrfContract;

//     event TokenCreated(address, address);

//      struct MarketItem {
//         uint256 itemId;
//         address nftContract;
//         uint256 tokenId;
//         address payable seller;
//         address payable owner;
//         uint256 price;
//         bool sold;
//         uint256 escrowAmount;
//     }

//     event MarketItemCreated(
//         uint256 indexed itemId,
//         address indexed nftContract,
//         uint256 indexed tokenId,
//         address seller,
//         address owner,
//         uint256 price
//     );

//       event Bought(
//         uint256 itemId,
//         address indexed nft,
//         uint256 tokenId,
//         uint256 price,
//         address indexed seller,
//         address indexed buyer
//     );

//    struct CollectionInfo {
//      uint256 updateInterval;
//      uint256 lastTimeStamp;
//      uint256 winnerPercentage;
//      bool allSold;
//    }

//   struct WinnerInfo {
//      address winnerAddress;
//      uint256 winningTokenId;
//   }

//   mapping(address => WinnerInfo) public collectionWinners;
//   mapping(address => CollectionInfo) public collectionInfo;

//     function createToken(
//         string memory name,
//         string memory symbol,
//         uint256 updateInterval,
//         uint256 winnerPercentage
//     ) public {
//         address _address = address(new NFT(name, symbol, updateInterval, winnerPercentage));
//         collectionInfo[_address] = CollectionInfo({
//         updateInterval: updateInterval,
//         lastTimeStamp: block.timestamp,
//         winnerPercentage: winnerPercentage,
//         allSold: false
//     });
//         uint256 count = 0;
//         tokens[msg.sender].push(_address);
//         CollectionAddresses.push(_address);
//         count++;
//         emit TokenCreated(msg.sender, _address);
//     }
//     // function addNFTConsumer(uint64 subscriptionId, address tokenAddress) public  {
//     //         VRFCoordinatorV2Interface(vrfCoordinator).addConsumer(subscriptionId, tokenAddress);
//     // }

//        function setVRFContract(address _vrfContract) external onlyOwner{
//         vrfContract = ChainlinkVRF(_vrfContract);
//        }
//    function bulkMintERC721(
//     address tokenAddress,
//     uint256 start,
//     uint256 end
// ) public {
//     uint256 count = 0;
//     for (uint256 i = start; i < end; i++) {
//         uint256 tokenId = NFT(tokenAddress).safeMint(msg.sender);
//         contractTokenIds[tokenAddress].push(tokenId);
//         count++;
//     }
//     getNFTCount = count;
// }
//  function createMarketItem(
//     address nftContractAddress,
//     uint256 start,
//     uint256 end,
//     uint256 price
// ) public nonReentrant {
//     for (uint256 i = start; i < end; i++) {
//         uint256 tokenId = contractTokenIds[nftContractAddress][i];
//         uint256 itemId = i;
//         marketItems[nftContractAddress][itemId] = MarketItem(
//                 itemId,
//                 nftContractAddress,
//                 tokenId,
//                 payable(msg.sender),
//                 payable(address(0)),
//                 price,
//                 false,
//                 0
//             );

//         IERC721(nftContractAddress).transferFrom(
//             msg.sender,
//             address(this),
//             tokenId
//         );
//         contractItemIds[nftContractAddress].push(itemId);
//         emit MarketItemCreated(
//             itemId,
//             nftContractAddress,
//             tokenId,
//             msg.sender,
//             address(0),
//             price
//         );
//     }
// }

// //   function purchaseItem(address nftContract, uint256 tokenId) external payable nonReentrant {
// //     uint256 _totalPrice = getTotalPrice(nftContract, tokenId);
// //         MarketItem storage item = marketItems[nftContract][tokenId];

// //     require(msg.value >= _totalPrice, "not enough ether to cover item price and market fee");
// //     require(!item.sold, "item already sold");

// //     // Transfer funds to the seller
// //     (bool successSeller, ) = item.seller.call{value: item.price}("");
// //     require(successSeller, "Transfer to seller failed");

// //     // Transfer funds to the fee account
// //     (bool successFee, ) = feeAccount.call{value: _totalPrice - item.price}("");
// //     require(successFee, "Transfer to fee account failed");

// //     item.sold = true;

// //     // Use 'call' to transfer the NFT
// //     (bool successTransfer, ) = address(IERC721(nftContract)).call(
// //         abi.encodeWithSignature("transferFrom(address,address,uint256)", address(this), msg.sender, tokenId)
// //     );
// //     require(successTransfer, "NFT transfer failed");

// //     marketItems[nftContract][tokenId].owner = payable(msg.sender);
// //     collectionsOfSoldItems[nftContract].push(tokenId);
// //     if (collectionsOfSoldItems[nftContract].length == getNFTCount) {
// //         CollectionInfo storage info = collectionInfo[nftContract];
// //         info.allSold = true;
// //     }
// //     emit Bought(item.itemId, nftContract, item.tokenId, item.price, item.seller, msg.sender);
// // }

// function purchaseItem(address nftContract, uint256 tokenId) external payable nonReentrant {
//     uint256 _totalPrice = getTotalPrice(nftContract, tokenId);
//     MarketItem storage item = marketItems[nftContract][tokenId];
//     uint256 itemPrice = item.price;
//     require(msg.value >= _totalPrice, "Not enough ether to cover item price and market fee");
//     require(!item.sold, "Item already sold");
//     uint256 escrowAmount = itemPrice;
//     item.sold = true;
//     item.escrowAmount += escrowAmount;
//     marketItems[nftContract][tokenId].owner = payable(msg.sender);
//     collectionsOfSoldItems[nftContract].push(tokenId);
//     if (collectionsOfSoldItems[nftContract].length == getNFTCount) {
//         collectionInfo[nftContract].allSold = true;
//     }
//     emit Bought(item.itemId, nftContract, item.tokenId, item.price, item.seller, msg.sender);
// }

// function callRequestRandomWords(address tokenAddress) public returns(uint256) {
//     uint256 nftCount = contractTokenIds[tokenAddress].length;
//     uint256 requestId = vrfContract.requestRandomWords(nftCount, tokenAddress);
//     lotteryRequestIds[tokenAddress] = requestId;
//     return requestId;
// }
//  function getRequestIdForCollection(address collectionAddress)
//         public
//         view
//         returns (uint256)
//     {
//         return vrfContract.getRequestIdForCollection(collectionAddress);
//     }

// function getRequestStatus(uint256 _requestId) public view returns(bool, uint256){
//        return vrfContract.getRequestStatus(_requestId);
// }
//  function setCollectionUri(address collectionContract, string memory uri) public{
//             collections[collectionContract] = uri;
//     }

// function getCollectionUri(address collectionContract) public view returns(string memory){
//        return collections[collectionContract];
//     }

// function getAllTokenId(address tokenContractAddress) public view returns (uint[] memory){
//     uint[] memory ret = new uint[](getNFTCount);
//     for (uint i = 0; i < getNFTCount; i++) {
//         ret[i] = contractTokenIds[tokenContractAddress][i];
//     }
//     return ret;
// }
//   function getAllCollectionAddresses() public view returns (address[] memory) {
//     return CollectionAddresses;
//   }

//   function getAllContractAddresses() public view returns (address[] memory) {
//     uint256 totalContracts = CollectionAddresses.length;
//     uint256 senderContractCount = tokens[msg.sender].length;

//     // Calculate the size of the new array
//     uint256 size = totalContracts - senderContractCount;
//     address[] memory allExceptSender = new address[](size);

//     uint256 currentIndex = 0;

//     for (uint256 i = 0; i < totalContracts; i++) {
//         address contractAddress = CollectionAddresses[i];
//         bool isSenderContract = false;

//         // Check if the current address is in the sender's list
//         for (uint256 j = 0; j < senderContractCount; j++) {
//             if (contractAddress == tokens[msg.sender][j]) {
//                 isSenderContract = true;
//                 break;
//             }
//         }

//         // If it's not the sender's contract, add it to the return array
//         if (!isSenderContract) {
//             allExceptSender[currentIndex] = contractAddress;
//             currentIndex++;
//         }
//     }

//     return allExceptSender;
//     }

// function isOwnerAddress(address _address) internal view returns(bool) {
//     address[] memory ownerAddresses = tokens[msg.sender];
//     for(uint i = 0; i < ownerAddresses.length; i++) {
//         if(ownerAddresses[i] == _address) {
//             return true;
//         }
//     }
//     return false;
// }

//  function getOwnerContractAddresses() public view returns(address[] memory) {
//   return tokens[msg.sender];
// }

//   function getAllSoldItems(address nftContract) external view returns (uint256[] memory) {
//         return collectionsOfSoldItems[nftContract];
//     }

//  function getTotalPrice(address nftContract, uint256 tokenId) public view returns (uint256) {
//         return ((marketItems[nftContract][tokenId].price * (100 + feePercent)) / 100);
//     }

//   function getTotalPriceForCollection(address nftContract) public view returns (uint256) {
//     uint256 totalCollectionPrice = 0;
//     uint256 totalTokens = contractTokenIds[nftContract].length; // Assuming this keeps track of all token IDs in the collection

//     for (uint256 i = 0; i < totalTokens; i++) {
//         uint256 tokenId = contractTokenIds[nftContract][i];
//         MarketItem storage item = marketItems[nftContract][tokenId];
//         if (item.sold) {
//             totalCollectionPrice += (item.price * (100 + feePercent)) / 100;
//         }
//     }

//     return totalCollectionPrice;
// }
// // function callRequestRandomWords(address tokenAddress) public returns(uint256) {
// //     return NFT(tokenAddress).requestRandomWords();
// //     }
// //  function callGetRequestStatus(address tokenAddress, uint256 _requestId) public view returns(bool, uint256[] memory) {
// //      return NFT(tokenAddress).getRequestStatus(_requestId);
// //    }

// function playLottery(address collectionAddress, uint256 requestId) internal {
//     require(lotteryRequestIds[collectionAddress] == requestId, "Invalid request ID");
//     CollectionInfo storage info = collectionInfo[collectionAddress];
//     require(info.allSold, "Not all NFTs are sold");

//     (bool fulfilled, uint256 randomTokenNumber) = getRequestStatus(requestId);
//     require(fulfilled, "Random number not fulfilled");

//    (address winner, ) = getWinnerAddress(collectionAddress, requestId);
//     collectionWinners[collectionAddress] = WinnerInfo(winner, randomTokenNumber);

//     totalEscrowedAmount = calculateTotalEscrowedAmount(collectionAddress);

//     // Calculate the winner's prize directly from the escrow amount.
//     uint256 winnerPrize = (totalEscrowedAmount * info.winnerPercentage) / 100;

//     // Send the winner's prize.
//     (bool winnerSent, ) = payable(winner).call{value: winnerPrize}("");
//     require(winnerSent, "Failed to send prize to winner");

//     // Calculate the remaining amount to be sent to the seller (creator of the collection).
//     uint256 remainingToSeller = totalEscrowedAmount - winnerPrize;

//     // Assuming the first item's seller is the collection's creator.
//     if(contractTokenIds[collectionAddress].length > 0) {
//         MarketItem storage firstItem = marketItems[collectionAddress][0];
//         address payable sellerAddress = firstItem.seller;

//         // Send the remaining amount to the seller.
//         (bool sellerSent, ) = sellerAddress.call{value: remainingToSeller}("");
//         require(sellerSent, "Failed to send remaining funds to seller");

//         // Reset escrow amounts for all items in the collection.
//         for (uint256 i = 0; i < contractTokenIds[collectionAddress].length; i++) {
//             marketItems[collectionAddress][i].escrowAmount = 0;
//         }
//     }

//     // Reset the collection for the next lottery.
//     info.lastTimeStamp = block.timestamp;
//     info.allSold = false;
// }

// function calculateTotalEscrowedAmount(address collectionAddress) private view returns (uint256 totalEscrowed) {
//     uint256 totalTokens = contractTokenIds[collectionAddress].length;
//     for (uint256 i = 0; i < totalTokens; i++) {
//         MarketItem storage item = marketItems[collectionAddress][i];
//         if (item.sold) {
//             totalEscrowed += item.escrowAmount;
//         }
//     }
// }

// function calculateFee(uint256 amount) private view returns (uint256) {
//     return (amount * feePercent) / 100;
// }

//  function getWinnerAddress(address collectionAddress, uint256 requestId) public view returns (address, uint256) {
//     (bool fulfilled, uint256 randomTokenNumber) = getRequestStatus(requestId);

//     require(fulfilled, "Random number not fulfilled");

//     MarketItem storage winningItem = marketItems[collectionAddress][randomTokenNumber];

//     return (winningItem.owner, randomTokenNumber);
// }

// function getCollectionWinner(address collectionAddress) external view returns (address, uint256) {
//     WinnerInfo storage winnerInfo = collectionWinners[collectionAddress];
//     return (winnerInfo.winnerAddress, winnerInfo.winningTokenId);
// }

// function checkUpkeep(bytes calldata /* checkData */) external view override returns (bool upkeepNeeded, bytes memory performData) {
//     for (uint i = 0; i < CollectionAddresses.length; i++) {
//         address collectionAddress = CollectionAddresses[i];
//         CollectionInfo memory info = collectionInfo[collectionAddress];

//         if ((block.timestamp - info.lastTimeStamp) > info.updateInterval && info.allSold) {
//             // If any collection meets the criteria, return true
//             upkeepNeeded = true;
//             // Encode the collection address to performData for performUpkeep
//             performData = abi.encode(collectionAddress);
//             return (upkeepNeeded, performData);
//         }
//     }

//     // If no collection meets the criteria, return false
//     return (false, "");
// }

// function performUpkeep(bytes calldata performData) external override {
//     address collectionAddress = abi.decode(performData, (address));
//     CollectionInfo memory info = collectionInfo[collectionAddress];
//     if ((block.timestamp - info.lastTimeStamp) > info.updateInterval && info.allSold) {
//         // Note: If playLottery requires a requestId, you need to fetch or generate it appropriately
//         uint256 requestId = lotteryRequestIds[collectionAddress]; // Example, if lotteryRequestIds is already set somewhere
//         playLottery(collectionAddress, requestId);
//     }
// }

// // Helper function to retrieve the collection address from the requestId
// // function getCollectionAddress(uint256 requestId) internal view returns (address) {
// //     // You may need to adapt this based on how requestId is associated with the collection
// //     for (uint256 i = 0; i < CollectionAddresses.length; i++) {
// //         if (lotteryRequestIds[CollectionAddresses[i]] == requestId) {
// //             return CollectionAddresses[i];
// //         }
// //     }
// //     revert("Collection not found for the requestId");
// // }
// function getCollectionAddress(uint256 requestId) public view returns (address) {
//     // You may need to adapt this based on how requestId is associated with the collection
//     for (uint256 i = 0; i < CollectionAddresses.length; i++) {
//         if (lotteryRequestIds[CollectionAddresses[i]] == requestId) {
//             return CollectionAddresses[i];
//         }
//     }
//     revert("Collection not found for the requestId");
// }

// function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
//         return IERC721Receiver.onERC721Received.selector;
//       }

// function withdrawCollectedFees(address payable destination, uint256 amount) external onlyOwner {
//     require(amount <= totalFeesCollected, "Amount exceeds collected fees");
//     require(destination != address(0), "Invalid destination address");

//     totalFeesCollected -= amount; // Adjust the tracked fee balance
//     destination.transfer(amount); // Transfer the requested amount
// }
// }

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/dev/vrf/VRFConsumerBaseV2Plus.sol";
import "@chainlink/contracts/src/v0.8/dev/vrf/libraries/VRFV2PlusClient.sol";

import "./NFT.sol";

contract Marketplace is
    ReentrancyGuard,
    VRFConsumerBaseV2Plus,
    AutomationCompatibleInterface
{
    address private constant SEPOLIA_VRF_COORDINATOR =
        0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B;
    bytes32 public vrfKeyHash =
        0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;
    uint256 public vrfSubscriptionId =
        72544967497282408309874280965537828444150412992519385695430290523480694163851;
    uint32 public callbackGasLimit = 200000;
    uint16 public requestConfirmations = 3;
    uint32 public numWords = 1;
    bool public nativePayment = true;

    mapping(address => address[]) private tokens;
    mapping(address => uint256[]) contractTokenIds;
    mapping(address => uint256[]) contractItemIds;
    mapping(address => uint256[]) collectionsOfSoldItems;
    mapping(address => mapping(uint256 => MarketItem)) public marketItems;
    mapping(address => string) collections;
    mapping(uint256 => address) public requestIdToCollection;
    mapping(address => uint256) public collectionRequestIds;

    address payable public feeAccount = payable(address(this));
    address[] public CollectionAddresses;
    uint256 public feePercent = 2;
    uint256 public getNFTCount;
    uint256 private _ItemIdsCounter;
    uint256 public totalFeesCollected;
    uint256 totalEscrowedAmount;

    constructor() VRFConsumerBaseV2Plus(SEPOLIA_VRF_COORDINATOR) {}

    event TokenCreated(address indexed creator, address indexed tokenAddress);
    event WinnerRequested(address indexed collection, uint256 indexed requestId);
    event WinnerSelected(
        address indexed collection,
        address indexed winner,
        uint256 indexed winningTokenId
    );

    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
        uint256 escrowAmount;
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

    struct CollectionInfo {
        uint256 updateInterval;
        uint256 lastTimeStamp;
        uint256 winnerPercentage;
        bool allSold;
    }

    struct WinnerInfo {
        address winnerAddress;
        uint256 winningTokenId;
    }

    mapping(address => WinnerInfo) public collectionWinners;
    mapping(address => CollectionInfo) public collectionInfo;

    function createToken(
        string memory name,
        string memory symbol,
        uint256 updateInterval,
        uint256 winnerPercentage
    ) public {
        address _address = address(
            new NFT(name, symbol, updateInterval, winnerPercentage)
        );
        collectionInfo[_address] = CollectionInfo({
            updateInterval: updateInterval,
            lastTimeStamp: block.timestamp,
            winnerPercentage: winnerPercentage,
            allSold: false
        });
        tokens[msg.sender].push(_address);
        CollectionAddresses.push(_address);
        emit TokenCreated(msg.sender, _address);
    }

    function bulkMintERC721(
        address tokenAddress,
        uint256 start,
        uint256 end
    ) public {
        uint256 count = 0;
        for (uint256 i = start; i < end; i++) {
            uint256 tokenId = NFT(tokenAddress).safeMint(msg.sender);
            contractTokenIds[tokenAddress].push(tokenId);
            count++;
        }
        getNFTCount = count;
    }

    function createMarketItem(
        address nftContractAddress,
        uint256 start,
        uint256 end,
        uint256 price
    ) public nonReentrant {
        for (uint256 i = start; i < end; i++) {
            uint256 tokenId = contractTokenIds[nftContractAddress][i];
            uint256 itemId = i;
            marketItems[nftContractAddress][itemId] = MarketItem(
                itemId,
                nftContractAddress,
                tokenId,
                payable(msg.sender),
                payable(address(0)),
                price,
                false,
                0
            );

            IERC721(nftContractAddress).transferFrom(
                msg.sender,
                address(this),
                tokenId
            );
            contractItemIds[nftContractAddress].push(itemId);
            emit MarketItemCreated(
                itemId,
                nftContractAddress,
                tokenId,
                msg.sender,
                address(0),
                price
            );
        }
    }

    function purchaseItem(
        address nftContract,
        uint256 tokenId
    ) external payable nonReentrant {
        uint256 _totalPrice = getTotalPrice(nftContract, tokenId);
        MarketItem storage item = marketItems[nftContract][tokenId];
        require(
            msg.value >= _totalPrice,
            "Not enough ether to cover item price and market fee"
        );
        require(!item.sold, "Item already sold");

        uint256 marketFee = _totalPrice - item.price;
        item.sold = true;
        item.owner = payable(msg.sender);
        collectionsOfSoldItems[nftContract].push(tokenId);
        totalFeesCollected += marketFee;

        if (collectionsOfSoldItems[nftContract].length == getNFTCount) {
            collectionInfo[nftContract].allSold = true;
        }

        (bool sellerPaid, ) = item.seller.call{value: item.price}("");
        require(sellerPaid, "Seller payment failed");

        IERC721(nftContract).transferFrom(address(this), msg.sender, item.tokenId);

        if (msg.value > _totalPrice) {
            (bool refunded, ) = payable(msg.sender).call{
                value: msg.value - _totalPrice
            }("");
            require(refunded, "Refund failed");
        }

        emit Bought(
            item.itemId,
            nftContract,
            item.tokenId,
            item.price,
            item.seller,
            msg.sender
        );
    }

    // Pseudo-random number generator for lottery
    function generateRandomNumber(
        uint256 range
    ) internal view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.prevrandao,
                        msg.sender
                    )
                )
            ) % range;
    }

    function requestWinner(address collectionAddress) public returns (uint256 requestId) {
        CollectionInfo storage info = collectionInfo[collectionAddress];
        require(info.allSold, "Not all NFTs are sold");
        require(
            collectionWinners[collectionAddress].winnerAddress == address(0),
            "Winner already selected"
        );
        require(collectionRequestIds[collectionAddress] == 0, "Winner already requested");

        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: vrfKeyHash,
                subId: vrfSubscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: nativePayment})
                )
            })
        );

        requestIdToCollection[requestId] = collectionAddress;
        collectionRequestIds[collectionAddress] = requestId;
        emit WinnerRequested(collectionAddress, requestId);
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        address collectionAddress = requestIdToCollection[requestId];
        require(collectionAddress != address(0), "Unknown request");

        uint256 nftCount = contractTokenIds[collectionAddress].length;
        uint256 randomTokenNumber = randomWords[0] % nftCount;

        MarketItem storage winningItem = marketItems[collectionAddress][
            randomTokenNumber
        ];
        collectionWinners[collectionAddress] = WinnerInfo(
            winningItem.owner,
            randomTokenNumber
        );
        delete requestIdToCollection[requestId];

        emit WinnerSelected(
            collectionAddress,
            winningItem.owner,
            randomTokenNumber
        );
    }

    function getCollectionWinner(
        address collectionAddress
    ) external view returns (address, uint256) {
        WinnerInfo storage winnerInfo = collectionWinners[collectionAddress];
        return (winnerInfo.winnerAddress, winnerInfo.winningTokenId);
    }

    function getTotalPrice(
        address nftContract,
        uint256 tokenId
    ) public view returns (uint256) {
        return ((marketItems[nftContract][tokenId].price * (100 + feePercent)) /
            100);
    }

    function getTotalPriceForCollection(
        address nftContract
    ) public view returns (uint256) {
        uint256 totalCollectionPrice = 0;
        uint256 totalTokens = contractTokenIds[nftContract].length; // Assuming this keeps track of all token IDs in the collection

        for (uint256 i = 0; i < totalTokens; i++) {
            uint256 tokenId = contractTokenIds[nftContract][i];
            MarketItem storage item = marketItems[nftContract][tokenId];
            if (item.sold) {
                totalCollectionPrice += (item.price * (100 + feePercent)) / 100;
            }
        }

        return totalCollectionPrice;
    }

    function getAllCollectionAddresses()
        public
        view
        returns (address[] memory)
    {
        return CollectionAddresses;
    }

    function getAllContractAddresses() public view returns (address[] memory) {
        uint256 totalContracts = CollectionAddresses.length;
        uint256 senderContractCount = tokens[msg.sender].length;

        // Calculate the size of the new array
        uint256 size = totalContracts - senderContractCount;
        address[] memory allExceptSender = new address[](size);

        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalContracts; i++) {
            address contractAddress = CollectionAddresses[i];
            bool isSenderContract = false;

            // Check if the current address is in the sender's list
            for (uint256 j = 0; j < senderContractCount; j++) {
                if (contractAddress == tokens[msg.sender][j]) {
                    isSenderContract = true;
                    break;
                }
            }

            // If it's not the sender's contract, add it to the return array
            if (!isSenderContract) {
                allExceptSender[currentIndex] = contractAddress;
                currentIndex++;
            }
        }

        return allExceptSender;
    }

    function setCollectionUri(
        address collectionContract,
        string memory uri
    ) public {
        collections[collectionContract] = uri;
    }

    function getCollectionUri(
        address collectionContract
    ) public view returns (string memory) {
        return collections[collectionContract];
    }

    function getAllTokenId(
        address tokenContractAddress
    ) public view returns (uint[] memory) {
        uint[] memory ret = new uint[](getNFTCount);
        for (uint i = 0; i < getNFTCount; i++) {
            ret[i] = contractTokenIds[tokenContractAddress][i];
        }
    }

    function getOwnerContractAddresses()
        public
        view
        returns (address[] memory)
    {
        return tokens[msg.sender];
    }

    function getAllSoldItems(
        address nftContract
    ) external view returns (uint256[] memory) {
        return collectionsOfSoldItems[nftContract];
    }

    function isOwnerAddress(address _address) internal view returns (bool) {
        address[] memory ownerAddresses = tokens[msg.sender];
        for (uint i = 0; i < ownerAddresses.length; i++) {
            if (ownerAddresses[i] == _address) {
                return true;
            }
        }
        return false;
    }

    function calculateTotalEscrowedAmount(
        address collectionAddress
    ) private view returns (uint256 totalEscrowed) {
        uint256 totalTokens = contractTokenIds[collectionAddress].length;
        for (uint256 i = 0; i < totalTokens; i++) {
            MarketItem storage item = marketItems[collectionAddress][i];
            if (item.sold) {
                totalEscrowed += item.escrowAmount;
            }
        }
    }

    function checkUpkeep(
        bytes calldata
    ) external view override returns (bool upkeepNeeded, bytes memory performData) {
        for (uint256 i = 0; i < CollectionAddresses.length; i++) {
            address collectionAddress = CollectionAddresses[i];
            CollectionInfo memory info = collectionInfo[collectionAddress];
            bool intervalPassed = (block.timestamp - info.lastTimeStamp) >
                info.updateInterval;
            bool noWinner = collectionWinners[collectionAddress]
                .winnerAddress == address(0);
            bool noPendingRequest = collectionRequestIds[collectionAddress] == 0;

            if (info.allSold && intervalPassed && noWinner && noPendingRequest) {
                return (true, abi.encode(collectionAddress));
            }
        }

        return (false, "");
    }

    function performUpkeep(bytes calldata performData) external override {
        address collectionAddress = abi.decode(performData, (address));
        CollectionInfo storage info = collectionInfo[collectionAddress];
        bool intervalPassed = (block.timestamp - info.lastTimeStamp) >
            info.updateInterval;

        if (
            info.allSold &&
            intervalPassed &&
            collectionWinners[collectionAddress].winnerAddress == address(0) &&
            collectionRequestIds[collectionAddress] == 0
        ) {
            requestWinner(collectionAddress);
        }
    }

    function withdrawCollectedFees(
        address payable destination,
        uint256 amount
    ) external onlyOwner {
        require(amount <= totalFeesCollected, "Amount exceeds collected fees");
        require(destination != address(0), "Invalid destination address");

        totalFeesCollected -= amount;
        destination.transfer(amount);
    }
}
