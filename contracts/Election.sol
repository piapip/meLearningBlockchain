pragma solidity ^0.5.8;

contract Election {
    //Model + Store + Fetch + Store candidate count

    //Model
    //I heard that if we ever want to access its properties... instead of using .id, we have to remember the order
    //then use c[0] to get id for example <- in console and while you are testing in js file
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    //Store
    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public voters;

    //Store candidates count because there's no way to count the size in Solidity because
    //let's assume that we have 3 candidates, in other normal coding language, if we call the 4th one,
    //it will return a segment memory failed because we exceed the preset limit.
    //But contrast to that, solidity will return a default, blank variable, as if the 4th candidate exists
    //so it will keep looping and looping.
    uint public candidatesCount;

    event votedEvent (
        uint indexed _candidateId
    );

    constructor() public {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }

    function addCandidate (string memory _name) private {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function vote (uint _candidateId) public {
        require(!voters[msg.sender], "Each voter can only vote once");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Candidate must exists");
        voters[msg.sender] = true;
        candidates[_candidateId].voteCount++;
        emit votedEvent(_candidateId);
    }
}