document.addEventListener("DOMContentLoaded", function () {
    fetch("http://127.0.0.1:5000/api/cart", {
        method: "GET",
        credentials: "include"
    })
        .then(res => res.json())
        .then(data => {
            if (data.items) {
                renderCart(data.items, data.total);
            } else {
                document.getElementById("cart").innerHTML = "Your cart is empty or you're not logged in.";
            }
        });
});

function renderCart(items, total) {
    const cartDiv = document.getElementById("cart");
    cartDiv.innerHTML = "";

    items.forEach(item => {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
      <img src="images/${item.image}" alt="${item.name}" width="100">
      <h3>${item.name}</h3>
      <p>₹${item.price} × ${item.quantity} = ₹${item.total}</p>
      <button onclick="updateItem('${item.id}', 1)">+</button>
      <button onclick="updateItem('${item.id}', -1)">-</button>
      <button onclick="removeItem('${item.id}')">Remove</button>
    `;
        cartDiv.appendChild(div);
    });

    const totalDiv = document.createElement("div");
    totalDiv.innerHTML = `<h2>Total: ₹${total}</h2>`;
    cartDiv.appendChild(totalDiv);
}

function updateItem(id, delta) {
    fetch(`http://127.0.0.1:5000/api/cart/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ delta })
    }).then(() => location.reload());
}

function removeItem(id) {
    fetch(`http://127.0.0.1:5000/api/cart/${id}`, {
        method: "DELETE",
        credentials: "include"
    }).then(() => location.reload());
}
