import { Product, cartItem} from "./types";

export function cartQtd(){
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  let cartQtd = 0;

  cartItems.forEach((item: cartItem) => {
    cartQtd = cartQtd + parseInt(item.qtd);
  });

  if(cartItems.length > 0 && cartQtd >= 1){
    let cart: HTMLElement = document.querySelector('.cart-qtd');

    if(!cart){
      cart = document.createElement("span");
      cart.setAttribute("class", "cart-qtd");
      
    }

    cart.textContent = cartQtd.toString();
    document.getElementById("cart-btn").append(cart);
  }
}

export function addItemToCart(itemId: string){

  let cartItems = JSON.parse(localStorage.getItem("cart")) || [];

  if(cartItems.every((item: cartItem) => item.id !== itemId)){
    cartItems.push({id: itemId, qtd: 1})
  }else{
    cartItems = cartItems.map((item: cartItem) => {
      if(item.id === itemId)
        return {...item, qtd: item.qtd+1}
      return item;
    });
  }

  localStorage.setItem("cart", JSON.stringify(cartItems));
  cartQtd();

}
