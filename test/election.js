var Election = artifacts.require("./Election.sol");

contract("Election", function(accounts) {
    var electionInstance; 
    //Mocha and chai?
    it("initializes with two candidates", function() {
        return Election.deployed().then(function(instance) {
            return instance.candidatesCount();
        }).then(function(count) {
            assert.equal(count, 2);
        });
    });

    it("initializes the candidates with the correct values", function() {
        return Election.deployed().then(function(instance) {
            electionInstance = instance;
            return electionInstance.candidates(1);
        }).then(function(candidate){
            assert.equal(candidate[0], 1, "contains the correct id");
            assert.equal(candidate[1], "Candidate 1", "contains the correct name");
            assert.equal(candidate[2], 0, "contains the correct votes count");
            return electionInstance.candidates(2);
        }).then(function(candidate){
            assert.equal(candidate[0], 2, "contains the correct id");
            assert.equal(candidate[1], "Candidate 2", "contains the correct name");
            assert.equal(candidate[2], 0, "contains the correct votes count");
        });
    });

    it("allow a voter to cast a vote", function() {
        return Election.deployed().then(function(instance) {
            electionInstance = instance;
            candidateId = 1;
            return electionInstance.vote(1, {from: accounts[0]});
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, "there should be a triggered event");
            assert.equal(receipt.logs[0].event, "votedEvent", "Event type is not correct");
            assert.equal(receipt.logs[0].args._candidateId.toNumber(), candidateId, "Wrong _candidateId");
            return electionInstance.voters(accounts[0]);  
            //return voted = true if the voter has voted successfully 
        }).then(function(voted){
            assert(voted, "the voter has voted successfully"); 
            // ^ that's why we only use assert here instead of assert.equal
            return electionInstance.candidates(candidateId);
            // return candidates[1].voteCount to check if it has incremented or not
        }).then(function(candidate){
            let voteCount = candidate[2];
            assert.equal(voteCount, 1, "Increments the candidate's vote count");
        });
    });

    it("throw an exception for invalid candidates", function() {
        return Election.deployed().then(function(instance) {
            electionInstance = instance;
            return electionInstance.vote(99, {from: accounts[1]});
            //remember that accounts[0] has voted and it can't vote twice
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            return electionInstance.candidates(1)
        }).then(function(candidate1){
            let voteCount = candidate1[2]; // [2] stands for voteCount
            assert.equal(voteCount, 1, "Candidate 1 should not receive any vote");
            //1 because it was voted up once before
            return electionInstance.candidates(2)
        }).then(function(candidate2){
            let voteCount = candidate2[2];
            assert.equal(voteCount, 0, "Candidate 2 should not receive any vote");
        });
    });

    it("throw an exception for double voting", function(){
        return Election.deployed().then(function(instance) {
            electionInstance = instance;
            candidateId = 2;
            electionInstance.vote(candidateId, {from: accounts[2]});
            //remember accounts[1] has voted up there
            return electionInstance.candidates(candidateId);
        }).then(function(candidate) {
            var voteCount = candidate[2];
            assert.equal(voteCount, 1, "accepts first vote");
            return electionInstance.vote(candidateId, {from: accounts[2]});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 1, "error message must has revert");
            return electionInstance.candidates(1);
        }).then(function(candidate1) {
            let voteCount = candidate1[2];
            assert.equal(voteCount, 1, "Candidate 1 should not get any vote");
            return electionInstance.candidates(2);
        }).then(function(candidate2) {
            let voteCount = candidate2[2];
            assert.equal(voteCount, 1, "Candidate 2 should only get 1 extra from this test");
        });
    });
});