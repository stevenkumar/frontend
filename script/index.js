// ========== Books Data ==========
const booksData = [
    {
        id: 1,
        title: "The Midnight Library",
        author: "Matt Haig",
        category: "fiction",
        price: 399,
        originalPrice: 599,
        rating: 4.5,
        badge: "Bestseller",
        description: "Between life and death there is a library, and within that library, the shelves go on forever.",
        emoji: "📕"
    },
    {
        id: 2,
        title: "Atomic Habits",
        author: "James Clear",
        category: "non-fiction",
        price: 449,
        originalPrice: 699,
        rating: 4.8,
        badge: "Popular",
        description: "An easy and proven way to build good habits and break bad ones.",
        emoji: "📗"
    },
    {
        id: 3,
        title: "The Silent Patient",
        author: "Alex Michaelides",
        category: "mystery",
        price: 349,
        originalPrice: 499,
        rating: 4.3,
        badge: "New",
        description: "A shocking psychological thriller of a woman's act of violence against her husband.",
        emoji: "📘"
    },
    {
        id: 4,
        title: "The Notebook",
        author: "Nicholas Sparks",
        category: "romance",
        price: 299,
        originalPrice: 450,
        rating: 4.6,
        badge: "Classic",
        description: "A story of love that will stay with you forever.",
        emoji: "📙"
    },
    {
        id: 5,
        title: "Dune",
        author: "Frank Herbert",
        category: "sci-fi",
        price: 499,
        originalPrice: 750,
        rating: 4.7,
        badge: "Epic",
        description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides.",
        emoji: "📕"
    },
    {
        id: 6,
        title: "Think and Grow Rich",
        author: "Napoleon Hill",
        category: "non-fiction",
        price: 249,
        originalPrice: 399,
        rating: 4.4,
        badge: "Bestseller",
        description: "The timeless classic on unlocking your potential.",
        emoji: "📗"
    },
    {
        id: 7,
        title: "Gone Girl",
        author: "Gillian Flynn",
        category: "mystery",
        price: 379,
        originalPrice: 549,
        rating: 4.2,
        badge: "Thriller",
        description: "On a warm summer morning in North Carthage, Missouri, it is Nick and Amy's fifth wedding anniversary.",
        emoji: "📘"
    },
    {
        id: 8,
        title: "Pride and Prejudice",
        author: "Jane Austen",
        category: "romance",
        price: 199,
        originalPrice: 350,
        rating: 4.9,
        badge: "Classic",
        description: "A timeless tale of love and relationships in Georgian England.",
        emoji: "📙"
    },
    {
        id: 9,
        title: "1984",
        author: "George Orwell",
        category: "fiction",
        price: 299,
        originalPrice: 450,
        rating: 4.6,
        badge: "Must Read",
        description: "A dystopian novel set in a totalitarian society.",
        emoji: "📕"
    },
    {
        id: 10,
        title: "The Alchemist",
        author: "Paulo Coelho",
        category: "fiction",
        price: 349,
        originalPrice: 500,
        rating: 4.5,
        badge: "Inspirational",
        description: "A magical story about following your dreams.",
        emoji: "📗"
    },
    {
        id: 11,
        title: "Sapiens",
        author: "Yuval Noah Harari",
        category: "non-fiction",
        price: 549,
        originalPrice: 799,
        rating: 4.7,
        badge: "Popular",
        description: "A brief history of humankind.",
        emoji: "📘"
    },
    {
        id: 12,
        title: "The Da Vinci Code",
        author: "Dan Brown",
        category: "mystery",
        price: 399,
        originalPrice: 599,
        rating: 4.3,
        badge: "Thriller",
        description: "A gripping tale of symbology and secrets.",
        emoji: "📙"
    }
];

// ========== Cart & Wishlist ==========
let cart = [];
let wishlist = [];

// ========== Initialize ==========
document.addEventListener('DOMContentLoaded', () => {
    loadBooks('all');
    loadBestsellers();
    startCountdown();
    loadCartFromStorage();
    loadWishlistFromStorage();
});

