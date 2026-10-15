(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
  const WHATSAPP_PHONE = "4915228560316";

  // ==========================================================================
  // Header Solid on Scroll & Reveal Animations
  // ==========================================================================
  const siteHeader = $("#siteHeader");
  const hero = $("#startseite");
  if (hero && siteHeader) {
    const headerObserver = new IntersectionObserver(([entry]) => {
      siteHeader.classList.toggle("is-solid", entry.intersectionRatio < 0.85);
    }, { threshold: [0, 0.85, 1] });
    headerObserver.observe(hero);
  }

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -4%" });
  $$(".reveal").forEach((element) => revealObserver.observe(element));

  // ==========================================================================
  // Toast Notification System
  // ==========================================================================
  const toast = $("#toast");
  let toastTimer = null;
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2800);
  };

  // ==========================================================================
  // Mobile Navigation Menu
  // ==========================================================================
  const menuToggle = $("#menuToggle");
  const mobileMenu = $("#mobileMenu");
  const setMobileMenu = (open) => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    mobileMenu.setAttribute("aria-hidden", String(!open));
    mobileMenu.inert = !open;
    mobileMenu.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  };
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      setMobileMenu(!isOpen);
    });
  }
  $$("a", mobileMenu).forEach((link) => link.addEventListener("click", () => setMobileMenu(false)));

  // ==========================================================================
  // Menu Data Preparation & UIDs
  // ==========================================================================
  if (window.MENU_DATA) {
    window.MENU_DATA.forEach((item, index) => {
      item.uid = `dish-${item.code}-${index}`;
    });
  }

  const normalize = (value) =>
    String(value || "")
      .toLocaleLowerCase("de-DE")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    }[ch]));
  }

  // ==========================================================================
  // Cart State Management
  // ==========================================================================
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem("hannayuki-cart") || "[]");
    if (!Array.isArray(cart)) cart = [];
  } catch {
    cart = [];
  }

  let selectedOrderType = "Abholung"; // 'Abholung' | 'Vor Ort' | 'Lieferung'

  const saveCart = () => {
    localStorage.setItem("hannayuki-cart", JSON.stringify(cart));
  };

  const getCartItem = (entry) =>
    window.MENU_DATA ? window.MENU_DATA.find((item) => item.uid === entry.uid) : null;

  const getCartQuantity = (uid) => {
    const entry = cart.find((item) => item.uid === uid);
    return entry ? entry.quantity : 0;
  };

  const cartTotalSum = () =>
    cart.reduce((sum, entry) => {
      const item = getCartItem(entry);
      return sum + (item?.price || 0) * entry.quantity;
    }, 0);

  const cartTotalCount = () =>
    cart.reduce((sum, entry) => sum + entry.quantity, 0);

  // ==========================================================================
  // Category Navigation & Filtering
  // ==========================================================================
  let activeCategory = "Alle";
  let visibleLimit = 40;
  const menuGrid = $("#menuGrid");
  const menuSearch = $("#menuSearch");
  const clearSearch = $("#clearSearch");
  const categorySelect = $("#categorySelect");
  const categoryTabsNav = $("#categoryTabsNav");
  const menuCount = $("#menuCount");
  const menuStatus = $("#menuStatus");
  const loadMore = $("#loadMore");

  const buildCategoryTabs = () => {
    if (!categoryTabsNav || !window.MENU_CATEGORIES) return;
    categoryTabsNav.replaceChildren();
    if (categorySelect) categorySelect.replaceChildren();

    window.MENU_CATEGORIES.forEach((cat) => {
      // Tab pill
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `category-tab-btn ${cat === activeCategory ? "active" : ""}`;
      btn.dataset.category = cat;
      btn.textContent = cat;
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", String(cat === activeCategory));
      btn.addEventListener("click", () => {
        selectCategory(cat);
      });
      categoryTabsNav.append(btn);

      // Select option
      if (categorySelect) {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        if (cat === activeCategory) option.selected = true;
        categorySelect.append(option);
      }
    });
  };

  const selectCategory = (cat) => {
    activeCategory = cat;
    visibleLimit = 40;

    // Update tab pills
    $$(".category-tab-btn", categoryTabsNav).forEach((btn) => {
      const isCurrent = btn.dataset.category === cat;
      btn.classList.toggle("active", isCurrent);
      btn.setAttribute("aria-selected", String(isCurrent));
      if (isCurrent) {
        btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    });

    // Update select
    if (categorySelect) categorySelect.value = cat;

    renderMenu();
  };

  if (categorySelect) {
    categorySelect.addEventListener("change", () => {
      selectCategory(categorySelect.value);
    });
  }

  if (menuSearch) {
    menuSearch.addEventListener("input", () => {
      visibleLimit = 40;
      if (clearSearch) clearSearch.hidden = !menuSearch.value.trim();
      renderMenu();
    });
  }

  if (clearSearch) {
    clearSearch.addEventListener("click", () => {
      menuSearch.value = "";
      clearSearch.hidden = true;
      visibleLimit = 40;
      renderMenu();
      menuSearch.focus();
    });
  }

  if (loadMore) {
    loadMore.addEventListener("click", () => {
      visibleLimit += 36;
      renderMenu();
    });
  }

  // Quick category links from specialties cards
  $$("[data-filter-cat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.filterCat;
      selectCategory(cat);
      const menuSection = $("#speisekarte");
      if (menuSection) menuSection.scrollIntoView({ behavior: "smooth" });
    });
  });

  const getFilteredDishes = () => {
    if (!window.MENU_DATA) return [];
    const query = normalize(menuSearch ? menuSearch.value.trim() : "");
    return window.MENU_DATA.filter((item) => {
      const matchCategory = activeCategory === "Alle" || item.category === activeCategory;
      if (!matchCategory) return false;
      if (!query) return true;
      const haystack = normalize(
        [item.code, item.name, item.description, item.options, item.allergens, item.category].join(" ")
      );
      return haystack.includes(query);
    });
  };

  // ==========================================================================
  // Dish Card Component
  // ==========================================================================
  const createDishCard = (item) => {
    const card = document.createElement("article");
    card.className = "menu-card";
    const qty = getCartQuantity(item.uid);
    if (qty > 0) card.classList.add("is-in-cart");

    // Price markup
    let priceHtml = "";
    if (item.price === null) {
      priceHtml = `<span class="menu-card-price unpriced">Preis im PDF<br>nicht angegeben</span>`;
    } else {
      priceHtml = `<span class="menu-card-price">${euro.format(item.price)}</span>`;
    }

    // Meta chips
    const metaParts = [];
    if (item.options) metaParts.push(`<span class="meta-chip">🥢 ${escapeHtml(item.options)}</span>`);
    if (item.allergens) metaParts.push(`<span class="meta-chip">⚠️ Allergene: ${escapeHtml(item.allergens)}</span>`);
    if (item.note) metaParts.push(`<span class="meta-chip">ℹ️ ${escapeHtml(item.note)}</span>`);

    // Actions area: Add button or Quantity stepper
    let actionAreaHtml = "";
    if (item.price === null) {
      actionAreaHtml = `<span class="unpriced-ask-btn">Auf Anfrage bestellbar</span>`;
    } else if (qty > 0) {
      actionAreaHtml = `
        <div class="card-stepper" data-dish-uid="${escapeHtml(item.uid)}">
          <button type="button" class="card-btn-minus" aria-label="Menge verringern">&minus;</button>
          <span class="card-stepper-count">${qty}</span>
          <button type="button" class="card-btn-plus" aria-label="Menge erhöhen">+</button>
        </div>
      `;
    } else {
      actionAreaHtml = `
        <button class="add-to-cart-btn" type="button" data-add-uid="${escapeHtml(item.uid)}">
          <span>+ In den Warenkorb</span>
        </button>
      `;
    }

    card.innerHTML = `
      <div>
        <div class="menu-card-top">
          <div class="menu-card-title-group">
            <span class="menu-card-code">#${escapeHtml(item.code)}</span>
            <h4 class="menu-card-name">${escapeHtml(item.name)}</h4>
          </div>
          ${priceHtml}
        </div>
        ${item.description ? `<p class="menu-card-desc">${escapeHtml(item.description)}</p>` : ""}
        ${metaParts.length ? `<div class="menu-card-meta">${metaParts.join("")}</div>` : ""}
      </div>
      <div class="menu-card-actions">
        <span class="menu-category-tag">${escapeHtml(item.category)}</span>
        ${actionAreaHtml}
      </div>
    `;

    return card;
  };

  // ==========================================================================
  // Render Menu Grid
  // ==========================================================================
  const renderMenu = () => {
    if (!menuGrid) return;
    const allMatches = getFilteredDishes();
    const visibleDishes = allMatches.slice(0, visibleLimit);
    menuGrid.replaceChildren();

    if (!visibleDishes.length) {
      const empty = document.createElement("div");
      empty.className = "menu-empty";
      empty.innerHTML = `
        <p>Keine Gerichte gefunden für <strong>"${escapeHtml(menuSearch ? menuSearch.value : "")}"</strong>.</p>
        <button class="button button-outline" id="resetFilterBtn" type="button" style="margin-top:1rem;">Alle Gerichte anzeigen</button>
      `;
      menuGrid.append(empty);
      const resetBtn = $("#resetFilterBtn", empty);
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          if (menuSearch) menuSearch.value = "";
          if (clearSearch) clearSearch.hidden = true;
          selectCategory("Alle");
        });
      }
    } else {
      // Group by category if "Alle", otherwise render directly
      if (activeCategory === "Alle" && !menuSearch?.value.trim()) {
        const grouped = new Map();
        visibleDishes.forEach((item) => {
          if (!grouped.has(item.category)) grouped.set(item.category, []);
          grouped.get(item.category).push(item);
        });

        grouped.forEach((dishes, catName) => {
          const groupSec = document.createElement("section");
          groupSec.className = "menu-group";
          groupSec.innerHTML = `
            <div class="menu-group-header">
              <h3>${escapeHtml(catName)}</h3>
              <span class="menu-group-count">${dishes.length} Gerichte</span>
            </div>
            <div class="menu-group-grid"></div>
          `;
          const grid = groupSec.querySelector(".menu-group-grid");
          dishes.forEach((item) => grid.append(createDishCard(item)));
          menuGrid.append(groupSec);
        });
      } else {
        const groupSec = document.createElement("section");
        groupSec.className = "menu-group";
        groupSec.innerHTML = `
          <div class="menu-group-header">
            <h3>${escapeHtml(activeCategory === "Alle" ? "Suchergebnisse" : activeCategory)}</h3>
            <span class="menu-group-count">${allMatches.length} gefunden</span>
          </div>
          <div class="menu-group-grid"></div>
        `;
        const grid = groupSec.querySelector(".menu-group-grid");
        visibleDishes.forEach((item) => grid.append(createDishCard(item)));
        menuGrid.append(groupSec);
      }
    }

    if (menuCount) {
      menuCount.textContent = `${allMatches.length} ${allMatches.length === 1 ? "Gericht" : "Gerichte"}`;
    }

    if (menuStatus) {
      const hasUnpriced = allMatches.some((item) => item.price === null);
      menuStatus.textContent = hasUnpriced
        ? "Hinweis: Einzelne Gerichte ohne gedruckten Preis im Original-PDF können per WhatsApp angefragt werden."
        : "";
    }

    if (loadMore) {
      loadMore.hidden = visibleLimit >= allMatches.length;
    }
  };

  // ==========================================================================
  // Cart Actions & Drawer Controls
  // ==========================================================================
  const cartDrawer = $("#cartDrawer");
  const drawerBackdrop = $("#drawerBackdrop");
  const cartItems = $("#cartItems");
  const cartTotal = $("#cartTotal");
  const cartTotalFloating = $("#cartTotalFloating");
  const cartSummaryCount = $("#cartSummaryCount");

  const cartBadgeHeader = $("#cartBadgeHeader");
  const cartBadgeFloating = $("#cartBadgeFloating");
  const cartBadgeBanner = $("#cartBadgeBanner");
  const cartCountMenuBtn = $("#cartCountMenuBtn");
  const cartBadgeMobileMenu = $("#cartBadgeMobileMenu");

  const openCartFloating = $("#openCartFloating");
  const closeCart = $("#closeCart");
  const clearCartBtn = $("#clearCartBtn");

  const setCartOpen = (open) => {
    if (!cartDrawer) return;
    cartDrawer.classList.toggle("is-open", open);
    cartDrawer.setAttribute("aria-hidden", String(!open));
    cartDrawer.inert = !open;
    if (drawerBackdrop) drawerBackdrop.hidden = !open;
    document.body.classList.toggle("drawer-open", open);
    if (open && closeCart) closeCart.focus();
  };

  $("#headerCartBtn")?.addEventListener("click", () => setCartOpen(true));
  $("#openCartFloating")?.addEventListener("click", () => setCartOpen(true));
  $("#openCartFromMenu")?.addEventListener("click", () => setCartOpen(true));
  $("#openCartFromBanner")?.addEventListener("click", () => setCartOpen(true));
  $("#mobileCartTrigger")?.addEventListener("click", () => {
    setMobileMenu(false);
    setCartOpen(true);
  });
  closeCart?.addEventListener("click", () => setCartOpen(false));
  drawerBackdrop?.addEventListener("click", () => setCartOpen(false));

  // Order Type Selector Buttons inside Cart
  const orderTypeButtons = $$(".order-type-btn");
  const fieldTableNumber = $("#fieldTableNumber");
  const fieldAddress = $("#fieldAddress");

  const setOrderType = (type) => {
    selectedOrderType = type;
    orderTypeButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.type === type);
    });
    if (fieldTableNumber) fieldTableNumber.hidden = type !== "Vor Ort";
    if (fieldAddress) fieldAddress.hidden = type !== "Lieferung";
  };

  orderTypeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setOrderType(btn.dataset.type);
    });
  });

  // Add dish to cart
  const addToCart = (uid, qtyDelta = 1) => {
    const dish = window.MENU_DATA?.find((item) => item.uid === uid);
    if (!dish || dish.price === null) return;

    const existing = cart.find((item) => item.uid === uid);
    if (existing) {
      existing.quantity += qtyDelta;
      if (existing.quantity <= 0) {
        cart = cart.filter((item) => item.uid !== uid);
      }
    } else if (qtyDelta > 0) {
      cart.push({ uid, quantity: qtyDelta });
    }

    saveCart();
    renderCart();
    renderMenu(); // Keep cards in sync
    showToast(`✓ "${dish.name}" im Warenkorb (${getCartQuantity(uid)})`);
  };

  // Modify quantity from cart
  const updateCartQuantity = (uid, delta) => {
    const existing = cart.find((item) => item.uid === uid);
    if (!existing) return;
    existing.quantity += delta;
    if (existing.quantity <= 0) {
      cart = cart.filter((item) => item.uid !== uid);
    }
    saveCart();
    renderCart();
    renderMenu();
  };

  const removeCartItem = (uid) => {
    cart = cart.filter((item) => item.uid !== uid);
    saveCart();
    renderCart();
    renderMenu();
    showToast("Gericht aus dem Warenkorb entfernt.");
  };

  // Clear entire cart
  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
      if (!cart.length) return;
      if (confirm("Möchten Sie wirklich alle Gerichte aus dem Warenkorb entfernen?")) {
        cart = [];
        saveCart();
        renderCart();
        renderMenu();
        showToast("Warenkorb wurde geleert.");
      }
    });
  }

  // Delegate menu click events for + In den Warenkorb and card steppers
  if (menuGrid) {
    menuGrid.addEventListener("click", (e) => {
      const addBtn = e.target.closest("[data-add-uid]");
      if (addBtn) {
        addToCart(addBtn.dataset.addUid, 1);
        return;
      }

      const stepperPlus = e.target.closest(".card-btn-plus");
      if (stepperPlus) {
        const stepper = stepperPlus.closest("[data-dish-uid]");
        if (stepper) addToCart(stepper.dataset.dishUid, 1);
        return;
      }

      const stepperMinus = e.target.closest(".card-btn-minus");
      if (stepperMinus) {
        const stepper = stepperMinus.closest("[data-dish-uid]");
        if (stepper) updateCartQuantity(stepper.dataset.dishUid, -1);
        return;
      }
    });
  }

  // Render Cart Drawer Contents
  const renderCart = () => {
    // Filter out invalid items
    cart = cart.filter((entry) => getCartItem(entry));
    if (!cartItems) return;
    cartItems.replaceChildren();

    if (!cart.length) {
      const empty = document.createElement("div");
      empty.className = "cart-empty";
      empty.innerHTML = `
        <span class="cart-empty-icon">🍣</span>
        <strong>Ihr Warenkorb ist noch leer</strong>
        <p>Wählen Sie Ihre Lieblingsgerichte aus unserer Speisekarte aus.</p>
      `;
      cartItems.append(empty);
    } else {
      cart.forEach((entry) => {
        const dish = getCartItem(entry);
        const itemRow = document.createElement("div");
        itemRow.className = "cart-item";
        itemRow.innerHTML = `
          <div class="cart-item-title">
            <h4><span>#${escapeHtml(dish.code)}</span>${escapeHtml(dish.name)}</h4>
            <div class="cart-item-unit-price">${euro.format(dish.price)} je Portion</div>
          </div>
          <div class="cart-item-total">${euro.format(dish.price * entry.quantity)}</div>
          <div class="cart-item-controls">
            <div class="cart-stepper">
              <button type="button" data-cart-minus="${escapeHtml(entry.uid)}" aria-label="Menge verringern">&minus;</button>
              <span>${entry.quantity}</span>
              <button type="button" data-cart-plus="${escapeHtml(entry.uid)}" aria-label="Menge erhöhen">+</button>
            </div>
            <button type="button" class="cart-remove-btn" data-cart-remove="${escapeHtml(entry.uid)}">
              Entfernen ✕
            </button>
          </div>
        `;
        cartItems.append(itemRow);
      });
    }

    const totalQty = cartTotalCount();
    const totalSum = cartTotalSum();
    const formattedSum = euro.format(totalSum);

    // Update badges
    if (cartBadgeHeader) cartBadgeHeader.textContent = String(totalQty);
    if (cartBadgeFloating) cartBadgeFloating.textContent = String(totalQty);
    if (cartBadgeBanner) cartBadgeBanner.textContent = String(totalQty);
    if (cartCountMenuBtn) cartCountMenuBtn.textContent = String(totalQty);
    if (cartBadgeMobileMenu) cartBadgeMobileMenu.textContent = String(totalQty);

    // Update totals
    if (cartTotal) cartTotal.textContent = formattedSum;
    if (cartTotalFloating) cartTotalFloating.textContent = formattedSum;
    if (cartSummaryCount) cartSummaryCount.textContent = `${totalQty} ${totalQty === 1 ? "Artikel" : "Artikel"}`;
  };

  // Cart item buttons click delegation
  if (cartItems) {
    cartItems.addEventListener("click", (e) => {
      const plusBtn = e.target.closest("[data-cart-plus]");
      if (plusBtn) {
        updateCartQuantity(plusBtn.dataset.cartPlus, 1);
        return;
      }
      const minusBtn = e.target.closest("[data-cart-minus]");
      if (minusBtn) {
        updateCartQuantity(minusBtn.dataset.cartMinus, -1);
        return;
      }
      const removeBtn = e.target.closest("[data-cart-remove]");
      if (removeBtn) {
        removeCartItem(removeBtn.dataset.cartRemove);
        return;
      }
    });
  }

  // ==========================================================================
  // Form Validation & WhatsApp Order Submission
  // ==========================================================================
  const validateForm = (form) => {
    let isValid = true;
    $$("[required]", form).forEach((input) => {
      const field = input.closest(".field");
      const errorMsg = field ? field.querySelector("small") : null;
      const valid = input.checkValidity();
      if (field) field.classList.toggle("is-invalid", !valid);
      if (errorMsg) errorMsg.textContent = valid ? "" : "Bitte füllen Sie dieses Pflichtfeld aus.";
      if (!valid) isValid = false;
    });
    if (!isValid) {
      form.querySelector(":invalid")?.focus();
    }
    return isValid;
  };

  const buildOrderWhatsAppText = (formData) => {
    const lines = [
      "🍣 *NEUE BESTELLUNG - HANNAYUKI LUDWIGSBURG*",
      "━━━━━━━━━━━━━━━━━━━━━━━━━",
      `👤 *Kunde:* ${formData.get("name") || ""}`,
      `📞 *Telefon:* ${formData.get("phone") || ""}`,
      `🥡 *Bestellart:* ${selectedOrderType}`
    ];

    if (selectedOrderType === "Vor Ort" && formData.get("table")) {
      lines.push(`🪑 *Tischnummer:* ${formData.get("table")}`);
    }
    if (selectedOrderType === "Lieferung" && formData.get("address")) {
      lines.push(`📍 *Lieferadresse:* ${formData.get("address")}`);
    }

    lines.push(`⏰ *Wunschzeit:* ${formData.get("time") || "Schnellstmöglich"}`);
    if (formData.get("notes")?.trim()) {
      lines.push(`📝 *Wünsche / Hinweise:* ${formData.get("notes").trim()}`);
    }

    lines.push("", "📋 *BESTELLTE GERICHTE:*");
    cart.forEach((entry) => {
      const dish = getCartItem(entry);
      if (dish) {
        lines.push(
          `• ${entry.quantity}x [${dish.code}] ${dish.name} (${euro.format(dish.price)}) = ${euro.format(
            dish.price * entry.quantity
          )}`
        );
      }
    });

    lines.push(
      "━━━━━━━━━━━━━━━━━━━━━━━━━",
      `💰 *GESAMTBETRAG:* ${euro.format(cartTotalSum())}`,
      "━━━━━━━━━━━━━━━━━━━━━━━━━",
      "Vielen Dank! Bitte bestätigen Sie meine Bestellung kurz per WhatsApp."
    );

    return lines.join("\n");
  };

  const orderForm = $("#orderForm");
  if (orderForm) {
    orderForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!cart.length) {
        showToast("⚠️ Bitte legen Sie zuerst Gerichte in den Warenkorb.");
        return;
      }
      if (!validateForm(orderForm)) return;

      const formData = new FormData(orderForm);
      const text = buildOrderWhatsAppText(formData);
      const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, "_blank", "noopener");
      showToast("✓ WhatsApp wird geöffnet...");
    });
  }

  // Copy Order Text to Clipboard
  const copyOrderBtn = $("#copyOrderBtn");
  if (copyOrderBtn && orderForm) {
    copyOrderBtn.addEventListener("click", () => {
      if (!cart.length) {
        showToast("⚠️ Ihr Warenkorb ist leer.");
        return;
      }
      const formData = new FormData(orderForm);
      const text = buildOrderWhatsAppText(formData);
      navigator.clipboard.writeText(text).then(
        () => showToast("📋 Bestelltext in Zwischenablage kopiert!"),
        () => showToast("Kopieren nicht unterstützt.")
      );
    });
  }

  // ==========================================================================
  // Table Reservation per WhatsApp
  // ==========================================================================
  const reservationForm = $("#reservationForm");
  const reserveDate = $("#reserveDate");
  const reserveGuests = $("#reserveGuests");
  const guestQuickSelect = $("#guestQuickSelect");

  // Set min date to today
  if (reserveDate) {
    const today = new Date();
    const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
    reserveDate.min = localDate;
    if (!reserveDate.value) reserveDate.value = localDate;
  }

  // Guest Quick Select Pills
  if (guestQuickSelect && reserveGuests) {
    guestQuickSelect.addEventListener("click", (e) => {
      const pill = e.target.closest(".guest-pill");
      if (!pill) return;
      $$(".guest-pill", guestQuickSelect).forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      reserveGuests.value = pill.dataset.guests;
    });
  }

  const buildReservationWhatsAppText = (formData) => {
    let dateStr = formData.get("date");
    try {
      dateStr = new Intl.DateTimeFormat("de-DE", { dateStyle: "full" }).format(
        new Date(`${formData.get("date")}T12:00:00`)
      );
    } catch {
      dateStr = formData.get("date");
    }

    const lines = [
      "🎋 *TISCHRESERVIERUNG - HANNAYUKI LUDWIGSBURG*",
      "━━━━━━━━━━━━━━━━━━━━━━━━━",
      `👤 *Name:* ${formData.get("name") || ""}`,
      `📞 *Telefon:* ${formData.get("phone") || ""}`,
      formData.get("email") ? `✉️ *E-Mail:* ${formData.get("email")}` : "",
      `📅 *Datum:* ${dateStr}`,
      `⏰ *Uhrzeit:* ${formData.get("time") || ""} Uhr`,
      `👥 *Gäste:* ${formData.get("guests") || "2"} Personen`,
      `🪑 *Bereichswunsch:* ${formData.get("area") || "Beliebig"}`,
      formData.get("notes")?.trim() ? `💬 *Besondere Wünsche:* ${formData.get("notes").trim()}` : "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━",
      "Bitte bestätigen Sie mir, ob zu diesem Zeitpunkt ein Tisch verfügbar ist. Vielen Dank!"
    ].filter(Boolean);

    return lines.join("\n");
  };

  if (reservationForm) {
    reservationForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validateForm(reservationForm)) return;

      const formData = new FormData(reservationForm);
      const text = buildReservationWhatsAppText(formData);
      const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, "_blank", "noopener");
      showToast("✓ WhatsApp wird geöffnet...");
    });
  }

  const copyReservationBtn = $("#copyReservationBtn");
  if (copyReservationBtn && reservationForm) {
    copyReservationBtn.addEventListener("click", () => {
      const formData = new FormData(reservationForm);
      const text = buildReservationWhatsAppText(formData);
      navigator.clipboard.writeText(text).then(
        () => showToast("📋 Reservierungsanfrage in Zwischenablage kopiert!"),
        () => showToast("Kopieren nicht unterstützt.")
      );
    });
  }

  // ==========================================================================
  // PDF Viewer Modal
  // ==========================================================================
  const pdfViewer = $("#pdfViewer");
  const setPdfOpen = (open) => {
    if (!pdfViewer) return;
    pdfViewer.hidden = !open;
    document.body.classList.toggle("modal-open", open);
    const frame = $("iframe", pdfViewer);
    if (open && frame && !frame.src) {
      frame.src = frame.dataset.src;
    }
  };
  $("#showPdf")?.addEventListener("click", () => setPdfOpen(true));
  $("#heroShowPdf")?.addEventListener("click", () => setPdfOpen(true));
  $("#closePdf")?.addEventListener("click", () => setPdfOpen(false));

  // ==========================================================================
  // Lightbox Image Gallery
  // ==========================================================================
  const galleryItems = $$(".gallery-item");
  const lightbox = $("#lightbox");
  let galleryIndex = 0;

  const updateLightbox = () => {
    if (!lightbox || !galleryItems.length) return;
    const sourceImg = $("img", galleryItems[galleryIndex]);
    const targetImg = $("figure img", lightbox);
    if (sourceImg && targetImg) {
      targetImg.src = sourceImg.src;
      targetImg.alt = sourceImg.alt;
      const caption = $("figcaption", lightbox);
      if (caption) caption.textContent = sourceImg.alt;
    }
  };

  const openLightbox = (index) => {
    galleryIndex = index;
    updateLightbox();
    if (lightbox?.showModal) lightbox.showModal();
  };

  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => openLightbox(index));
  });

  $(".lightbox-close", lightbox)?.addEventListener("click", () => lightbox.close());
  $(".lightbox-prev", lightbox)?.addEventListener("click", () => {
    galleryIndex = (galleryIndex - 1 + galleryItems.length) % galleryItems.length;
    updateLightbox();
  });
  $(".lightbox-next", lightbox)?.addEventListener("click", () => {
    galleryIndex = (galleryIndex + 1) % galleryItems.length;
    updateLightbox();
  });
  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.close();
  });

  // ==========================================================================
  // Legal Dialog (Impressum & Datenschutz)
  // ==========================================================================
  const legalDialog = $("#legalDialog");
  const legalContent = $("#legalContent");
  const legalCopy = {
    impressum: `
      <h2>Impressum</h2>
      <p><strong>Angaben gemäß § 5 TMG:</strong></p>
      <p>Hannayuki Ludwigsburg<br>Holzmarkt 3<br>71634 Ludwigsburg<br>Deutschland</p>
      <p><strong>Kontakt:</strong><br>WhatsApp / Telefon: +49 152 28560316<br>E-Mail: Hannayukirestaurant@gmail.com</p>
      <p><strong>Öffnungszeiten:</strong><br>Montag bis Sonntag: 10:30 – 23:00 Uhr</p>
    `,
    datenschutz: `
      <h2>Datenschutzerklärung</h2>
      <p>Wir freuen uns über Ihren Besuch auf unserer Website. Der Schutz Ihrer persönlichen Daten ist uns sehr wichtig.</p>
      <p><strong>Warenkorb &amp; lokale Daten:</strong><br>Ihr Warenkorb wird ausschließlich lokal in Ihrem Webbrowser (LocalStorage) gespeichert. Es werden keine Daten an Dritte übermittelt, solange Sie keine Bestellung absenden.</p>
      <p><strong>Bestellungen &amp; Reservierungen via WhatsApp:</strong><br>Wenn Sie eine Bestellung oder Reservierungsanfrage per WhatsApp versenden, wird die offizielle WhatsApp-App bzw. WhatsApp Web mit Ihrem vorformulierten Text geöffnet. Die Kommunikation unterliegt den Datenschutzbestimmungen von WhatsApp (Meta Platforms Ireland Limited).</p>
      <p><strong>Eingebettete Karten:</strong><br>Unsere Website nutzt den Kartendienst Google Maps zur einfachen Anfahrtsplanung.</p>
    `
  };

  $$(".legal-trigger").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (legalContent && legalDialog) {
        legalContent.innerHTML = legalCopy[btn.dataset.legal] || "";
        legalDialog.showModal();
      }
    });
  });
  $(".legal-close", legalDialog)?.addEventListener("click", () => legalDialog.close());
  legalDialog?.addEventListener("click", (e) => {
    if (e.target === legalDialog) legalDialog.close();
  });

  // ESC key listener
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      setMobileMenu(false);
      setCartOpen(false);
      setPdfOpen(false);
    }
  });

  // ==========================================================================
  // Initialization
  // ==========================================================================
  buildCategoryTabs();
  renderMenu();
  renderCart();
})();
