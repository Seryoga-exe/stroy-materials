// Массив товаров (вместо базы данных)
const products = [
    { id: 1, title: "Цемент М500, 50 кг", price: 450, image: "img/cement.jpg", desc: "Высокопрочный цемент для фундамента." },
    { id: 2, title: "Кирпич красный, шт", price: 25, image: "img/brick.jpg", desc: "Полнотелый керамический кирпич." },
    { id: 3, title: "Краска фасадная, 10 л", price: 1200, image: "img/paint.jpg", desc: "Атмосферостойкая акриловая краска." }
];

// Загрузка корзины из localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// 1. Отрисовка каталога (на главной)
if (document.getElementById('product-list')) {
    const list = document.getElementById('product-list');
    products.forEach(p => {
        list.innerHTML += `
            <div class="card">
                <img src="${p.image}" alt="${p.title}">
                <h3>${p.title}</h3>
                <p class="price">${p.price} ₽</p>
                <p class="desc">${p.desc}</p>
                <button onclick="addToCart(${p.id})">В корзину</button>
            </div>
        `;
    });
}

// 2. Добавление в корзину
function addToCart(id) {
    const item = cart.find(x => x.id === id);
    if (item) {
        item.qty++;
    } else {
        cart.push({ id: id, qty: 1 });
    }
    saveCart();
    alert('Товар добавлен в корзину!');
}

// 3. Отрисовка корзины (на cart.html)
if (document.getElementById('cart-items')) {
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cart-items');
    let total = 0;
    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<p>Корзина пуста. <a href="index.html">Перейти в каталог</a></p>';
        document.getElementById('checkout-form').style.display = 'none';
    } else {
        document.getElementById('checkout-form').style.display = 'block';
        cart.forEach(item => {
            const product = products.find(p => p.id === item.id);
            const sum = product.price * item.qty;
            total += sum;
            container.innerHTML += `
                <div class="cart-item">
                    <span>${product.title}</span>
                    <span>${item.qty} шт. × ${product.price} ₽ = ${sum} ₽</span>
                    <button onclick="removeFromCart(${item.id})">Удалить</button>
                </div>
            `;
        });
    }
    document.getElementById('cart-total-price').innerText = total;
    updateCartCount();
}

// 4. Удаление из корзины
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
}

// 5. Сохранение и обновление счетчика
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('#cart-count').forEach(el => el.innerText = count);
}

// 6. Оформление заказа
function submitOrder() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;

    if (!name || !phone || !address) {
        alert('Заполните все поля!');
        return;
    }

    // 1. Формируем объект заказа
    const order = {
        id: Date.now(),
        name: name,
        phone: phone,
        address: address,
        items: cart,
        total: document.getElementById('cart-total-price').innerText,
        date: new Date().toLocaleString()
    };

    // 2. Сохраняем в локальную историю (LocalStorage)
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // 3. Отправляем на Formspree (ID замените на свой)
    fetch('https://formspree.io/f/ВАШ_FORMSPREE_ID', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(order)
    })
    .then(response => response.json())
    .then(data => {
        // 4. Успешная отправка: очищаем корзину и показываем сообщение
        document.getElementById('checkout-form').style.display = 'none';
        document.getElementById('cart-items').innerHTML = '';
        document.getElementById('cart-total-price').innerText = '0';
        document.getElementById('order-message').style.display = 'block';
        document.getElementById('order-message').innerText = `Спасибо, ${name}! Заказ №${order.id} оформлен.`;
        
        cart = [];
        saveCart();
    })
    .catch(error => {
        alert('Ошибка отправки. Попробуйте ещё раз.');
        console.error(error);
    });
}
// Инициализация счетчика при загрузке
updateCartCount();
