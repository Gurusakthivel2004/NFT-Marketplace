import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  ItemBought as ItemBoughtEvent,
  ItemCanceled as ItemCanceledEvent,
  ItemListed as ItemListedEvent,
} from "../generated/NftMarketPlace/NftMarketPlace";
import {
  ItemBought,
  ItemCanceled,
  ItemListed,
  ActiveItem,
} from "../generated/schema";

export function handleItemBought(event: ItemBoughtEvent): void {
  let uniqueId = getIdFromEventParams(
    event.params.tokenId,
    event.params.nftAddress
  );
  let itemBought = ItemBought.load(uniqueId);
  let activeItem = ActiveItem.load(uniqueId);

  if (!itemBought) {
    itemBought = new ItemBought(uniqueId);
  }
  itemBought.buyer = event.params.buyer;
  itemBought.nftAddress = event.params.nftAddress;
  itemBought.tokenId = event.params.tokenId;
  activeItem!.buyer = event.params.buyer;

  itemBought.save();
  activeItem!.save();
}

export function handleItemCanceled(event: ItemCanceledEvent): void {
  let uniqueId = getIdFromEventParams(
    event.params.tokenId,
    event.params.nftAddress
  );
  let itemcanceled = ItemCanceled.load(uniqueId);
  let activeItem = ActiveItem.load(uniqueId);

  if (!itemcanceled) {
    itemcanceled = new ItemCanceled(uniqueId);
  }

  itemcanceled.seller = event.params.seller;
  itemcanceled.nftAddress = event.params.nftAddress;
  itemcanceled.tokenId = event.params.tokenId;
  activeItem!.buyer = Address.fromString(
    "0x000000000000000000000000000000000000dEaD"
  );
  itemcanceled.save();
  activeItem!.save();
}

export function handleItemListed(event: ItemListedEvent): void {
  let uniqueId = getIdFromEventParams(
    event.params.tokenId,
    event.params.nftAddress
  );
  let itemListed = ItemListed.load(uniqueId);
  let activeItem = ActiveItem.load(uniqueId);

  if (!itemListed) {
    itemListed = new ItemListed(uniqueId);
  }
  if (!activeItem) {
    activeItem = new ActiveItem(uniqueId);
  }

  itemListed.seller = event.params.seller;
  activeItem.seller = event.params.seller;

  itemListed.nftAddress = event.params.nftAddress;
  activeItem.nftAddress = event.params.nftAddress;

  itemListed.tokenId = event.params.tokenId;
  activeItem.tokenId = event.params.tokenId;

  itemListed.price = event.params.price;
  activeItem.price = event.params.price;

  activeItem.buyer = Address.fromString(
    "0x0000000000000000000000000000000000000000"
  );

  itemListed.save();
  activeItem.save();
}

function getIdFromEventParams(tokenId: BigInt, nftAddress: Address): string {
  return tokenId.toHexString() + nftAddress.toHexString();
}
