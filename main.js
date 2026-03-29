// ── Cart State ──
  // Structure ready for backend: each item has id, name, category, price, qty
  let cart = [];

  function addToCart(btn) {
    const card = btn.closest('.dish-card');
    const item = {
      id: card.dataset.id,
      name: card.dataset.name,
      category: card.querySelector('.dish-cat-tag').textContent.trim(),
      price: parseInt(card.dataset.price),
      qty: 1
    };

    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push(item);
    }

    // Visual feedback on button
    btn.classList.add('added');
    btn.textContent = '✓';
    setTimeout(() => {
      btn.classList.remove('added');
      btn.textContent = '+';
    }, 700);

    updateCartUI();
    showToast(`${item.name} added to cart`);
  }

  function updateCartUI() {
    const badge = document.getElementById('cartBadge');
    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    badge.textContent = totalQty;
    badge.classList.toggle('show', totalQty > 0);

    const list = document.getElementById('cartItemsList');
    const footer = document.getElementById('cartFooter');
    const empty = document.getElementById('cartEmpty');

    if (cart.length === 0) {
      empty.style.display = 'flex';
      footer.style.display = 'none';
      // Remove all item rows
      list.querySelectorAll('.cart-item').forEach(el => el.remove());
    } else {
      empty.style.display = 'none';
      footer.style.display = 'block';
      renderCartItems();
    }

    // Update total
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    document.getElementById('cartTotal').textContent = `₹${total.toLocaleString('en-IN')}`;
  }

  function renderCartItems() {
    const list = document.getElementById('cartItemsList');
    // Remove old rows
    list.querySelectorAll('.cart-item').forEach(el => el.remove());
    // Re-render
    cart.forEach(item => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.dataset.id = item.id;
      div.innerHTML = `
        <div class="cart-item-name">
          <div class="cart-item-cat">${item.category}</div>
          ${item.name}
        </div>
        <div class="cart-qty-ctrl">
          <button class="cart-qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
          <span class="cart-qty-num">${item.qty}</span>
          <button class="cart-qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
        </div>
        <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
      `;
      list.insertBefore(div, document.getElementById('cartEmpty'));
    });
  }

  function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
    updateCartUI();
  }

  function clearCart() {
    cart = [];
    updateCartUI();
  }

  function toggleCart() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    drawer.classList.toggle('open');
    overlay.classList.toggle('show');
    document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
  }

  function closeCart() {
    document.getElementById('cartDrawer').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('show');
    document.body.style.overflow = '';
  }

  function handleCheckout() {
    if (cart.length === 0) return;
    // BACKEND INTEGRATION: Replace this alert with your API call
    // Example:
    // fetch('/api/orders', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     items: cart,
    //     total: cart.reduce((s, i) => s + i.price * i.qty, 0)
    //   })
    // }).then(res => res.json()).then(data => { ... });
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const itemCount = cart.reduce((s, i) => s + i.qty, 0);
    alert(`🎉 Order Summary\n\n${itemCount} item(s) — ₹${total.toLocaleString('en-IN')}\n\nThank you for ordering from D'Cruz Biryani Restaurant!\nOur team will contact you to confirm your order.`);
    clearCart();
    closeCart();
  }

  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

// ─────────────────────────────────

// ── Custom Cursor (desktop only) ──
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  if (window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', e => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      ring.style.left = e.clientX + 'px';
      ring.style.top = e.clientY + 'px';
    });
    document.querySelectorAll('a, button, .cat-btn, .dish-card').forEach(el => {
      el.addEventListener('mouseenter', () => { cursor.classList.add('hover'); ring.classList.add('hover'); });
      el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); ring.classList.remove('hover'); });
    });
  }

  // ── Hamburger Menu ──
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });
  document.querySelectorAll('.mob-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ── Nav Scroll Effect ──
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
  });

  // ── Menu Category Filter (smooth staggered reveal) ──
  const catBtns = document.querySelectorAll('.cat-btn');
  const dishCards = document.querySelectorAll('.dish-card');

  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;

      // First fade everything out
      dishCards.forEach(card => {
        if (card.classList.contains('show')) {
          card.classList.add('exiting');
        }
      });

      setTimeout(() => {
        dishCards.forEach(card => {
          card.classList.remove('show', 'exiting', 'entering');
          if (cat === 'all' || card.dataset.cat === cat) {
            card.classList.add('show', 'entering');
          }
        });

        // Stagger the entering cards
        const enteringCards = document.querySelectorAll('.dish-card.entering');
        enteringCards.forEach((card, i) => {
          card.style.transitionDelay = `${i * 60}ms`;
        });

        // Clean up after animation
        setTimeout(() => {
          enteringCards.forEach(card => {
            card.classList.remove('entering');
            card.style.transitionDelay = '';
          });
        }, enteringCards.length * 60 + 500);

      }, 250);
    });
  });

  const revealTargets = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  revealTargets.forEach(el => revealObserver.observe(el));

  // Ensure menu section is always fully visible (no slide-down on the section itself)
  const menuSection = document.getElementById('menu');
  if (menuSection) menuSection.classList.add('visible');

  // ── Staggered slide-in for dish cards when menu scrolls into view ──
  const menuGrid = document.getElementById('menuGrid');
  if (menuGrid) {
    const cardRevealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const visibleCards = menuGrid.querySelectorAll('.dish-card.show');
          visibleCards.forEach((card, i) => {
            card.style.animationDelay = `${i * 55}ms`;
          });
          cardRevealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });
    cardRevealObserver.observe(menuGrid);
  }