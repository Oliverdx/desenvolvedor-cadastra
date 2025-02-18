import { filterOption, Product } from "./types";

const sizeOrder: Record<string, number> = { p: 1, m: 2, g: 3, gg: 4, u: 5 };

  // Order sizes by convention
export function orderSizes (sizesArr: filterOption[]){

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

export function removeDuplicated (product: Product[]): Array<Product> {
  const items: Product[] = [];

  product.forEach((product: Product) => {
      if(items.every(item => item.id !== product.id))
        items.push(product)
  });

  return items;
}

export function orderDropdown(){
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
