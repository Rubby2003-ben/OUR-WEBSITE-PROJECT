
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".year").forEach(el => el.textContent = new Date().getFullYear());

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const opened = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(opened));
      toggle.setAttribute("aria-label", opened ? "Close navigation" : "Open navigation");
    });
  }

  // Product page live search.
  const search = document.getElementById("product-search");
  const cards = [...document.querySelectorAll(".product-card")];
  const count = document.getElementById("product-count");
  const updateProducts = () => {
    const term = (search?.value || "").trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const match = (card.dataset.name + " " + card.textContent).toLowerCase().includes(term);
      card.hidden = !match;
      if (match) visible++;
    });
    if (count) count.textContent = `${visible} product${visible === 1 ? "" : "s"} shown`;
  };
  if (search) { search.addEventListener("input", updateProducts); updateProducts(); }

  // Shopping list. It is kept in this browser tab and passed to the enquiry form.
  const cartKey = "buildmaxEnquiryProducts";
  let cart = [];
  try { cart = JSON.parse(sessionStorage.getItem(cartKey) || "[]"); } catch { cart = []; }
  const saveCart = () => { try { sessionStorage.setItem(cartKey, JSON.stringify(cart)); } catch {} };
  const renderCart = () => {
    const list = document.getElementById("cart-items");
    const badge = document.getElementById("cart-count");
    if (!list || !badge) return;
    badge.textContent = `(${cart.length})`;
    list.innerHTML = "";
    if (!cart.length) { const li = document.createElement("li"); li.textContent = "No products added yet."; list.appendChild(li); return; }
    cart.forEach((name, index) => {
      const li = document.createElement("li");
      li.textContent = name + " ";
      const remove = document.createElement("button");
      remove.type = "button"; remove.className = "text-button"; remove.textContent = "Remove";
      remove.addEventListener("click", () => { cart.splice(index, 1); saveCart(); renderCart(); });
      li.appendChild(remove); list.appendChild(li);
    });
  };
  document.querySelectorAll(".add-to-list").forEach(button => button.addEventListener("click", () => {
    const name = button.dataset.product;
    if (!cart.includes(name)) cart.push(name);
    saveCart(); renderCart();
    const old = button.textContent; button.textContent = "Added";
    setTimeout(() => button.textContent = old, 1100);
  }));
  document.getElementById("clear-cart")?.addEventListener("click", () => { cart = []; saveCart(); renderCart(); });
  const whatsappCart = document.getElementById("whatsapp-cart");
  if (whatsappCart) {
    const updateWhatsAppCart = () => {
      const lines = cart.length ? cart.map((name, i) => `${i + 1}. ${name}`).join("%0A") : "No products selected yet";
      const message = `Hello Buildmax Supplies, I would like a quotation for:%0A${lines}%0A%0APlease confirm current prices and availability.%0AQuantity required: %0ADelivery location:`;
      whatsappCart.href = "https://wa.me/2349135986130?text=" + encodeURIComponent(message.replaceAll("%0A", "\\n"));
    };
    updateWhatsAppCart();
    document.querySelectorAll(".add-to-list").forEach(button => button.addEventListener("click", updateWhatsAppCart));
    document.getElementById("clear-cart")?.addEventListener("click", updateWhatsAppCart);
  }

  document.getElementById("send-cart")?.addEventListener("click", () => {
    try { sessionStorage.setItem(cartKey, JSON.stringify(cart)); } catch {}
  });
  renderCart();

  // Enquiry form: prefill selected product(s), validate, and prepare an email.
  const form = document.getElementById("enquiry-form");
  if (form) {
    const params = new URLSearchParams(location.search);
    const selected = params.get("product");
    let items = [];
    try { items = JSON.parse(sessionStorage.getItem(cartKey) || "[]"); } catch {}
    const productField = document.getElementById("product");
    if (productField && !productField.value) {
      const all = [...items, ...(selected ? [selected] : [])];
      if (all.length) productField.value = [...new Set(all)].join(", ");
    }
    form.addEventListener("submit", event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const subject = encodeURIComponent("Buildmax Supplies Product Enquiry");
      const body = encodeURIComponent(
        `Name: ${data.get("name")}\\nEmail: ${data.get("email")}\\nPhone: ${data.get("phone") || "Not provided"}\\nProducts: ${data.get("product")}\\nQuantity: ${data.get("quantity") || "Not specified"}\\n\\nDetails:\\n${data.get("message")}`
      );
      const feedback = document.getElementById("form-feedback");
      if (feedback) feedback.textContent = "Your email application should open with the enquiry details. Please send the prepared email to complete your enquiry.";
      // Replace the address below with Buildmax's real enquiry email before publishing.
      location.href = `mailto:REPLACE-WITH-BUILDMAX-EMAIL@example.com?subject=${subject}&body=${body}`;
    });
  }
});
