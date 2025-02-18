import { filterOption } from "./types";

export function renderCheckBox (type: string, filterOptions: filterOption[]){
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
