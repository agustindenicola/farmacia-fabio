const selected = new Map();
const selectedProducts = document.querySelector("#selectedProducts");
const cartCount = document.querySelector("#cartCount");
const productSearch = document.querySelector("#productSearch");
const emptyState = document.querySelector("#emptyState");
const orderForm = document.querySelector("#orderForm");
const customerName = document.querySelector("#customerName");
const customerPhone = document.querySelector("#customerPhone");
const deliveryMethod = document.querySelector("#deliveryMethod");
const paymentMethod = document.querySelector("#paymentMethod");
const deliveryZone = document.querySelector("#deliveryZone");
const deliveryAddress = document.querySelector("#deliveryAddress");
const healthPlan = document.querySelector("#healthPlan");
const hasPrescription = document.querySelector("#hasPrescription");
const customerMessage = document.querySelector("#customerMessage");
const orderPreview = document.querySelector("#orderPreview");
const productCards = document.querySelectorAll(".product-card");

function renderSelectedProducts() {
  const products = [...selected.values()];
  selectedProducts.innerHTML = products.length
    ? products.map((item) => `
        <span class="selected-item">
          ${item.quantity} x ${item.name}
          <button type="button" data-minus="${item.name}">-</button>
          <button type="button" data-plus="${item.name}">+</button>
        </span>
      `).join("")
    : "Ninguno";
  cartCount.textContent = selected.size === 1 ? "1 producto" : `${selected.size} productos`;
  renderOrderPreview();
}

function renderOrderPreview() {
  const lines = buildOrderLines({ preview: true });
  orderPreview.textContent = lines.join("\n");
}

function buildOrderLines() {
  const name = customerName.value.trim();
  const phone = customerPhone.value.trim();
  const message = customerMessage.value.trim();
  const products = [...selected.values()];
  return [
    "Hola Farmacia Fabio, quiero hacer un pedido/consulta.",
    name ? `Nombre: ${name}.` : "",
    phone ? `Telefono: ${phone}.` : "",
    products.length ? `Productos: ${products.map((item) => `${item.quantity} x ${item.name}`).join(", ")}.` : "",
    `Entrega: ${deliveryMethod.value}.`,
    deliveryZone.value.trim() ? `Zona/localidad: ${deliveryZone.value.trim()}.` : "",
    deliveryMethod.value === "Envio a domicilio" && deliveryAddress.value.trim()
      ? `Direccion: ${deliveryAddress.value.trim()}.`
      : "",
    `Pago: ${paymentMethod.value}.`,
    healthPlan.value.trim() ? `Obra social/prepaga: ${healthPlan.value.trim()}.` : "",
    hasPrescription.checked ? "Tengo receta para adjuntar por este chat." : "",
    message ? `Consulta: ${message}` : "",
  ].filter(Boolean);
}

productCards.forEach((card) => {
  const button = card.querySelector(".add-button");
  const name = card.dataset.name;

  button.addEventListener("click", () => {
    if (selected.has(name)) {
      selected.delete(name);
      button.textContent = "Agregar";
      button.classList.remove("is-selected");
    } else {
      selected.set(name, { name, quantity: 1 });
      button.textContent = "Agregado";
      button.classList.add("is-selected");
    }

    renderSelectedProducts();
  });
});

selectedProducts.addEventListener("click", (event) => {
  const minus = event.target.closest("[data-minus]");
  const plus = event.target.closest("[data-plus]");
  const name = minus?.dataset.minus || plus?.dataset.plus;
  if (!name || !selected.has(name)) return;
  const item = selected.get(name);
  if (plus) item.quantity += 1;
  if (minus) item.quantity = Math.max(1, item.quantity - 1);
  renderSelectedProducts();
});

productSearch.addEventListener("input", () => {
  const query = productSearch.value.trim().toLowerCase();
  let visibleCount = 0;

  productCards.forEach((card) => {
    const searchableText = `${card.dataset.name} ${card.dataset.category} ${card.textContent}`;
    const isVisible = searchableText.toLowerCase().includes(query);
    card.classList.toggle("is-hidden", !isVisible);
    if (isVisible) visibleCount += 1;
  });

  emptyState.classList.toggle("is-visible", visibleCount === 0);
});

[
  customerName,
  customerPhone,
  deliveryMethod,
  paymentMethod,
  deliveryZone,
  deliveryAddress,
  healthPlan,
  hasPrescription,
  customerMessage,
].forEach((field) => {
  field.addEventListener("input", renderOrderPreview);
  field.addEventListener("change", renderOrderPreview);
});

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const lines = buildOrderLines();

  const whatsappUrl = `https://wa.me/5493487616473?text=${encodeURIComponent(lines.join("\n"))}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
});

renderSelectedProducts();
