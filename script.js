// Digital Menu Data Store
const menuItems = [
    {
        id: "beef-pizza",
        title: "Beef Pizza",
        category: "burgers",
        price: 18.50,
        image: "images/pizza.jpg",
        description: "Artisanal stone-baked crust topped with slow-roasted shaved beef, aged mozzarella, caramelized onions, and a drizzle of white truffle glaze.",
        prepTime: "25 mins",
        calories: "780 kcal",
        badge: "Chef's Choice",
        ingredients: "Stone-ground flour crust, Angus shaved beef, smoked mozzarella, caramelized red onions, fresh basil, truffle oil drizzle."
    },
    {
        id: "black-burger",
        title: "Black Burger",
        category: "burgers",
        price: 16.00,
        image: "images/burger.jpg",
        description: "Gourmet charcoal brioche bun embracing a juicy 200g Wagyu beef patty, sharp cheddar, crisp lollo rosa lettuce, and signature house aioli.",
        prepTime: "18 mins",
        calories: "650 kcal",
        badge: "Signature",
        ingredients: "Activated charcoal brioche bun, Wagyu beef patty, aged cheddar cheese, garlic herb aioli, organic tomatoes, crisp lettuce."
    },
    {
        id: "chicken-steak",
        title: "Chicken Steak",
        category: "mains",
        price: 21.00,
        image: "images/steak.jpg",
        description: "Tender herb-marinated grilled chicken breast served alongside golden seasoned crinkle-cut fries, grilled tomatoes, and rich peppercorn jus.",
        prepTime: "22 mins",
        calories: "580 kcal",
        badge: "Popular",
        ingredients: "Free-range chicken breast, rosemary peppercorn reduction, farm-fresh tomatoes, golden potato fries, garlic butter."
    },
    {
        id: "spaghetti",
        title: "Spaghetti Bolognese",
        category: "pasta",
        price: 15.50,
        image: "images/spaghetti.jpg",
        description: "Classic Italian al dente spaghetti tossed in a rich, 6-hour simmered prime beef ragù with fresh oregano and freshly grated Parmesan Reggiano.",
        prepTime: "15 mins",
        calories: "520 kcal",
        badge: "Classic",
        ingredients: "Al dente durum wheat spaghetti, slow-simmered beef ragù, San Marzano tomatoes, fresh oregano, Parmigiano-Reggiano."
    },
    {
        id: "chocolate-lava",
        title: "Chocolate Lava Delight",
        category: "desserts",
        price: 9.50,
        image: "images/dessert.jpg",
        description: "Warm Belgian dark chocolate cake with a molten center, served with Madagascar vanilla bean gelato and gold leaf garnish.",
        prepTime: "12 mins",
        calories: "440 kcal",
        badge: "Dessert",
        ingredients: "70% Belgian dark chocolate, organic eggs, French butter, Madagascar vanilla bean gelato, berry coulis."
    },
    {
        id: "signature-cocktail",
        title: "Gold Reserve Elixir",
        category: "beverages",
        price: 8.00,
        image: "images/drink.jpg",
        description: "Refreshing sparkling citrus cocktail infused with saffron, elderflower, fresh mint sprigs, and edible 24k gold flakes.",
        prepTime: "5 mins",
        calories: "140 kcal",
        badge: "Beverage",
        ingredients: "Sparkling botanical tonic, elderflower blossom, saffron nectar, fresh lime juice, mint leaves, edible gold leaf."
    }
];

// App State
let activeCategory = "all";
let searchQuery = "";
let currentLayout = "serpentine"; // 'serpentine' or 'grid'
let cart = [];
let modalCurrentItem = null;
let modalQty = 1;

// DOM Elements
document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    renderMenu();
    setupEventListeners();
    updateCartUI();
}

