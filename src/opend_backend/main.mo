import Cycles "mo:base/ExperimentalCycles";
import Principal "mo:base/Principal";
import NFTActorClass "../NFT/nft";

actor OpenD {
 
    public shared(msg) func mint(imgData: [Nat8], name: Text): async Principal {


    Cycles.add(100_500_000_000);
    let owner : Principal = msg.caller;
    let newNFT = await NFTActorClass.NFT(name, owner, imgData);

    let newNFTPrincipal = await newNFT.newCanisterID();


   return newNFTPrincipal;


    }



};
