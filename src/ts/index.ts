import { Product } from "./Product";

const serverUrl = "http://localhost:5000";

interface filterOption {
  id: string,
  value: string,
  label?: string
}

interface cartItem {
  id: string,
  qtd: string
}

type PriceRange = { min: number; max: number | null };

const priceRanges: filterOption[] = [
  {id: "50", value: "0-50"},
  {id: "150", value: "51-150"},
  {id: "300", value: "151-300"},
  {id: "500", value: "301-500"},
  {id: "501", value: "501-null"}
];

const sizeOrder: Record<string, number> = { p: 1, m: 2, g: 3, gg: 4, u: 5 };

function removeDuplicated (product: Product[]): Array<Product> {
  const items: Product[] = [];

  product.forEach((product: Product) => {
      if(items.every(item => item.id !== product.id))
        items.push(product)
  });

  return items;
}

function createProductElement (product: Product): HTMLElement {
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
  button.setAttribute("class", "product-button");
  button.setAttribute("data-item", product.id);
  button.addEventListener("click", () => addItemToCart(product.id));
  button.textContent = "Comprar";

  productWrapper.append(img, title, price, desc, button);

  return productWrapper;
};

function renderCheckBox (type: string, filterOptions: filterOption[]){
  const container = document.querySelector(`#filter-${type} .options-wrapper`);
  if (!container) return;

  const createCheckboxLabel = (option: filterOption) => {
    const label = document.createElement("label");
    const checkboxWrapper = document.createElement("div");

    label.setAttribute("for", `${type}-${option.id}`);

    const checkbox = Object.assign(document.createElement("input"), {
      type: "checkbox",
      id: `${type}-${option.id}`,
      name: option.id,
      value: option.value,
    });

    const labelText =
      type === "range"
        ? formatRangeLabel(option.value)
        : option.label;

    label.append(document.createTextNode(labelText));
    checkboxWrapper.append(checkbox, label);
    return checkboxWrapper;
  };

  const formatRangeLabel = (value: string) => {
    const [min, max] = value.split("-");
    return max !== "null"
      ? ` de R$ ${min} até R$${max}`
      : ` a partir de R$${min}`;
  };

  filterOptions.forEach((option) => container.appendChild(createCheckboxLabel(option)));
}

function orderDropdown(){
  const orderbutton: HTMLElement = document.querySelector('.order-button');
  const options:HTMLElement = document.querySelector('.select-options');

  orderbutton.addEventListener("click", () => {
      options.style.display = options.style.display === "block" ? "none" : "block";
  });

  options.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    if (target.tagName === "LI") {
      orderbutton.textContent = target.textContent;
      options.style.display = "none";
    }
  });

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    if (!orderbutton.contains(target) && !options.contains(target) && window.innerWidth > 768) {
      options.style.display = "none";
    }
  });
}

async function getProducts(){
  try{
    const productList: Product[] = await fetch(`${serverUrl}/products`).then(response =>
      response.json()
    );
  
    return productList;
  }catch(err){
    return [];
  }
}

function cartQtd(){
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

function addItemToCart(itemId: string){

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

// Estado dos filtros
const selectedFilters = {
  sizes: new Set<string>(),
  colors: new Set<string>(),
  priceRange: new Set<string>()
};

// Função para converter `value` do filtro de preço
function parsePriceRange(value: string): { min: number; max: number | null } {
  const [minStr, maxStr] = value.split("-");
  const min = parseInt(minStr, 10);
  const max = maxStr === "null" ? null : parseInt(maxStr, 10);
  return { min, max };
}

function handleCheckboxChange(event: Event, products:Product[]) {
  const target = event.target as HTMLInputElement;
  const [type, id] = target.id.split("-"); // Exemplo: "color-preto" → ["color", "preto"]

  if (!type || !id) return;

  if (type === "size") {
    selectedFilters.sizes.has(id) ? selectedFilters.sizes.delete(id) : selectedFilters.sizes.add(id);
  } else if (type === "color") {
    selectedFilters.colors.has(id) ? selectedFilters.colors.delete(id) : selectedFilters.colors.add(id);
  } else if (type === "range") {
    selectedFilters.priceRange.has(target.value) ? selectedFilters.priceRange.delete(target.value) : selectedFilters.priceRange.add(target.value);
  }

  const appliedFilter = applyFilters(products);
  return appliedFilter;
}

// Função que aplica os filtros
function applyFilters(products: Product[]) {
  const productsFiltered = products.filter((product) => {
    // Filtrando por tamanho
    const sizeMatch =
      selectedFilters.sizes.size === 0 || product.size.some(size => selectedFilters.sizes.has(size.toLowerCase()));

    // Filtrando por cor
    const colorMatch =
      selectedFilters.colors.size === 0 || selectedFilters.colors.has(product.color.toLowerCase());

    // Filtrando por faixa de preço
    const priceMatch =
      selectedFilters.priceRange.size === 0 ||
      Array.from(selectedFilters.priceRange).some(price => {
        const { min, max } = parsePriceRange(price);
        return product.price >= min && (max === null || product.price <= max);
      });

    return sizeMatch && colorMatch && priceMatch;
  });
  console.log('productsFiltered', productsFiltered);
  return productsFiltered;
}

function orderSizes (sizesArr: filterOption[]){
  return sizesArr.sort((a: filterOption, b: filterOption) => {
    const isANumber = !isNaN(Number(a.id));
    const isBNumber = !isNaN(Number(b.id));

    if (!isANumber && !isBNumber) {
      return (sizeOrder[a.id] || 99) - (sizeOrder[b.id] || 99);
    }
    if (!isANumber) return -1;
    if (!isBNumber) return 1;
    
    return Number(a.id) - Number(b.id);
  });
}

function renderProducts (productList: Product[]){
  const productContainer = document.getElementById("product-list");
  productContainer.innerHTML = ""; // Limpa o container

  productList.forEach(product => {
    const productElement = createProductElement(product);
    productContainer.appendChild(productElement);
  });
}


async function main() {
  
  try{
    const productList: Product[] = await getProducts();
    let availableColors: filterOption[] = [];
    let availableSizes: filterOption[] = [];
    let productListNormalized: Product[] = [];

    // const productContainer = document.getElementById("product-list");

    if(productList.length){
      productListNormalized = removeDuplicated(productList); // remove the duplicated products;

      productListNormalized.forEach(product => {
        if(availableColors.every(elem => elem.label !== product.color))
          availableColors.push({
            id: product.color.toLowerCase(),
            value: product.color.toLowerCase(),
            label: product.color
          });

        product.size.forEach(size => {
          if(availableSizes.every(elem => elem.label !== size))
            availableSizes.push({
            id: size.toLowerCase(),
            value: size.toLowerCase(),
            label: size
          });  
        });
      });

      availableSizes = orderSizes(availableSizes);


      renderProducts(productListNormalized);

      //RenderFilters
      renderCheckBox("color", availableColors);
      renderCheckBox("size", availableSizes);
      renderCheckBox("range", priceRanges);
      orderDropdown();
      cartQtd();

      document.querySelectorAll('input[type="checkbox"]').forEach((checkbox: HTMLElement) => {
        checkbox.addEventListener("change", event  => {
          const filteredProducts = handleCheckboxChange(event, productListNormalized);
          renderProducts(filteredProducts);
        });
      });

    }
  }catch(err){
    throw new Error(err);
  }
}

document.addEventListener("DOMContentLoaded", main);
