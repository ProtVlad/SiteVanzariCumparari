export class Product {
    id: number;
    name: string;
    description: string;
    image: string;
    price: number;
    user_id: number;
    tag: string;
    constructor(id: number, name: string, description: string, image: string, price: number, user_id: number, tag: string) {
      this.id = id;
      this.name = name;
      this.description = description;
      this.image = image;
      this.price = price;
      this.user_id = user_id;
      this.tag = tag;
    }
  }