// Render Menu based on current filters and active layout view
function renderMenu() {
    const serpentineList = document.getElementById("serpentine-items-list");
    const gridList = document.getElementById("grid-items-list");
    const noResults = document.getElementById("no-results");

    // Filter Items
    const filtered = menuItems.filter(item => {
        const matchesCategory = activeCategory === "all" || item.category === activeCategory;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        serpentineList.innerHTML = "";
        gridList.innerHTML = "";
        noResults.classList.remove("hidden");
        return;
    }

    noResults.classList.add("hidden");

    // Render Serpentine Flow
    serpentineList.innerHTML = filtered.map((item, index) => {
        // Alternating alignment: index 0 (right), index 1 (left), index 2 (right)...
        const alignmentClass = index % 2 === 0 ? "align-right" : "align-left";
        return `
            <div class="serpentine-item ${alignmentClass}" data-id="${item.id}">
                <div class="serpentine-img-wrapper" onclick="openItemModal('${item.id}')">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                </div>
                <div class="serpentine-card">
                    <h3 class="serpentine-item-title">${item.title}</h3>
                    <p class="serpentine-item-desc">${item.description}</p>
                    <div class="serpentine-card-footer">
                        <span class="item-price">$${item.price.toFixed(2)}</span>
                        <button class="card-action-btn" onclick="quickAddToCart('${item.id}', event)">
                            <i class="fa-solid fa-plus"></i> Add to Order
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    // Render Grid Flow
    gridList.innerHTML = filtered.map(item => {
        return `
            <div class="grid-card" data-id="${item.id}">
                <div class="grid-img-wrapper" onclick="openItemModal('${item.id}')" style="cursor: pointer;">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                    <span class="dish-badge">${item.badge}</span>
                </div>
                <div class="grid-card-content">
                    <h3 class="grid-card-title">${item.title}</h3>
                    <p class="grid-card-desc">${item.description}</p>
                    <div class="grid-card-footer">
                        <span class="item-price">$${item.price.toFixed(2)}</span>
                        <button class="card-action-btn" onclick="quickAddToCart('${item.id}', event)">
                            <i class="fa-solid fa-plus"></i> Add
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

// Setup Event Listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById("search-input");
    const clearSearchBtn = document.getElementById("clear-search");

    searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.trim();
        clearSearchBtn.style.display = searchQuery ? "block" : "none";
        renderMenu();
    });

    clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        searchQuery = "";
        clearSearchBtn.style.display = "none";
        renderMenu();
    });

    // Category Pill Filters
    const pills = document.querySelectorAll(".category-pills .pill");
    pills.forEach(pill => {
        pill.addEventListener("click", () => {
            pills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            activeCategory = pill.getAttribute("data-category");
            renderMenu();
        });
    });

    // View Switcher (Serpentine vs Grid)
    const serpentineBtn = document.getElementById("view-serpentine-btn");
    const gridBtn = document.getElementById("view-grid-btn");
    const serpentineView = document.getElementById("serpentine-view");
    const gridView = document.getElementById("grid-view");

    serpentineBtn.addEventListener("click", () => {
        serpentineBtn.classList.add("active");
        gridBtn.classList.remove("active");
        serpentineView.classList.add("active");
        gridView.classList.remove("active");
        currentLayout = "serpentine";
    });

    gridBtn.addEventListener("click", () => {
        gridBtn.classList.add("active");
        serpentineBtn.classList.remove("active");
        gridView.classList.add("active");
        serpentineView.classList.remove("active");
        currentLayout = "grid";
    });

    // Modal controls
    document.getElementById("close-modal-btn").addEventListener("click", closeModal);
    document.getElementById("item-modal").addEventListener("click", (e) => {
        if (e.target.id === "item-modal") closeModal();
    });

    document.getElementById("modal-qty-minus").addEventListener("click", () => {
        if (modalQty > 1) {
            modalQty--;
            document.getElementById("modal-qty-val").innerText = modalQty;
        }
    });

    document.getElementById("modal-qty-plus").addEventListener("click", () => {
        modalQty++;
        document.getElementById("modal-qty-val").innerText = modalQty;
    });

    document.getElementById("modal-add-btn").addEventListener("click", () => {
        if (modalCurrentItem) {
            addToCart(modalCurrentItem.id, modalQty);
            closeModal();
            showToast(`Added ${modalQty}x ${modalCurrentItem.title} to your cart.`);
        }
    });

    // Cart Drawer Toggle
    document.getElementById("cart-toggle-btn").addEventListener("click", toggleCartDrawer);
    document.getElementById("close-cart-btn").addEventListener("click", toggleCartDrawer);
    document.getElementById("cart-backdrop").addEventListener("click", toggleCartDrawer);

    // Checkout Action
    document.getElementById("checkout-btn").addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Your cart is empty. Please add some delicious dishes first!");
            return;
        }
        cart = [];
        updateCartUI();
        toggleCartDrawer();
        showToast("Your order has been placed! Our catering team is on it.");
    });
}

