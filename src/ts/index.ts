import { cartQtd } from "./cart";
import { renderCheckBox } from "./Checkbox";
import { orderDropdown, orderSizes, removeDuplicated } from "./Helpers";
import { clearForm, filterListener, modalFunction } from "./modal";
import { getProducts, productRenderHelper } from "./Product";
import { Product, filterOption, cartItem} from "./types";

const priceRanges: filterOption[] = [
  {id: "50", value: "0-50"},
  {id: "150", value: "51-150"},
  {id: "300", value: "151-300"},
  {id: "500", value: "301-500"},
  {id: "501", value: "501-null"}
];



async function main() {
  
  try{
    const productList: Product[] = await getProducts();
    let availableColors: filterOption[] = [];
    let availableSizes: filterOption[] = [];
    let productListNormalized: Product[] = [];

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

      productRenderHelper(productListNormalized);

      //RenderFilters
      renderCheckBox("color", availableColors);
      renderCheckBox("size", availableSizes);
      renderCheckBox("range", priceRanges);
      filterListener(productListNormalized); //Desktop filter Listener
      orderDropdown();
      cartQtd();
      modalFunction(productListNormalized);

      // Filter function listener

      document.getElementById("clean-filter").addEventListener("click", () => clearForm(productListNormalized));

      if(window.innerWidth < 768){
        
      }

    }
  }catch(err){
    throw new Error(err);
  }
}

document.addEventListener("DOMContentLoaded", main);
