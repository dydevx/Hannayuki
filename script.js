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
  const getChoiceGroups = (dish) => Array.isArray(dish?.choiceGroups) ? dish.choiceGroups : [];

  const getSelectedOption = (dish, selection) => {
    const choiceGroup = getChoiceGroups(dish).find((entry) => entry.label === selection.group);
    return choiceGroup?.options.find((option) => option.label === selection.option) || null;
  };

  const hasCompleteSelections = (dish, selections) => {
    const choiceGroups = getChoiceGroups(dish);
    if (!choiceGroups.length) return true;
    if (!Array.isArray(selections) || selections.length !== choiceGroups.length) return false;
    return choiceGroups.every((choiceGroup) => selections.some((selection) =>
      selection.group === choiceGroup.label && choiceGroup.options.some((option) => option.label === selection.option)
    ));
  };

  const getConfiguredPrice = (dish, selections = []) => {
    let price = dish?.price || 0;
    selections.forEach((selection) => {
      const option = getSelectedOption(dish, selection);
      if (Number.isFinite(option?.price)) price = option.price;
    });
    return price;
  };

  const cartEntryKey = (entry) => [
    entry.uid,
    ...(entry.selections || []).map((selection) => `${selection.group}=${selection.option}`)
  ].map(encodeURIComponent).join("::");

  const formatSelections = (entry) => (entry.selections || [])
    .map((selection) => `${selection.group}: ${selection.option}`)
    .join(" · ");

  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem("hannayuki-cart") || "[]");
    if (!Array.isArray(cart)) cart = [];
  } catch {
    cart = [];
  }

  let selectedOrderType = "Abholung"; // 'Abholung' | 'Vor Ort'

  const saveCart = () => {
    localStorage.setItem("hannayuki-cart", JSON.stringify(cart));
  };

  const getCartItem = (entry) =>
    window.MENU_DATA ? window.MENU_DATA.find((item) => item.uid === entry.uid) : null;

  // Old carts did not store required dish choices. Keep valid fixed dishes and
  // discard only entries that cannot be ordered unambiguously anymore.
  cart = cart.filter((entry) => {
    const dish = getCartItem(entry);
    return dish && hasCompleteSelections(dish, entry.selections);
  });

  const getCartQuantity = (uid) => cart
    .filter((entry) => entry.uid === uid)
    .reduce((sum, entry) => sum + entry.quantity, 0);

  const cartTotalSum = () =>
    cart.reduce((sum, entry) => {
      const item = getCartItem(entry);
      return sum + getConfiguredPrice(item, entry.selections) * entry.quantity;
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
    const choiceGroups = getChoiceGroups(item);
    const hasChoices = choiceGroups.length > 0;
    if (qty > 0) card.classList.add("is-in-cart");

    // Price markup
    let priceHtml = "";
    if (item.price === null) {
      priceHtml = `<span class="menu-card-price unpriced">Preis im PDF<br>nicht angegeben</span>`;
    } else {
      const configuredPrices = choiceGroups
        .flatMap((choiceGroup) => choiceGroup.options)
        .filter((option) => Number.isFinite(option.price))
        .map((option) => option.price);
      const minimumPrice = configuredPrices.length ? Math.min(...configuredPrices) : item.price;
      const maximumPrice = configuredPrices.length ? Math.max(...configuredPrices) : item.price;
      const pricePrefix = minimumPrice !== maximumPrice ? "ab " : "";
      priceHtml = `<span class="menu-card-price" data-card-price>${pricePrefix}${euro.format(minimumPrice)}</span>`;
    }

    // Meta chips
    const metaParts = [];
    if (item.options) metaParts.push(`<span class="meta-chip">🥢 ${escapeHtml(item.options)}</span>`);
    if (item.allergens) metaParts.push(`<span class="meta-chip">⚠️ Allergene: ${escapeHtml(item.allergens)}</span>`);
    if (item.note) metaParts.push(`<span class="meta-chip">ℹ️ ${escapeHtml(item.note)}</span>`);

    const choicesHtml = choiceGroups.length ? `
      <div class="menu-card-choices" aria-label="Auswahl für ${escapeHtml(item.name)}">
        ${choiceGroups.map((choiceGroup, groupIndex) => `
          <label class="dish-choice-label" for="choice-${escapeHtml(item.uid)}-${groupIndex}">
            <span>${escapeHtml(choiceGroup.label)} <strong aria-hidden="true">*</strong></span>
            <select
              id="choice-${escapeHtml(item.uid)}-${groupIndex}"
              class="dish-choice-select"
              data-choice-group-index="${groupIndex}"
              required
            >
              <option value="">Bitte wählen</option>
              ${choiceGroup.options.map((option, optionIndex) => {
                const priceSuffix = Number.isFinite(option.price) ? ` – ${euro.format(option.price)}` : "";
                return `<option value="${optionIndex}">${escapeHtml(option.label)}${escapeHtml(priceSuffix)}</option>`;
              }).join("")}
            </select>
          </label>
        `).join("")}
      </div>
    ` : "";

    // Actions area: Add button or Quantity stepper
    let actionAreaHtml = "";
    if (item.price === null) {
      actionAreaHtml = `<span class="unpriced-ask-btn">Auf Anfrage bestellbar</span>`;
    } else if (hasChoices) {
      actionAreaHtml = `
        <div class="configurable-add-wrap">
          ${qty > 0 ? `<span class="configured-cart-count">${qty} im Warenkorb</span>` : ""}
          <button class="add-to-cart-btn" type="button" data-add-uid="${escapeHtml(item.uid)}">
            <span>Auswahl hinzufügen</span>
          </button>
        </div>
      `;
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
        ${choicesHtml}
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
        <p>Keine passenden Einträge gefunden für <strong>"${escapeHtml(menuSearch ? menuSearch.value : "")}"</strong>.</p>
        <button class="button button-outline" id="resetFilterBtn" type="button" style="margin-top:1rem;">Gesamte Karte anzeigen</button>
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
              <span class="menu-group-count">${dishes.length} Einträge</span>
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
      menuCount.textContent = `${allMatches.length} ${allMatches.length === 1 ? "Position" : "Positionen"}`;
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

  const setOrderType = (type) => {
    selectedOrderType = type;
    orderTypeButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.type === type);
    });
    if (fieldTableNumber) fieldTableNumber.hidden = type !== "Vor Ort";
  };

  orderTypeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setOrderType(btn.dataset.type);
    });
  });

  // Add dish to cart
  const addToCart = (uid, qtyDelta = 1, selections = []) => {
    const dish = window.MENU_DATA?.find((item) => item.uid === uid);
    if (!dish || dish.price === null || !hasCompleteSelections(dish, selections)) return;

    const nextEntry = { uid, selections, quantity: 0 };
    const key = cartEntryKey(nextEntry);
    const existing = cart.find((item) => cartEntryKey(item) === key);
    if (existing) {
      existing.quantity += qtyDelta;
      if (existing.quantity <= 0) {
        cart = cart.filter((item) => cartEntryKey(item) !== key);
      }
    } else if (qtyDelta > 0) {
      cart.push({ uid, selections, quantity: qtyDelta });
    }

    saveCart();
    renderCart();
    renderMenu(); // Keep cards in sync
    showToast(`✓ "${dish.name}" im Warenkorb (${getCartQuantity(uid)})`);
  };

  // Modify quantity from cart
  const updateCartQuantity = (key, delta) => {
    const existing = cart.find((item) => cartEntryKey(item) === key);
    if (!existing) return;
    existing.quantity += delta;
    if (existing.quantity <= 0) {
      cart = cart.filter((item) => cartEntryKey(item) !== key);
    }
    saveCart();
    renderCart();
    renderMenu();
  };

  const removeCartItem = (key) => {
    cart = cart.filter((item) => cartEntryKey(item) !== key);
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
    const getSelectionsFromCard = (card, dish, requireComplete = true) => {
      const selections = [];
      for (let groupIndex = 0; groupIndex < getChoiceGroups(dish).length; groupIndex += 1) {
        const choiceGroup = dish.choiceGroups[groupIndex];
        const select = card.querySelector(`[data-choice-group-index="${groupIndex}"]`);
        const option = select?.value === "" ? null : choiceGroup.options[Number(select?.value)];
        select?.classList.toggle("is-invalid", !option);
        if (!option) {
          if (requireComplete) {
            select?.focus();
            select?.reportValidity();
          }
          return null;
        }
        selections.push({ group: choiceGroup.label, option: option.label });
      }
      return selections;
    };

    menuGrid.addEventListener("click", (e) => {
      const addBtn = e.target.closest("[data-add-uid]");
      if (addBtn) {
        const dish = window.MENU_DATA?.find((item) => item.uid === addBtn.dataset.addUid);
        const card = addBtn.closest(".menu-card");
        const selections = getSelectionsFromCard(card, dish, true);
        if (getChoiceGroups(dish).length && !selections) {
          showToast("Bitte treffen Sie zuerst alle Auswahlen.");
          return;
        }
        addToCart(addBtn.dataset.addUid, 1, selections || []);
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

    menuGrid.addEventListener("change", (e) => {
      const select = e.target.closest(".dish-choice-select");
      if (!select) return;
      select.classList.remove("is-invalid");

      const card = select.closest(".menu-card");
      const addBtn = card?.querySelector("[data-add-uid]");
      const dish = window.MENU_DATA?.find((item) => item.uid === addBtn?.dataset.addUid);
      const price = card?.querySelector("[data-card-price]");
      if (!dish || !price) return;

      const selections = getSelectionsFromCard(card, dish, false);
      if (selections) price.textContent = euro.format(getConfiguredPrice(dish, selections));
    });
  }

  // Render Cart Drawer Contents
  const renderCart = () => {
    // Filter out invalid items
    cart = cart.filter((entry) => {
      const dish = getCartItem(entry);
      return dish && hasCompleteSelections(dish, entry.selections);
    });
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
        const key = cartEntryKey(entry);
        const unitPrice = getConfiguredPrice(dish, entry.selections);
        const selectionText = formatSelections(entry);
        const itemRow = document.createElement("div");
        itemRow.className = "cart-item";
        itemRow.innerHTML = `
          <div class="cart-item-title">
            <h4><span>#${escapeHtml(dish.code)}</span>${escapeHtml(dish.name)}</h4>
            ${selectionText ? `<div class="cart-item-selections">${escapeHtml(selectionText)}</div>` : ""}
            <div class="cart-item-unit-price">${euro.format(unitPrice)} je Portion</div>
          </div>
          <div class="cart-item-total">${euro.format(unitPrice * entry.quantity)}</div>
          <div class="cart-item-controls">
            <div class="cart-stepper">
              <button type="button" data-cart-minus="${escapeHtml(key)}" aria-label="Menge verringern">&minus;</button>
              <span>${entry.quantity}</span>
              <button type="button" data-cart-plus="${escapeHtml(key)}" aria-label="Menge erhöhen">+</button>
            </div>
            <button type="button" class="cart-remove-btn" data-cart-remove="${escapeHtml(key)}">
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
    lines.push(`⏰ *Wunschzeit:* ${formData.get("time") || "Schnellstmöglich"}`);
    if (formData.get("notes")?.trim()) {
      lines.push(`📝 *Wünsche / Hinweise:* ${formData.get("notes").trim()}`);
    }

    lines.push("", "📋 *BESTELLTE GERICHTE:*");
    cart.forEach((entry) => {
      const dish = getCartItem(entry);
      if (dish) {
        const unitPrice = getConfiguredPrice(dish, entry.selections);
        const selectionText = formatSelections(entry);
        lines.push(
          `• ${entry.quantity}x [${dish.code}] ${dish.name}${selectionText ? ` — ${selectionText}` : ""} (${euro.format(unitPrice)}) = ${euro.format(
            unitPrice * entry.quantity
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
  const pdfFrame = $(".pdf-desktop-frame", pdfViewer);
  const pdfMobileReader = $("#pdfMobileReader");
  const pdfPages = $("#pdfPages");
  const pdfReaderStatus = $("#pdfReaderStatus");
  const pdfReaderFallback = $("#pdfReaderFallback");
  const PDF_URL = "assets/menu/hannayuki-speisekarte.pdf";
  const PDFJS_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/legacy/build/pdf.min.mjs";
  const PDFJS_WORKER_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/legacy/build/pdf.worker.min.mjs";
  const mobilePdfQuery = window.matchMedia("(max-width: 720px)");
  let pdfLoadPromise;
  let pdfDocument;
  let pdfPageObserver;
  let pdfReturnFocus;

  const useMobilePdfReader = () => mobilePdfQuery.matches || /FBAN|FBAV|Instagram|Messenger|iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const loadPdfJs = () => {
    if (pdfLoadPromise) return pdfLoadPromise;
    pdfLoadPromise = import(PDFJS_URL);
    return pdfLoadPromise;
  };

  const renderPdfPage = async (pageElement) => {
    if (!pdfDocument || pageElement.dataset.state === "rendering" || pageElement.dataset.state === "rendered") return;
    pageElement.dataset.state = "rendering";

    try {
      const pageNumber = Number(pageElement.dataset.page);
      const page = await pdfDocument.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const cssWidth = Math.max(280, Math.min(pageElement.clientWidth, 900));
      const outputScale = Math.min(window.devicePixelRatio || 1, 1.5);
      const viewport = page.getViewport({ scale: (cssWidth / baseViewport.width) * outputScale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { alpha: false });

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = `${Math.floor(viewport.width / outputScale)}px`;
      canvas.style.height = `${Math.floor(viewport.height / outputScale)}px`;
      pageElement.style.aspectRatio = `${viewport.width} / ${viewport.height}`;
      pageElement.append(canvas);

      await page.render({ canvasContext: context, viewport }).promise;
      pageElement.dataset.state = "rendered";
      pageElement.classList.add("is-rendered");
      pdfPageObserver?.unobserve(pageElement);
    } catch (error) {
      pageElement.querySelector("canvas")?.remove();
      pageElement.dataset.state = "error";
      pageElement.dataset.pageLabel = "Seite konnte nicht geladen werden";
      pdfPageObserver?.unobserve(pageElement);
    }
  };

  const buildPdfPages = (pageCount) => {
    if (!pdfPages || pdfPages.childElementCount) return;
    const fragment = document.createDocumentFragment();

    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      const pageElement = document.createElement("article");
      pageElement.className = "pdf-page";
      pageElement.dataset.page = String(pageNumber);
      pageElement.dataset.pageLabel = `Seite ${pageNumber} wird geladen`;
      pageElement.setAttribute("aria-label", `Seite ${pageNumber} von ${pageCount}`);

      const pageLabel = document.createElement("span");
      pageLabel.className = "pdf-page-number";
      pageLabel.textContent = `${pageNumber} / ${pageCount}`;
      pageElement.append(pageLabel);
      fragment.append(pageElement);
    }

    pdfPages.append(fragment);
    pdfPageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) renderPdfPage(entry.target);
      });
    }, { root: pdfMobileReader, rootMargin: "100% 0px", threshold: 0.01 });

    $$(".pdf-page", pdfPages).forEach((pageElement) => pdfPageObserver.observe(pageElement));
  };

  const initMobilePdfReader = async () => {
    if (!pdfMobileReader || !pdfReaderStatus || !pdfReaderFallback) return;
    pdfMobileReader.hidden = false;
    pdfReaderFallback.hidden = true;

    if (pdfDocument) return;
    pdfReaderStatus.hidden = false;

    try {
      const pdfjsLib = await loadPdfJs();
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
      pdfDocument = await pdfjsLib.getDocument(PDF_URL).promise;
      buildPdfPages(pdfDocument.numPages);
      pdfReaderStatus.hidden = true;
    } catch (error) {
      console.error("PDF preview error:", error);
      pdfReaderStatus.hidden = true;
      pdfReaderFallback.hidden = false;
    }
  };

  const setPdfOpen = (open) => {
    if (!pdfViewer) return;
    pdfViewer.hidden = !open;
    document.body.classList.toggle("modal-open", open);
    if (open) {
      pdfReturnFocus = document.activeElement;
      const mobileReaderActive = useMobilePdfReader();
      pdfViewer.classList.toggle("uses-mobile-reader", mobileReaderActive);
      if (pdfMobileReader) pdfMobileReader.hidden = !mobileReaderActive;
      if (mobileReaderActive) {
        if (pdfFrame) pdfFrame.removeAttribute("src");
        initMobilePdfReader();
      } else if (pdfFrame && !pdfFrame.getAttribute("src")) {
        pdfFrame.src = pdfFrame.dataset.src;
      }
      $("#closePdf")?.focus();
    } else if (pdfReturnFocus instanceof HTMLElement) {
      pdfReturnFocus.focus();
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
      <p><strong>Öffnungszeiten:</strong><br>Montag bis Sonntag: 10:30 - 23:00 Uhr</p>
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
