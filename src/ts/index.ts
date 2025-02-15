import { Product } from "./Product";

const serverUrl = "http://localhost:5000";

interface filterOption {
  id: string,
  value: string,
  label?: string
}

const priceRanges: filterOption[] = [
  {id: "50", value: "0-50"},
  {id: "150", value: "51-150"},
  {id: "300", value: "151-300"},
  {id: "500", value: "301-500"},
  {id: "501", value: "501-null"}
];

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
  button.textContent = "Comprar";

  productWrapper.append(img, title, price, desc, button);

  return productWrapper;
};

function renderCheckBox (type: string, filterOptions: filterOption[]){
  
  const container = document.querySelector(`#filter-${type} .options-wrapper`)
  
  filterOptions.forEach((option: filterOption) => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');

    checkbox.type = "checkbox";
    checkbox.id = option.id;
    checkbox.name = option.id;
    checkbox.value = option.value;

    label.appendChild(checkbox);
    label.setAttribute("for", option.id);

    if(type === "range"){
      const range = option.value.split("-");
      const rangeLabel =
        range[1] !== "null" ? ` de R$ ${range[0]} até R$${range[1]}` : ` a partir de R$${range[0]}`

      label.appendChild(document.createTextNode(rangeLabel));
    }else{
      label.appendChild(document.createTextNode(option.label));
    }

    container?.appendChild(label);

  });
}

function filterProducts(products: Product[]): Product[] {
  const selectedRanges = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="price"]:checked'))
    .map(input => input.value);

  if (!selectedRanges.length) return products;

  return products.filter(product => {
    const productPrice = product.price;
    
    return selectedRanges.some(range => {
      const [min, max] = range.split("-").map(Number);
      return max ? productPrice >= min && productPrice <= max : productPrice >= min;
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const button: HTMLElement = document.querySelector(".select-button");
  const options: HTMLElement = document.querySelector(".select-options");

  button.addEventListener("click", () => {
    options.style.display = options.style.display === "block" ? "none" : "block";
  });

  options.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    if (target.tagName === "LI") {
      button.textContent = target.textContent;
      options.style.display = "none";
    }
  });

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (!button.contains(target) && !options.contains(target)) {
      options.style.display = "none";
    }
  });
});

async function main() {
  
  try{
    let availableColors: filterOption[] = [];
    let availableSizes: filterOption[] = [];

    const productList: Product[] = await fetch(`${serverUrl}/products`).then(response =>
      response.json()
    );

    const productContainer = document.getElementById("product-list");

    if(productList.length){
      const itemList = removeDuplicated(productList); // remove the duplicated products;

      itemList.forEach(product => {
        const productElement = createProductElement(product);
        productContainer.appendChild(productElement);

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

      //RenderFilters

      renderCheckBox("color", availableColors);
      renderCheckBox("size", availableSizes);
      renderCheckBox("range", priceRanges);
      
    }
  }catch(err){
    throw new Error(err);
  }
}

document.addEventListener("DOMContentLoaded", main);
