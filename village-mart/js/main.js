// --- Utilities ---
function getCart() {
    return JSON.parse(localStorage.getItem('vm_cart') || '{}');
}
function saveCart(cart) {
    localStorage.setItem('vm_cart', JSON.stringify(cart));
}
function updateCartCount() {
    const cart = getCart();
    let count = 0; for (const pid in cart) count += cart[pid].qty;
    document.querySelectorAll('#cart-count').forEach(span => span.textContent = count);
}
function addToCart(product) {
    const cart = getCart();
    if (!cart[product.id]) {
        cart[product.id] = { name: product.name, price: product.price, unit: product.unit, qty: 1 };
    } else {
        cart[product.id].qty += 1;
    }
    saveCart(cart); updateCartCount();
}

// --- Add to Cart Button Logic (Home page and everywhere else) --
document.querySelectorAll('.add-cart-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
        const pid = btn.dataset.id, name = btn.dataset.name, price = parseInt(btn.dataset.price), unit = btn.dataset.unit;
        addToCart({ id: pid, name, price, unit });
        btn.innerHTML = '✔ Added';
        btn.classList.add('added');
        setTimeout(() => {
            btn.innerHTML = 'Add to Cart';
            btn.classList.remove('added');
        }, 1000);
    });
    btn.style.display = 'inline-block';
});
updateCartCount();

// --- CART PAGE LOGIC ---
if (window.location.pathname.endsWith('cart.html')) {
    const tbody = document.querySelector('#cart-table tbody');
    const cart = getCart();
    let total = 0, rows = '';
    for (const pid in cart) {
        const item = cart[pid];
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        rows += `<tr>
            <td>${item.name}</td>
            <td>₹${item.price}/${item.unit}</td>
            <td>
                <button onclick="window.changeQty('${pid}',-1)">-</button>
                ${item.qty}
                <button onclick="window.changeQty('${pid}',1)">+</button>
            </td>
            <td>₹${itemTotal}</td>
            <td><button onclick="window.removeCartItem('${pid}')">❌</button></td>
        </tr>`;
    }
    tbody.innerHTML = rows;
    document.getElementById('cart-subtotal').textContent = total > 0 ? 'Subtotal: ₹' + total : '';
    document.getElementById('cart-empty').style.display = total === 0 ? '' : 'none';
    document.getElementById('cart-table').style.display = total === 0 ? 'none' : '';
    document.querySelector('.checkout-btn').disabled = total === 0;

    window.changeQty = (pid, delta) => {
        const cart = getCart();
        if (!cart[pid]) return;
        cart[pid].qty += delta;
        if (cart[pid].qty < 1) delete cart[pid];
        saveCart(cart); location.reload();
    };
    window.removeCartItem = (pid) => {
        const cart = getCart();
        delete cart[pid]; saveCart(cart); location.reload();
    };
    document.getElementById('proceed-address-btn').onclick = function () {
        if (total > 0) window.location = 'address.html';
    }
    updateCartCount();
}
// On payment page, redirect to "confirm.html" after placing order
if (window.location.pathname.endsWith('payment.html')) {
    document.getElementById('payment-form').onsubmit = function (e) {
        e.preventDefault();
        window.location = 'confirm.html';
    }
    updateCartCount();
}


// --- ADDRESS PAGE LOGIC -- (If you use address.html as above.) ---
if (window.location.pathname.endsWith('address.html')) {
    const cartTableBody = document.querySelector("#address-cart-table tbody");
    const cartTotalDiv = document.getElementById("address-cart-total");
    const cartEmptyDiv = document.getElementById("address-cart-empty");
    const addressForm = document.getElementById("address-form");
    function redrawAddressCart() {
        const cart = getCart();
        let total = 0, rows = '', count = 0;
        for (const pid in cart) {
            const i = cart[pid];
            total += i.price * i.qty;
            count += i.qty;
            rows += `<tr>
                <td>${i.name}</td>
                <td>₹${i.price}/${i.unit}</td>
                <td>
                  <button type="button" class="qty-btn" onclick="changeAddrQty('${pid}',-1)">-</button>
                  ${i.qty}
                  <button type="button" class="qty-btn" onclick="changeAddrQty('${pid}',1)">+</button>
                </td>
                <td>₹${i.price * i.qty}</td>
                <td><button type="button" class="remove-btn" onclick="removeAddrItem('${pid}')">❌</button></td>
            </tr>`;
        }
        cartTableBody.innerHTML = rows;
        cartTotalDiv.textContent = count ? `Total: ₹${total}` : '';
        cartEmptyDiv.innerHTML = count ? '' : '<em>Your cart is empty.</em>';
        addressForm.querySelector('button[type="submit"]').disabled = !count;
        Array.from(addressForm.elements).forEach(el => {
            if (['button', 'textarea', 'input'].includes(el.tagName.toLowerCase()) && el.type !== 'submit')
                el.disabled = !count;
        });
    }
    window.changeAddrQty = function (pid, delta) {
        const cart = getCart();
        if (!cart[pid]) return;
        cart[pid].qty += delta;
        if (cart[pid].qty < 1) delete cart[pid];
        saveCart(cart); redrawAddressCart(); updateCartCount();
    };
    window.removeAddrItem = function (pid) {
        const cart = getCart();
        delete cart[pid]; saveCart(cart); redrawAddressCart(); updateCartCount();
    };
    redrawAddressCart();

    addressForm.onsubmit = function (e) {
        e.preventDefault();
        if (!getCart() || Object.keys(getCart()).length === 0) {
            alert("Your cart is empty!");
            return false;
        }
        sessionStorage.setItem('vm_addr', 'yes');
        window.location = 'payment.html';
    };
    updateCartCount();
}
