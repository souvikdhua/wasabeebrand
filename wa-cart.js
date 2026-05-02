document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // 1. A/B Testing Logic for Offers
  // ============================================
  const offerElement = document.getElementById('dynamicOfferText');
  const marqueeOffers = document.querySelectorAll('.ab-marquee-offer');
  
  let experimentGroup = localStorage.getItem('wasabee_offer_test');
  
  // If user hasn't been assigned a group, coin flip!
  if (!experimentGroup) {
    experimentGroup = Math.random() < 0.5 ? 'A' : 'B';
    localStorage.setItem('wasabee_offer_test', experimentGroup);
  }
  
  const updateOfferTexts = (group) => {
    const text = group === 'A' 
      ? 'Be honored with <strong>15% OFF</strong> on your savory servings of <strong>₹799</strong> or more.' 
      : 'Be honored with <strong>₹200 OFF</strong> on your savory servings of <strong>₹999</strong> or more.';
    
    const marqueeText = group === 'A' ? 'BE HONORED WITH 15% OFF' : 'BE HONORED WITH ₹200 OFF';

    if (offerElement) offerElement.innerHTML = text;
    marqueeOffers.forEach(el => el.textContent = marqueeText);
  };

  updateOfferTexts(experimentGroup);

  // ============================================
  // 2. WhatsApp Cart Logic
  // ============================================
  let cart = [];
  const WABA_NUMBER = '919163764444'; // As found in the footer

  // Inject Add to Cart buttons into all menu items
  const menuItems = document.querySelectorAll('.popup-item');
  menuItems.forEach((item, index) => {
    // Extract info from DOM
    const nameEl = item.querySelector('.pi-name');
    const priceEl = item.querySelector('.pi-price');
    
    if (nameEl && priceEl) {
      const itemName = nameEl.textContent.trim();
      // Remove rupee symbol and parse int
      const itemPriceStr = priceEl.textContent.replace(/[^\d]/g, '');
      const itemPrice = parseInt(itemPriceStr, 10);
      
      // Create Add Button
      const addBtn = document.createElement('button');
      addBtn.className = 'btn-add-cart';
      addBtn.innerHTML = '+';
      addBtn.setAttribute('aria-label', `Add ${itemName} to cart`);
      addBtn.dataset.name = itemName;
      addBtn.dataset.price = itemPrice;
      
      // Listen for clicks
      addBtn.addEventListener('click', (e) => {
        addToCart(itemName, itemPrice);
        
        // Button animation feedback
        const btn = e.target;
        btn.classList.add('pop');
        setTimeout(() => btn.classList.remove('pop'), 200);
      });
      
      item.appendChild(addBtn);
    }
  });

  // Cart DOM Elements
  const cartToggleBtn = document.getElementById('waCartToggle');
  const cartWidget = document.getElementById('waCartWidget');
  const cartCloseBtn = document.querySelector('.cart-widget-close');
  const cartItemsContainer = document.getElementById('waCartItems');
  const cartTotalEl = document.getElementById('waCartTotal');
  const cartBadge = document.getElementById('waCartBadge');
  const checkoutBtn = document.getElementById('waCheckoutBtn');
  const offerNoticeEl = document.getElementById('waCartOfferNotice');

  // Toggle Cart visibility
  cartToggleBtn.addEventListener('click', () => {
    cartWidget.classList.toggle('open');
  });

  cartCloseBtn.addEventListener('click', () => {
    cartWidget.classList.remove('open');
  });

  // Core Cart Functions
  function addToCart(name, price) {
    const existingItem = cart.find(i => i.name === name);
    if (existingItem) {
      existingItem.qty += 1;
    } else {
      cart.push({ name, price, qty: 1 });
    }
    updateCartUI();
    
    // Open widget briefly on first add if it's closed
    if (!cartWidget.classList.contains('open')) {
       cartWidget.classList.add('open');
    }
  }

  window.removeFromCart = function(name) { // accessible from inline HTML string
    const existingItem = cart.find(i => i.name === name);
    if (existingItem) {
      if (existingItem.qty > 1) {
        existingItem.qty -= 1;
      } else {
        cart = cart.filter(i => i.name !== name);
      }
    }
    updateCartUI();
  }

  function updateCartUI() {
    // 1. Calculate Total
    let total = 0;
    let itemCount = 0;
    cartItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
      total += (item.price * item.qty);
      itemCount += item.qty;
      
      const itemRow = document.createElement('div');
      itemRow.className = 'cart-item-row';
      itemRow.innerHTML = `
        <div class="ci-left">
          <span class="ci-name">${item.name}</span>
          <span class="ci-price">₹${item.price}</span>
        </div>
        <div class="ci-right">
          <div class="qty-control">
            <button class="qty-btn" onclick="removeFromCart('${item.name.replace(/'/g, "\\'")}')">-</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="addToCart('${item.name.replace(/'/g, "\\'")}', ${item.price})">+</button>
          </div>
        </div>
      `;
      cartItemsContainer.appendChild(itemRow);
    });
    
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
    }

    // 2. Update Headers/Badges
    cartTotalEl.textContent = `₹${total}`;
    cartBadge.textContent = itemCount;
    
    if (itemCount > 0) {
      cartToggleBtn.classList.add('has-items');
    } else {
      cartToggleBtn.classList.remove('has-items');
    }

    // 3. Highlight Applicable Offers
    let appliedOffersText = [];
    const grp = localStorage.getItem('wasabee_offer_test');

    if (total >= 1299) {
      appliedOffersText.push('15% Off + Free Dessert applied!');
    } else if (grp === 'A' && total >= 799) {
      appliedOffersText.push('15% Off applied!');
    } else if (grp === 'B' && total >= 999) {
      appliedOffersText.push('₹200 Off applied!');
    } else {
       // Show what they can unlock
       if (grp === 'A' && total < 799) {
          appliedOffersText.push(`Add ₹${799 - total} more for 15% Off`);
       } else if (grp === 'B' && total < 999) {
          appliedOffersText.push(`Add ₹${999 - total} more for ₹200 Off`);
       }
    }
    
    offerNoticeEl.textContent = appliedOffersText.join(' | ');
  }

  // Initial UI Render
  updateCartUI();

  // WhatsApp Checkout
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert("Please add items to your cart first.");
      return;
    }
    
    let total = 0;
    let message = "Hon'ble Wasabee! I am craving your authentic oriental repertoire and wish to experience your savory servings at my humble abode:\n\n";
    
    cart.forEach(item => {
      const lineTotal = item.price * item.qty;
      total += lineTotal;
      message += `${item.qty}x ${item.name} (- ₹${lineTotal})\n`;
    });
    
    message += `\n*Subtotal: ₹${total}*\n`;
    
    // Note the applied offer to the restaurant staff
    const grp = localStorage.getItem('wasabee_offer_test');
    if (total >= 1299) {
      message += `*Offer Claimed:* 15% Off + Free Dessert (Orders ₹1299+)\n`;
    } else if (grp === 'A' && total >= 799) {
      message += `*Offer Claimed:* 15% Off (Orders ₹799+)\n`;
    } else if (grp === 'B' && total >= 999) {
      message += `*Offer Claimed:* ₹200 Off (Orders ₹999+)\n`;
    }
    
    message += `\nPlease confirm my order.`;
    
    const encodedMsg = encodeURIComponent(message);
    const waURL = `https://wa.me/${WABA_NUMBER}?text=${encodedMsg}`;
    
    window.open(waURL, '_blank');
  });

});
