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
  button.textContent = "Comprar";

  productWrapper.append(img, title, price, desc, button);

  return productWrapper;
};

function renderCheckBox (type: string, filterOptions: filterOption[]){
  const container = document.querySelector(`#filter-${type} .options-wrapper`);
  if (!container) return;

  const createCheckboxLabel = (option: filterOption) => {
    const label = document.createElement("label");
    label.setAttribute("for", option.id);

    const checkbox = Object.assign(document.createElement("input"), {
      type: "checkbox",
      id: option.id,
      name: option.id,
      value: option.value,
    });

    const labelText =
      type === "range"
        ? formatRangeLabel(option.value)
        : option.label;

    label.append(checkbox, document.createTextNode(labelText));
    return label;
  };

  const formatRangeLabel = (value: string) => {
    const [min, max] = value.split("-");
    return max !== "null"
      ? ` de R$ ${min} até R$${max}`
      : ` a partir de R$${min}`;
  };

  filterOptions.forEach((option) => container.appendChild(createCheckboxLabel(option)));
}

function openDropdown(){
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

      availableSizes = availableSizes.sort((a, b) => {
        const isANumber = !isNaN(Number(a.id));
        const isBNumber = !isNaN(Number(b.id));

        if (!isANumber && !isBNumber) {
          return (sizeOrder[a.id] || 99) - (sizeOrder[b.id] || 99);
        }
        if (!isANumber) return -1;
        if (!isBNumber) return 1;
        
        return Number(a.id) - Number(b.id);
      });

      //RenderFilters

      renderCheckBox("color", availableColors);
      renderCheckBox("size", availableSizes);
      renderCheckBox("range", priceRanges);
      openDropdown();

    }
  }catch(err){
    throw new Error(err);
  }
}

document.addEventListener("DOMContentLoaded", main);
