from datetime import datetime
from flask import Flask, jsonify, request, session, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import os
import json

app = Flask(__name__, static_folder='..', static_url_path='')
CORS(app, supports_credentials=True)
app.secret_key = 'your_secret_key_here'
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# ========= Serve frontend HTML =========

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static_file(path):
    return send_from_directory(app.static_folder, path)

# ========= Products (Static Data) =========

PRODUCTS = [
    {"id": "apple", "name": "Apple", "price": 75, "unit": "kg", "image": "apple.jpg", "category": "fruits"},
    {"id": "banana", "name": "Banana", "price": 40, "unit": "dozen", "image": "banana.jpg", "category": "fruits"},
    {"id": "mango", "name": "Mango", "price": 100, "unit": "kg", "image": "mango.jpg", "category": "fruits"},
    {"id": "sugarcane", "name": "Sugarcane", "price": 60, "unit": "bundle", "image": "sugar.jpg", "category": "fruits"},
    {"id": "tomato", "name": "Tomato", "price": 50, "unit": "kg", "image": "tomato.jpg", "category": "vegetables"},
    {"id": "spinach", "name": "Spinach", "price": 25, "unit": "bundle", "image": "spinach.jpg", "category": "vegetables"},
    {"id": "potato", "name": "Potato", "price": 35, "unit": "kg", "image": "potato.jpg", "category": "vegetables"},
    {"id": "butter", "name": "Butter", "price": 60, "unit": "100g", "image": "butter.jpg", "category": "grocery"},
    {"id": "milk", "name": "Milk", "price": 50, "unit": "Litre", "image": "milk.jpg", "category": "grocery"},
    {"id": "rice", "name": "Rice", "price": 55, "unit": "kg", "image": "rice.jpg", "category": "grocery"},
    {"id": "biscuits", "name": "Biscuits", "price": 30, "unit": "pack", "image": "biscuits.jpg", "category": "grocery"},
    {"id": "chips", "name": "Chips", "price": 20, "unit": "pack", "image": "chips.jpg", "category": "grocery"},
    {"id": "detergent", "name": "Detergent", "price": 65, "unit": "500g", "image": "detergent.jpg", "category": "grocery"},
    {"id": "oil", "name": "Oil", "price": 120, "unit": "Litre", "image": "oil.jpg", "category": "grocery"},
    {"id": "paracetamol", "name": "Paracetamol", "price": 15, "unit": "strip", "image": "paracetamol.jpg", "category": "medicines"},
    {"id": "soap", "name": "Soap", "price": 20, "unit": "bar", "image": "soap.jpg", "category": "medicines"},
    {"id": "bandage", "name": "Bandage", "price": 12, "unit": "roll", "image": "bandage.jpg", "category": "medicines"},
    {"id": "vaseline", "name": "Vaseline", "price": 30, "unit": "tube", "image": "vaseline.jpg", "category": "medicines"}
]

# ========= User JSON Helper =========

USERS_FILE = 'users.json'

def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE) as f:
            return json.load(f)
    return {}

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

# ========= User Auth =========

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    users = load_users()

    if not all(k in data for k in ['username', 'email', 'password']):
        return jsonify({"error": "Missing fields"}), 400

    if data['email'] in users:
        return jsonify({"error": "Email already registered"}), 400

    users[data['email']] = {
        'username': data['username'],
        'password': generate_password_hash(data['password']),
        'created_at': datetime.now().isoformat()
    }

    save_users(users)
    return jsonify({"success": True})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    users = load_users()

    if not all(k in data for k in ['email', 'password']):
        return jsonify({"error": "Missing fields"}), 400

    user = users.get(data['email'])
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({"error": "Invalid email or password"}), 401

    session['user'] = data['email']
    return jsonify({"success": True})

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"success": True})

@app.route('/api/user')
def get_user():
    email = session.get('user')
    users = load_users()
    if not email or email not in users:
        return jsonify({"error": "Not logged in"}), 401
    return jsonify({"email": email, "username": users[email]['username']})

# ========= Product Routes =========

@app.route('/api/products')
def get_products():
    category = request.args.get('category')
    if category:
        return jsonify([p for p in PRODUCTS if p['category'] == category])
    return jsonify(PRODUCTS)

@app.route('/api/products/<product_id>')
def get_product(product_id):
    product = next((p for p in PRODUCTS if p['id'] == product_id), None)
    return jsonify(product or {"error": "Not found"}), 404

# ========= Cart Routes =========

@app.route('/api/cart', methods=['GET', 'POST'])
def handle_cart():
    if 'user' not in session:
        return jsonify({"error": "Not logged in"}), 401

    if request.method == 'POST':
        product_id = request.json.get('product_id')
        product = next((p for p in PRODUCTS if p['id'] == product_id), None)
        if not product:
            return jsonify({"error": "Product not found"}), 404

        cart = session.get('cart', {})
        cart[product_id] = cart.get(product_id, 0) + 1
        session['cart'] = cart
        return jsonify({"success": True})

    # GET request
    cart = session.get('cart', {})
    cart_details = []
    total = 0
    for product_id, qty in cart.items():
        product = next((p for p in PRODUCTS if p['id'] == product_id), None)
        if product:
            subtotal = product['price'] * qty
            cart_details.append({**product, 'quantity': qty, 'total': subtotal})
            total += subtotal
    return jsonify({"items": cart_details, "total": total})

@app.route('/api/cart/<product_id>', methods=['PATCH', 'DELETE'])
def update_cart_item(product_id):
    if 'user' not in session:
        return jsonify({"error": "Not logged in"}), 401

    cart = session.get('cart', {})

    if request.method == 'PATCH':
        delta = request.json.get('delta', 0)
        new_qty = cart.get(product_id, 0) + delta
        if new_qty < 1:
            cart.pop(product_id, None)
        else:
            cart[product_id] = new_qty

    if request.method == 'DELETE':
        cart.pop(product_id, None)

    session['cart'] = cart
    return jsonify({"success": True})

# ========= Error Handlers =========

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Server error"}), 500

# ========= Run the App =========

if __name__ == '__main__':
    app.run(debug=True, port=5000)
