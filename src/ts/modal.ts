import { productRenderHelper } from "./Product";
import { Product } from "./types";

export function modalFunction(productList: Product[]){
  const modal = document.querySelector('#modal') as HTMLElement;
  const modalContentWrapper = document.getElementById('modal-content') as HTMLElement;
  const closeModalBtn = document.querySelectorAll(".closemodal-btn");
  const modalTitle = document.querySelector('.modal-title') as HTMLElement;
  const modalFilterBtnWrapper = document.getElementById("modal-filter-btns");
  const modalForm = document.getElementById('modalForm');
  let content: HTMLElement;

  const modalClose = () => {
    modal.style.display = "none"
    document.querySelector("body").style.overflow = "";
  };

  modalForm.addEventListener('submit', event => event.preventDefault());

  closeModalBtn.forEach(btn => btn.addEventListener('click', modalClose));

  document.querySelectorAll("[class^='modalbtn-']").forEach(btn =>{
    btn.addEventListener('click', () =>{
      if(btn.className.indexOf("filter") > 1){
        modalTitle.innerText = "Filtrar";
        content = document.querySelector('.sidebar');

      }else{
        modalTitle.innerText = "Ordenar";
        content = document.querySelector('.select-options');
        modalFilterBtnWrapper.style.display = "none";
      }
      modalContentWrapper.innerHTML = "";
      modalContentWrapper.appendChild(content.cloneNode(true));

      if(btn.className.indexOf("filter") > 1){
        filterListener(productList);
        modalFilterBtnWrapper.style.display = "flex";
      }

      if(modal.style.display === "none"){
        modal.style.display = "block"
        document.querySelector("body").style.overflow = "hidden";
      }else{
        closeModalBtn.forEach(btn => btn.removeEventListener("click", modalClose));
        modal.style.display = "none";
        document.querySelector("body").style.overflow = "";
      }

      // Make the dropdown for Filter modal
      document.querySelectorAll('#modal-content .sidebar-title').forEach(filterTitle => {
        filterTitle.addEventListener('click', toggleDropdown)
      });

    
    });
  });
}

export function clearForm(productList: Product[]){
  const modalForm = document.getElementById('modalForm');
  modalForm.addEventListener('submit', event => event.preventDefault());
  const inputList = new Set(Array.from(modalForm.getElementsByTagName('input')));
  
  inputList.forEach(input => input.checked = false);

  productRenderHelper(productList)
}

export function filterListener(productList: Product[]){
  document.querySelectorAll('input[type="checkbox"]').forEach((checkbox: HTMLElement) => {
    checkbox.addEventListener("change", event  => {
      const filteredProducts = handleCheckboxChange(event, productList);
      productRenderHelper(filteredProducts);
    });
  });
}

export function toggleDropdown(dropdownTitle: Event){
  const target = dropdownTitle.target as HTMLElement;
  const sibling = target.nextElementSibling as HTMLElement
  const display = sibling.style.display;
  sibling.style.display = display === "flex" ? "none" : "flex";
}



export function applyFilters(products: Product[]) {
  const productsFiltered = products.filter((product) => {
    // Filter by size
    const sizeMatch =
      selectedFilters.sizes.size === 0 || product.size.some(size => selectedFilters.sizes.has(size.toLowerCase()));

    // Filter by color
    const colorMatch =
      selectedFilters.colors.size === 0 || selectedFilters.colors.has(product.color.toLowerCase());

    // Filter by price range
    const priceMatch =
      selectedFilters.priceRange.size === 0 ||
      Array.from(selectedFilters.priceRange).some(price => {
        const { min, max } = parsePriceRange(price);
        return product.price >= min && (max === null || product.price <= max);
      });

    return sizeMatch && colorMatch && priceMatch;
  });

  return productsFiltered;
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
