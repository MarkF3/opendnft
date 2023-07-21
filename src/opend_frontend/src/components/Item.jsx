import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";

import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { idlFactory as tokenIdlFactory } from "../../../declarations/token_backend";
import { Principal } from "@dfinity/principal";
import Button from "./button";
import {opend_backend } from "../../../declarations/opend_backend"
import CURRENT_USER_ID from "../index";
import PriceLabel from "./PriceLabel";

function Item(props) {

  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur, setBlur] = useState();
  const [sellStatus, setSellStatus] = useState("");
  const [priceLabel, setPriceLabel] = useState();

  const id = props.id;

  const localhost = "http://localhost:8080/";
  const agent = new HttpAgent({host: localhost});


  //Remove below line when deploying project
  agent.fetchRootKey();
  let NFTActor;


  async function loadNFT() {

    NFTActor = await Actor.createActor(idlFactory, {
    agent,
    canisterId: id

    });

    

    const name = await NFTActor.getName();
    

    const owner =  await NFTActor.getOwner();
  
  

    const imageData = await NFTActor.getImage();
    const imageContent = new Uint8Array(imageData);
    const image = URL.createObjectURL(new Blob([imageContent.buffer], {type: "image/png"}));


    setOwner(owner.toText());
    setName(name);
    setImage(image);

    console.log("the role is " + props.role)
    if (props.role == "collection") {

    const nftIsListed = await opend_backend.isListed(props.id);
    console.log("nft listed is " + nftIsListed);

    if(nftIsListed == true) {
      setOwner("OpenD");
      setBlur({filter: "blur(4px)"})
      setSellStatus("Listed");
       }else{

        setButton(<Button handleClick={handleSell} text={"Sell"}/>);
       }
       } else if(props.role == "discover") {
        const originalOwner = await opend_backend.getOriginalOwner(props.id);
        if(originalOwner.toText() != CURRENT_USER_ID.toText()){

        setButton(<Button handleClick={handleBuy} text={"Buy"}/>);
      } 

      //price here

      const itemPrice = await opend_backend.getListedNFTPrice(props.id);
      setPriceLabel(<PriceLabel sellPrice={itemPrice.toString()} />)

       }
  }

useEffect(() => {loadNFT();}, []);


let price;

function handleSell() {

  
  setBlur({filter: "blur(4px)"});
console.log("sell clicked");
setPriceInput(<input
  placeholder="Price in Coin"
  type="number"
  className="price-input"
  value={price}
  onChange={(e) => price = e.target.value}
  />
  );
  setButton(<Button handleClick={sellItem} text={"Confirm"}/>);

}

async function sellItem(){

setLoaderHidden(false);
console.log("Sell Item active " + price);
const listingResult = await opend_backend.listItem(props.id, Number(price));
console.log(listingResult);
if (listingResult == "success"){
const openDId = await opend_backend.getOpenDCanisterID();
console.log(openDId);
const transferResult = await NFTActor.transferOwnership(openDId);
console.log(transferResult);
if(listingResult == "success") {
  setLoaderHidden(true);
  setOwner("OpenD");
  setButton();
  setPriceInput();
  setSellStatus("Listed")

}

}
}



async function handleBuy() {

  console.log("buy triggered");

const tokenActor = await Actor.createActor(tokenIdlFactory, {
  agent,
  canisterId: Principal.fromText("aax3a-h4aaa-aaaaa-qaahq-cai")
})


const sellerId = await opend_backend.getOriginalOwner(props.id)
const itemPrice = await opend_backend.getListedNFTPrice(props.id)

const result = await tokenActor.transfer(sellerId, itemPrice)
if(result == "Done!"){
  //Transfer Ownership
const transferResult = await opend_backend.completePurchase(props.id, sellerId, CURRENT_USER_ID);
console.log(transferResult);


}
console.log(result);
}



  return (
    <div className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
        />
         <div hidden={loaderHidden} className="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
        <div className="disCardContent-root">
          {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text">
               {sellStatus}
            </span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
