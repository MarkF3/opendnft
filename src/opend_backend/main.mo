import Cycles "mo:base/ExperimentalCycles";
import Principal "mo:base/Principal";
import NFTActorClass "../NFT/nft";
import HashMap "mo:base/HashMap";
import List "mo:base/List";


actor OpenD {

    var mapOfNTFs = HashMap.HashMap<Principal, NFTActorClass.NFT>(1, Principal.equal, Principal.hash);
    var mapOfOwners = HashMap.HashMap<Principal, List.List<Principal>>(1, Principal.equal, Principal.hash);

 
    public shared(msg) func mint(imgData: [Nat8], name: Text): async Principal {


    Cycles.add(100_500_000_000);
    let owner : Principal = msg.caller;
    let newNFT = await NFTActorClass.NFT(name, owner, imgData);

    let newNFTPrincipal = await newNFT.newCanisterID();

    mapOfNTFs.put(newNFTPrincipal, newNFT);

   return newNFTPrincipal;


    }



};