// ========== Load Books ==========
function loadBooks(category) {
    const grid = document.getElementById('booksGrid');
    let filteredBooks = category === 'all' 
        ? booksData 
        : booksData.filter(book => book.category === category);
    
    grid.innerHTML = filteredBooks.map(book => `
        <div class="book-card" data-category="${book.category}">
            <div class="book-image" style="background: ${getGradient(book.category)}">
                ${book.badge ? `<span class="book-badge">${book.badge}</span>` : ''}
                <div class="book-actions">
                    <button onclick="addToWishlist(${book.id})" title="Add to Wishlist">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button onclick="openBookModal(${book.id})" title="Quick View">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
                <span style="font-size: 4rem;">${book.emoji}</span>
            </div>
            <div class="book-info">
                <span class="book-category">${capitalizeFirst(book.category)}</span>
                <h3 class="book-title" onclick="openBookModal(${book.id})">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                <div class="book-rating">
                    ${getStars(book.rating)} (${book.rating})
                </div>
                <div class="book-price">
                    <div>
                        <span class="price">₹${book.price}</span>
                        <span class="original-price">₹${book.originalPrice}</span>
                    </div>
                    <button class="add-to-cart" onclick="addToCart(${book.id})">
                        <i class="fas fa-cart-plus"></i> Add
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ========== Filter Books ==========
function filterBooks(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadBooks(category);
}

function filterByCategory(category) {
    document.querySelector('#featured').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase().includes(category)) {
                btn.classList.add('active');
            }
        });
        loadBooks(category);
    }, 500);
}

// ========== Load Bestsellers ==========
function loadBestsellers() {
    const slider = document.getElementById('bestsellerSlider');
    const bestsellers = booksData.slice(0, 5);
    
    slider.innerHTML = bestsellers.map((book, index) => `
        <div class="bestseller-card">
            <span class="bestseller-rank">#${index + 1}</span>
            <div class="bestseller-image" style="background: ${getGradient(book.category)}">
                ${book.emoji}
            </div>
            <div class="bestseller-info">
                <h4>${book.title}</h4>
                <p>${book.author}</p>
                <div class="book-rating">${getStars(book.rating)}</div>
                <span class="price">₹${book.price}</span>
            </div>
        </div>
    `).join('');
}

function slideBestsellers(direction) {
    const slider = document.getElementById('bestsellerSlider');
    const scrollAmount = 380;
    slider.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}

// ========== Cart Functions ==========
function addToCart(id) {
    const book = booksData.find(b => b.id === id);
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...book, quantity: 1 });
    }
    
    updateCartUI();
    saveCartToStorage();
    showToast(`"${book.title}" added to cart!`);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
    saveCartToStorage();
}

function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            updateCartUI();
            saveCartToStorage();
        }
    }
}

function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.querySelector('.cart-count');
    const cartTotal = document.getElementById('cartTotal');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartCount.textContent = totalItems;
    cartTotal.textContent = `₹${totalPrice}`;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">${item.emoji}</div>
                <div class="cart-item-info">
                    <h4>${item.title}</h4>
                    <p>${item.author}</p>
                    <div class="cart-item-quantity">
                        <button onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <div>
                    <div class="cart-item-price">₹${item.price * item.quantity}</div>
                    <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

function checkout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    showToast('Proceeding to checkout...');
    // In a real app, this would redirect to checkout page
}

// ========== Wishlist Functions ==========
function addToWishlist(id) {
    const book = booksData.find(b => b.id === id);
    
    if (!wishlist.find(item => item.id === id)) {
        wishlist.push(book);
        updateWishlistUI();
        saveWishlistToStorage();
        showToast(`"${book.title}" added to wishlist!`);
    } else {
        showToast('Already in wishlist!');
    }
}

function updateWishlistUI() {
    document.querySelector('.wishlist-count').textContent = wishlist.length;
}

function toggleWishlist() {
    showToast(`You have ${wishlist.length} items in wishlist`);
}

// ========== Modal Functions ==========
function openBookModal(id) {
    const book = booksData.find(b => b.id === id);
    const modal = document.getElementById('bookModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="modal-image" style="background: ${getGradient(book.category)}">
            <span>${book.emoji}</span>
        </div>
        <div class="modal-info">
            <span class="book-category">${capitalizeFirst(book.category)}</span>
            <h2>${book.title}</h2>
            <p class="author">by ${book.author}</p>
            <div class="rating">${getStars(book.rating)} (${book.rating}/5)</div>
            <p class="description">${book.description}</p>
            <div class="price-section">
                <span class="current-price">₹${book.price}</span>
                <span class="old-price">₹${book.originalPrice}</span>
                <span style="color: #10B981; margin-left: 10px;">
                    ${Math.round((1 - book.price/book.originalPrice) * 100)}% OFF
                </span>
            </div>
            <div class="quantity-selector">
                <span>Quantity:</span>
                <button onclick="changeModalQuantity(-1)">-</button>
                <input type="number" id="modalQuantity" value="1" min="1">
                <button onclick="changeModalQuantity(1)">+</button>
            </div>
            <div class="modal-actions">
                <button class="btn btn-primary" onclick="addToCartFromModal(${book.id})">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
                <button class="btn btn-secondary" onclick="addToWishlist(${book.id})">
                    <i class="fas fa-heart"></i> Wishlist
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('bookModal').classList.remove('active');
}

function changeModalQuantity(change) {
    const input = document.getElementById('modalQuantity');
    let value = parseInt(input.value) + change;
    if (value < 1) value = 1;
    input.value = value;
}

function addToCartFromModal(id) {
    const quantity = parseInt(document.getElementById('modalQuantity').value);
    const book = booksData.find(b => b.id === id);
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ ...book, quantity });
    }
    
    updateCartUI();
    saveCartToStorage();
    closeModal();
    showToast(`${quantity} item(s) added to cart!`);
}

// ========== Search Function ==========
function searchBooks() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    
    if (query.trim() === '') {
        loadBooks('all');
        return;
    }
    
    const filtered = booksData.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.category.toLowerCase().includes(query)
    );
    
    const grid = document.getElementById('booksGrid');
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                <h3>No books found for "${query}"</h3>
                <p>Try a different search term</p>
            </div>
        `;
    } else {
        grid.innerHTML = filtered.map(book => `
            <div class="book-card" data-category="${book.category}">
                <div class="book-image" style="background: ${getGradient(book.category)}">
                    ${book.badge ? `<span class="book-badge">${book.badge}</span>` : ''}
                    <div class="book-actions">
                        <button onclick="addToWishlist(${book.id})"><i class="fas fa-heart"></i></button>
                        <button onclick="openBookModal(${book.id})"><i class="fas fa-eye"></i></button>
                    </div>
                    <span style="font-size: 4rem;">${book.emoji}</span>
                </div>
                <div class="book-info">
                    <span class="book-category">${capitalizeFirst(book.category)}</span>
                    <h3 class="book-title" onclick="openBookModal(${book.id})">${book.title}</h3>
                    <p class="book-author">by ${book.author}</p>
                    <div class="book-rating">${getStars(book.rating)} (${book.rating})</div>
                    <div class="book-price">
                        <div>
                            <span class="price">₹${book.price}</span>
                            <span class="original-price">₹${book.originalPrice}</span>
                        </div>
                        <button class="add-to-cart" onclick="addToCart(${book.id})">
                            <i class="fas fa-cart-plus"></i> Add
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    document.querySelector('#featured').scrollIntoView({ behavior: 'smooth' });
}

// ========== Countdown Timer ==========
function startCountdown() {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    
    function updateCountdown() {
        const now = new Date();
        const diff = endDate - now;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// ========== Form Handlers ==========
function subscribeNewsletter(event) {
    event.preventDefault();
    showToast('Thank you for subscribing!');
    event.target.reset();
}

function submitContact(event) {
    event.preventDefault();
    showToast('Message sent successfully!');
    event.target.reset();
}

// ========== Toggle Functions ==========
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
}

function toggleProfile() {
    showToast('Login feature coming soon!');
}

function closeAll() {
    document.getElementById('cartSidebar').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
    document.getElementById('bookModal').classList.remove('active');
}

// ========== Toast Notification ==========
function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    toast.classList.add('active');
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// ========== Helper Functions ==========
function getStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '⭐';
    }
    
    return stars;
}

function getGradient(category) {
    const gradients = {
        'fiction': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'non-fiction': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'mystery': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'romance': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'sci-fi': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'self-help': 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
        'biography': 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
        'children': 'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)'
    };
    return gradients[category] || gradients['fiction'];
}

function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// ========== Local Storage ==========
function saveCartToStorage() {
    localStorage.setItem('bookstoreCart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('bookstoreCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

function saveWishlistToStorage() {
    localStorage.setItem('bookstoreWishlist', JSON.stringify(wishlist));
}

function loadWishlistFromStorage() {
    const savedWishlist = localStorage.getItem('bookstoreWishlist');
    if (savedWishlist) {
        wishlist = JSON.parse(savedWishlist);
        updateWishlistUI();
    }
}

// ========== Search on Enter ==========
document.getElementById('searchInput')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchBooks();
    }
});

// ========== Smooth Scroll for Navbar Links ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
