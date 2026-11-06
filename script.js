const products = [
  {id:1,name:"Wireless Bluetooth Headphones",category:"Electronics",price:1499,oldPrice:2199,rating:4.5,reviews:128,tag:"BESTSELLER",image:"https://images.unsplash.com/photo-150声?auto=format&fit=crop&w=700&q=85"},
  {id:2,name:"Smart Watch Series 5",category:"Electronics",price:2499,oldPrice:3999,rating:4.3,reviews:96,tag:"DEAL",image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85"},
  {id:3,name:"Everyday Running Sneakers",category:"Fashion",price:1899,oldPrice:2799,rating:4.6,reviews:214,tag:"POPULAR",image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85"},
  {id:4,name:"Minimal Ceramic Table Lamp",category:"Home",price:999,oldPrice:1499,rating:4.2,reviews:73,tag:"",image:"https://images.unsplash.com/photo-150 svět?auto=format&fit=crop&w=700&q=85"},
  {id:5,name:"The Psychology of Money",category:"Books",price:299,oldPrice:499,rating:4.8,reviews:502,tag:"TOP RATED",image:"https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=700&q=85"},
  {id:6,name:"Classic Casual Backpack",category:"Fashion",price:799,oldPrice:1199,rating:4.4,reviews:156,tag:"",image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=85"},
  {id:7,name:"Portable Bluetooth Speaker",category:"Electronics",price:1199,oldPrice:1799,rating:4.1,reviews:88,tag:"DEAL",image:"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=85"},
  {id:8,name:"Modern Cushion Set",category:"Home",price:649,oldPrice:999,rating:4.3,reviews:61,tag:"",image:"https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=700&q=85"}
];

// Replace the two malformed demo image URLs above with stable image URLs.
products[0].image = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85";
products[3].image = "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=85";

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const sortSelect = document.getElementById("sortSelect");
const emptyState = document.getElementById("emptyState");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const cartItemsEl = document.getElementById("cartItems");
const cartCountEl = document.getElementById("cartCount");
const cartSubtotalEl = document.getElementById("cartSubtotal");
const toast = document.getElementById("toast");

let activeCategory = "all";
let cart = JSON.parse(localStorage.getItem("shopzone-cart") || "[]");

const money = amount => "₹" + amount.toLocaleString("en-IN");

function renderProducts() {
  let visible = products.filter(product => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    const term = searchInput.value.trim().toLowerCase();
    const matchesSearch = product.name.toLowerCase().includes(term) || product.category.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  if (sortSelect.value === "low") visible.sort((a,b) => a.price-b.price);
  if (sortSelect.value === "high") visible.sort((a,b) => b.price-a.price);
  if (sortSelect.value === "rating") visible.sort((a,b) => b.rating-a.rating);

  productGrid.innerHTML = visible.map(product => `
    <article class="product-card">
      <div class="product-image">
        ${product.tag ? `<span class="product-tag">${product.tag}</span>` : ""}
        <img src="${product.image}" alt="${product.name}" loading="lazy"
             onerror="this.src='https://placehold.co/600x450/f0f4f4/344955?text=Product+Image'">
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3>${product.name}</h3>
        <div class="rating">★★★★★ <span>${product.rating} (${product.reviews})</span></div>
        <div class="price-row"><span class="price">${money(product.price)}</span><span class="old-price">${money(product.oldPrice)}</span></div>
        <button class="add-btn" data-add="${product.id}">Add to cart</button>
      </div>
    </article>
  `).join("");

  emptyState.hidden = visible.length !== 0;
}

function saveCart() {
  localStorage.setItem("shopzone-cart", JSON.stringify(cart));
  renderCart();
}

function addToCart(id) {
  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({id, quantity:1});
  saveCart();
  showToast("Added to your cart");
}

function updateQuantity(id, change) {
  const item = cart.find(entry => entry.id === id);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) cart = cart.filter(entry => entry.id !== id);
  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  showToast("Item removed");
}

function renderCart() {
  const count = cart.reduce((sum,item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum,item) => {
    const product = products.find(p => p.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  cartCountEl.textContent = count;
  cartSubtotalEl.textContent = money(subtotal);

  if (!cart.length) {
    cartItemsEl.innerHTML = `<div class="cart-empty"><span>🛍️</span>Your cart is waiting for something nice.</div>`;
    return;
  }

  cartItemsEl.innerHTML = cart.map(item => {
    const product = products.find(p => p.id === item.id);
    if (!product) return "";
    return `<div class="cart-item">
      <img src="${product.image}" alt="${product.name}">
      <div><h4>${product.name}</h4><span class="item-price">${money(product.price)}</span>
        <div class="quantity">
          <button data-quantity="${product.id}" data-change="-1" aria-label="Decrease quantity">−</button>
          <span>${item.quantity}</span>
          <button data-quantity="${product.id}" data-change="1" aria-label="Increase quantity">+</button>
        </div>
        <button class="remove-btn" data-remove="${product.id}">Remove</button>
      </div>
      <strong>${money(product.price * item.quantity)}</strong>
    </div>`;
  }).join("");
}

function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("show");
  cartDrawer.setAttribute("aria-hidden","false");
}
function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("show");
  cartDrawer.setAttribute("aria-hidden","true");
}
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

document.getElementById("searchForm").addEventListener("submit", event => {
  event.preventDefault();
  activeCategory = categorySelect.value;
  updateChips();
  renderProducts();
});
searchInput.addEventListener("input", renderProducts);
categorySelect.addEventListener("change", () => {
  activeCategory = categorySelect.value;
  updateChips();
  renderProducts();
});
sortSelect.addEventListener("change", renderProducts);

function updateChips() {
  document.querySelectorAll(".chip").forEach(chip => {
    chip.classList.toggle("active", chip.dataset.category === activeCategory);
  });
}
document.getElementById("categoryChips").addEventListener("click", event => {
  const chip = event.target.closest("[data-category]");
  if (!chip) return;
  activeCategory = chip.dataset.category;
  categorySelect.value = activeCategory;
  updateChips();
  renderProducts();
});
document.querySelectorAll("[data-nav-category]").forEach(link => {
  link.addEventListener("click", () => {
    activeCategory = link.dataset.navCategory;
    categorySelect.value = activeCategory;
    updateChips();
    renderProducts();
  });
});

productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(Number(button.dataset.add));
});
cartItemsEl.addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  if (quantityButton) updateQuantity(Number(quantityButton.dataset.quantity), Number(quantityButton.dataset.change));
  if (removeButton) removeFromCart(Number(removeButton.dataset.remove));
});

document.getElementById("cartButton").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", event => { if (event.key === "Escape") closeCart(); });
document.getElementById("checkoutButton").addEventListener("click", () => {
  if (!cart.length) showToast("Your cart is empty");
  else showToast("Checkout is a demo — payment is not enabled");
});

renderProducts();
renderCart();