// Modal Handlers
function openItemModal(itemId) {
    const item = menuItems.find(m => m.id === itemId);
    if (!item) return;

    modalCurrentItem = item;
    modalQty = 1;

    document.getElementById("modal-img").src = item.image;
    document.getElementById("modal-title").innerText = item.title;
    document.getElementById("modal-badge").innerText = item.badge;
    document.getElementById("modal-description").innerText = item.description;
    document.getElementById("modal-price").innerText = `$${item.price.toFixed(2)}`;
    document.getElementById("modal-category").innerHTML = `<i class="fa-solid fa-tag"></i> ${item.category.toUpperCase()}`;
    document.getElementById("modal-prep").innerHTML = `<i class="fa-solid fa-clock"></i> ${item.prepTime}`;
    document.getElementById("modal-cal").innerHTML = `<i class="fa-solid fa-fire"></i> ${item.calories}`;
    document.getElementById("modal-ingredients-list").innerText = item.ingredients;
    document.getElementById("modal-qty-val").innerText = modalQty;

    document.getElementById("item-modal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("item-modal").classList.add("hidden");
}

// Shopping Cart Functions
function quickAddToCart(itemId, event) {
    if (event) event.stopPropagation();
    const item = menuItems.find(m => m.id === itemId);
    addToCart(itemId, 1);
    showToast(`Added 1x ${item.title} to order.`);
}

function addToCart(itemId, qty = 1) {
    const existingIndex = cart.findIndex(ci => ci.id === itemId);
    if (existingIndex > -1) {
        cart[existingIndex].qty += qty;
    } else {
        const item = menuItems.find(m => m.id === itemId);
        cart.push({ ...item, qty });
    }
    updateCartUI();
}

function updateCartQty(itemId, delta) {
    const item = cart.find(ci => ci.id === itemId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter(ci => ci.id !== itemId);
    }
    updateCartUI();
}

function removeFromCart(itemId) {
    cart = cart.filter(ci => ci.id !== itemId);
    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.getElementById("cart-count");
    const cartContainer = document.getElementById("cart-items-container");
    const subtotalEl = document.getElementById("cart-subtotal");
    const taxEl = document.getElementById("cart-tax");
    const totalEl = document.getElementById("cart-total");

    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.innerText = totalCount;

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 3rem 1rem;">
                <i class="fa-solid fa-basket-shopping" style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--gold-primary);"></i>
                <p>Your cart is empty.</p>
            </div>
        `;
        subtotalEl.innerText = "$0.00";
        taxEl.innerText = "$0.00";
        totalEl.innerText = "$0.00";
        return;
    }

    cartContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.title}" class="cart-item-img">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
                <div class="cart-item-qty">
                    <button class="cart-qty-btn" onclick="updateCartQty('${item.id}', -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="cart-qty-btn" onclick="updateCartQty('${item.id}', 1)">+</button>
                </div>
            </div>
            <button class="remove-item-btn" onclick="removeFromCart('${item.id}')" aria-label="Remove item">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
    `).join("");

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = subtotal * 0.10;
    const total = subtotal + tax;

    subtotalEl.innerText = `$${subtotal.toFixed(2)}`;
    taxEl.innerText = `$${tax.toFixed(2)}`;
    totalEl.innerText = `$${total.toFixed(2)}`;
}

function toggleCartDrawer() {
    const drawer = document.getElementById("cart-drawer");
    drawer.classList.toggle("hidden");
}

// Toast Notification
function showToast(message) {
    const toast = document.getElementById("order-toast");
    toast.querySelector("p").innerText = message;
    toast.classList.remove("hidden");

    setTimeout(() => {
        toast.classList.add("hidden");
    }, 3000);
}
