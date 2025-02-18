import { Product } from "./types";
import { addItemToCart } from "./cart"

const serverUrl = "http://localhost:5000";

export function createProductElement (product: Product): HTMLElement {
  const productWrapper = document.createElement("div");
  productWrapper.setAttribute("id", `product-${product.id}`);
  productWrapper.setAttribute("class", "product-item");
  
  const img = document.createElement("img");
  img.src = product.image;
  img.alt = product.name;

  const title = document.createElement("h4");
  title.setAttribute("class", "product-title");
  title.textContent = product.name;

  const price = document.createElement("b");
  price.setAttribute("class", "product-price");
  price.textContent = `R$${product.price.toFixed(2)}`;

  const desc = document.createElement("span");
  desc.setAttribute("class", "product-desc");
  desc.textContent = `Até ${product.parcelamento[0]}x de R$${product.parcelamento[1].toFixed(2)}`;

  const button = document.createElement("button");
  button.setAttribute("class", "product-button primary-btn");
  button.setAttribute("data-item", product.id);
  button.addEventListener("click", () => addItemToCart(product.id));
  button.textContent = "Comprar";

  productWrapper.append(img, title, price, desc, button);

  return productWrapper;
};

function renderProducts (productList: Product[]){
  const productContainer = document.getElementById("product-list");
  productContainer.style.opacity = "0";
  productContainer.style.transition = "opacity 0.1s ease-out";

  setTimeout(() => {
    productContainer.innerHTML = ""; // under the roof clear

    productList.forEach(product => {
      const productElement = createProductElement(product);
      productContainer.appendChild(productElement);
    });

    // Fade effect
    setTimeout(() => {
      productContainer.style.opacity = "1";

      if(productList.length === 0){
        productContainer.appendChild(document.createTextNode("Nenhum produto encontrado"));
        return;
      }
    }, 100);
  }, 100);

}

export async function getProducts(){
  try{
    const productList: Product[] = await fetch(`${serverUrl}/products`).then(response =>
      response.json()
    );
  
    return productList;
  }catch(err){
    return [];
  }
}

// Helper to render the products correctly by screen size and load more
export function productRenderHelper(productList: Product[]) {
  const loadMoreButton = document.getElementById("more-products") as HTMLElement;

  let itemsToShow = window.innerWidth < 768 ? 4 : productList.length;
  
  renderProducts(productList.slice(0, itemsToShow));

  if (itemsToShow < productList.length) {
    loadMoreButton.style.display = "block";
  } else {
    loadMoreButton.style.display = "none";
  }

  loadMoreButton.onclick = () => {
    itemsToShow += 2; // Increase items count
    renderProducts(productList.slice(0, itemsToShow));

    // Hide button when all products are shown
    if (itemsToShow >= productList.length) {
      loadMoreButton.style.display = "none";
    }
  };

  // Recalculate when window resizes
  window.onresize = () => {
    const newItemsToShow = window.innerWidth < 768 ? 4 : productList.length;
    if (newItemsToShow !== itemsToShow) {
      itemsToShow = newItemsToShow;
      renderProducts(productList.slice(0, itemsToShow));
    }
  };
}
