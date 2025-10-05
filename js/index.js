document.addEventListener('DOMContentLoaded', () => {
    fetch("http://127.0.0.1:5000/api/products")
        .then(res => res.json())
        .then(products => displayProducts(products));
});

function displayProducts(products) {
    const container = document.getElementById("product-list");
    container.innerHTML = "";

    products.forEach(p => {
        const div = document.createElement("div");
        div.className = "product-card";
        div.innerHTML = `
      <img src="images/${p.image}" alt="${p.name}" width="150">
      <h3>${p.name}</h3>
      <p>₹${p.price} / ${p.unit}</p>
      <button onclick="addToCart('${p.id}')">Add to Cart</button>
    `;
        container.appendChild(div);
    });
}

function addToCart(productId) {
    fetch("http://127.0.0.1:5000/api/cart", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ product_id: productId })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Added to cart!");
            } else {
                alert("Please login first.");
            }
        });
}
