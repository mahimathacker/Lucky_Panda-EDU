// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@chainlink/contracts/src/v0.8/dev/vrf/VRFConsumerBaseV2Plus.sol";
import "@chainlink/contracts/src/v0.8/dev/vrf/libraries/VRFV2PlusClient.sol";

contract ChainlinkVRF is VRFConsumerBaseV2Plus {
    uint256 private _tokenIdCounter;
    uint32 public callbackGasLimit = 100000;
    uint16 public requestConfirmations = 3;
    uint32 public numWords = 1;
    uint256 s_subscriptionId;
    bytes32 keyHash;
    uint256 public s_randomTokenCount;
    bool public nativePayment = true;

    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256 randomtokenCount);
    event ReturnedRandomAddress(uint256 randomtokenCount);

     struct RequestStatus {
           bool fulfilled;
    bool exists;
    uint256 nftCount; // NFT count at the time of the request
    uint256 randomTokenNumber; // The resulting random number
    }
    mapping(uint256 => RequestStatus)
        public s_requests; /* requestId --> requestStatus */
    mapping(address => uint256) public collectionToRequestId;

    mapping(address => uint256) public addressToRequestId;
     // past requests Id.
    uint256[] public requestIds;
    uint256 public lastRequestId;
    address marketplaceOwner;
 constructor(
        uint256 _subscriptionId,
        bytes32 _keyHash,
        address _vrfCoordinator
        )
        VRFConsumerBaseV2Plus(_vrfCoordinator)

    {
    
        s_subscriptionId = _subscriptionId;
        keyHash = _keyHash;
    }

    function getRequestStatus(
        uint256 _requestId
    ) external view returns (bool fulfilled, uint256 randomTokenNumber) {
        require(s_requests[_requestId].exists, "request not found");
        RequestStatus memory request = s_requests[_requestId];
        return (request.fulfilled, request.randomTokenNumber);
    }


    function requestRandomWords(uint256 nftCount, address tokenAddress)
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
        nftCount: nftCount,
        randomTokenNumber: 0,
        exists: true,
        fulfilled: false
        });
        s_randomTokenCount = nftCount;
        requestIds.push(requestId);
        lastRequestId = requestId;
        collectionToRequestId[tokenAddress] = requestId;
        emit RequestSent(requestId, numWords);
        return requestId;
    }
    function getRequestIdForCollection(address collectionAddress)
        external
        view
        returns (uint256)
    {
        return collectionToRequestId[collectionAddress];
    }
   
  function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        require(s_requests[_requestId].exists, "request not found");
        s_requests[_requestId].fulfilled = true;
         uint256 nftCount = s_requests[_requestId].nftCount;
    uint256 randomTokenNumber = _randomWords[0] % nftCount;
    s_requests[_requestId].randomTokenNumber = randomTokenNumber;
    emit RequestFulfilled(_requestId, randomTokenNumber);

    }
}
