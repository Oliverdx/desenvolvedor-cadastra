export interface Product {
  id: string;
  name: string;
  price: number;
  parcelamento: Array<number>;
  color: string;
  image: string;
  size: Array<string>;
  date: string;
}

export interface cartItem {
  id: string,
  qtd: string
}

export interface filterOption {
  id: string,
  value: string,
  label?: string
}
