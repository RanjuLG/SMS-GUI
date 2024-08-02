export interface Item {
    
    itemId:number;
    itemDescription: string;
    itemCaratage: number;
    itemGoldWeight: number;
    //amountPerCaratage: number;
    //quantity: number;
    itemValue: number;
    status:number;
    createdAt?: Date;
    updatedAt?: Date;
    customerId?: number;
    //selected?: boolean;
}
  
  
  
export interface ItemDto {
    itemId:number;
    itemDescription: string;
    itemCaratage: number;
    itemGoldWeight: number;
    //amountPerCaratage: number;
    //quantity: number;
    itemValue: number;
    createdAt: string;
    customerId: number;
    status:number;
    //selected?: boolean;

}


  
  
export interface CreateItemDto {
    itemId:number;
    itemDescription: string;
    itemCaratage: number;
    itemGoldWeight: number;
    itemValue: number;
    createdAt: string;
    customerNIC: string;
    status:number;
    
}

  