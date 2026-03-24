// ========== Books Data (State) ==========
let booksData = []; // Will be populated from API

// ========== API Integration ==========
async function fetchBooksFromAPI() {
    try {
        const response = await fetch('https://www.googleapis.com/books/v1/volumes?q=subject:fiction&maxResults=40&orderBy=relevance&langRestrict=en');
        const data = await response.json();
        
        // Map Google Books to our format
        booksData = data.items.map(item => {
            const info = item.volumeInfo;
            const sale = item.saleInfo;
            
            return {
                id: item.id, // String ID
                title: info.title,
                author: info.authors ? info.authors[0] : "Unknown Author",
                category: info.categories ? info.categories[0].toLowerCase() : "fiction",
                price: sale.listPrice ? Math.round(sale.listPrice.amount) : Math.floor(Math.random() * (500 - 200) + 200),
                originalPrice: sale.listPrice ? Math.round(sale.listPrice.amount * 1.4) : 699,
                rating: info.averageRating || (Math.random() * (4.9 - 4.0) + 4.0).toFixed(1),
                badge: info.averageRating > 4.5 ? 'Top Rated' : 'Featured',
                description: info.description || "No description available for this book.",
                thumbnail: info.imageLinks ? info.imageLinks.thumbnail.replace('http:', 'https:') : "https://via.placeholder.com/150x220?text=No+Cover",
                previewLink: info.previewLink,
                buyLink: sale.buyLink || info.infoLink
            };
        });

        console.log('Successfully fetched Google Books:', booksData.length);
        
        if (document.getElementById('booksGrid')) loadBooks('all');
        if (document.getElementById('bestsellerSlider')) loadBestsellers();
    } catch (err) {
        console.error('API Fetch Error:', err);
        showToast('Failed to sync with Google Books.');
    }
}

// ========== Cart & Wishlist ==========
let cart = [];
let wishlist = [];

// ========== Initialize ==========
document.addEventListener('DOMContentLoaded', () => {
    fetchBooksFromAPI(); // Load from API first
    startCountdown();
    loadCartFromStorage();
    loadWishlistFromStorage();
    syncWishlistWithBackend();
    testBackendConnection();

    // Update navbar auth label
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('auth-label').textContent = user.name.split(' ')[0];
    }
});

function testBackendConnection() {
    fetch('http://127.0.0.1:5000/api/test')
        .then(res => res.json())
        .then(data => console.log('Backend says:', data.message))
        .catch(err => console.error('Backend connection error:', err));
}

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
                    <button onclick="addToWishlist('${book.id}')" title="Add to Wishlist">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button onclick="openBookModal('${book.id}')" title="Quick View">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
                <img src="${book.thumbnail}" alt="${book.title}" style="width: 100%; height: 100%; object-fit: contain; padding: 20px;">
            </div>
            <div class="book-info">
                <span class="book-category">${capitalizeFirst(book.category)}</span>
                <h3 class="book-title" onclick="openBookModal('${book.id}')">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                <div class="book-rating">
                    ${getStars(book.rating)} (${book.rating})
                </div>
                <div class="book-price">
                    <div>
                        <span class="price">₹${book.price}</span>
                        <span class="original-price">₹${book.originalPrice}</span>
                    </div>
                        <button class="add-to-cart" onclick="addToCart('${book.id}')">
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
                <img src="${book.thumbnail}" alt="${book.title}" style="width: 80%; height: 80%; object-fit: contain;">
            </div>
            <div class="bestseller-info">
                <h4>${book.title}</h4>
                <p>by ${book.author}</p>
                <div class="book-rating">${getStars(book.rating)}</div>
                <div class="price-section">
                    <span class="price">₹${book.price}</span>
                    <button class="btn btn-sm" onclick="openBookModal('${book.id}')" style="padding: 4px 8px; font-size: 0.7rem; margin-left: 10px;">View</button>
                </div>
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
                <div class="cart-item-image">
                    <img src="${item.thumbnail}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: contain;">
                </div>
                <div class="cart-item-info">
                    <h4>${item.title}</h4>
                    <p>${item.author}</p>
                    <div class="cart-item-quantity">
                        <button onclick="updateQuantity('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
                <div>
                    <div class="cart-item-price">₹${item.price * item.quantity}</div>
                    <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">
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
async function syncWishlistWithBackend() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await fetch('http://127.0.0.1:5000/api/auth/wishlist', {
            headers: { 'x-auth-token': token }
        });
        if (res.ok) {
            const data = await res.json();
            wishlist = data; // Backend returns array of IDs
            updateWishlistUI();
        }
    } catch (err) {
        console.error('Wishlist sync error:', err);
    }
}

async function addToWishlist(id) {
    const token = localStorage.getItem('token');
    if (!token) {
        showToast('Please sign in to save wishlist!');
        return;
    }

    const isAdded = wishlist.includes(id);
    const method = isAdded ? 'DELETE' : 'POST';
    const url = `http://127.0.0.1:5000/api/auth/wishlist/${id}`;

    try {
        const res = await fetch(url, {
            method,
            headers: { 'x-auth-token': token }
        });
        const data = await res.json();

        if (res.ok) {
            wishlist = data.wishlist;
            updateWishlistUI();
            showToast(isAdded ? 'Removed from wishlist' : 'Added to wishlist!');
        } else {
            showToast(data.message || 'Action failed.');
        }
    } catch (err) {
        console.error('Wishlist error:', err);
        showToast('Error connecting to server.');
    }
}

function updateWishlistUI() {
    const counts = document.querySelectorAll('.wishlist-count');
    counts.forEach(el => el.textContent = wishlist.length);
    
    // Update hearts in grid
    document.querySelectorAll('.book-card').forEach(card => {
        const id = card.querySelector('.book-actions button').getAttribute('onclick').match(/'([^']+)'/)[1];
        const heart = card.querySelector('.book-actions .fa-heart');
        if (wishlist.includes(id)) {
            heart.classList.remove('far');
            heart.classList.add('fas');
            heart.style.color = '#ef4444';
        } else {
            heart.classList.remove('fas');
            heart.classList.add('far');
            heart.style.color = '';
        }
    });
}

// ========== Modal Functions ==========
function openBookModal(id) {
    const book = booksData.find(b => b.id === id);
    const modal = document.getElementById('bookModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="modal-image" style="background: ${getGradient(book.category)}">
            <img src="${book.thumbnail}" alt="${book.title}" style="max-width: 80%; max-height: 80%; object-fit: contain;">
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
                <button class="btn btn-primary" onclick="addToCartFromModal('${book.id}')">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
                <button class="btn btn-secondary" onclick="addToWishlist('${book.id}')">
                    <i class="fas fa-heart"></i> Wishlist
                </button>
                ${book.previewLink ? `
                <a href="${book.previewLink}" target="_blank" class="btn btn-primary" style="background: #8B5CF6; font-size: 0.9rem; text-decoration: none; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-book-open" style="margin-right: 8px;"></i> Read Now
                </a>` : ''}
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
                        <button onclick="addToWishlist('${book.id}')"><i class="fas fa-heart"></i></button>
                        <button onclick="openBookModal('${book.id}')"><i class="fas fa-eye"></i></button>
                    </div>
                    <img src="${book.thumbnail}" alt="${book.title}" style="width: 100%; height: 100%; object-fit: contain; padding: 20px;">
                </div>
                <div class="book-info">
                    <span class="book-category">${capitalizeFirst(book.category)}</span>
                    <h3 class="book-title" onclick="openBookModal('${book.id}')">${book.title}</h3>
                    <p class="book-author">by ${book.author}</p>
                    <div class="book-rating">${getStars(book.rating)} (${book.rating})</div>
                    <div class="book-price">
                        <div>
                            <span class="price">₹${book.price}</span>
                            <span class="original-price">₹${book.originalPrice}</span>
                        </div>
                        <button class="add-to-cart" onclick="addToCart('${book.id}')">
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

async function submitContact(event) {
    event.preventDefault();
    const btn = document.getElementById('contact-submit');
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const phone = document.getElementById('contact-phone').value;
    const message = document.getElementById('contact-message').value;

    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
        const res = await fetch('http://127.0.0.1:5000/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, phone, message })
        });

        const data = await res.json();

        if (res.ok) {
            showToast('Message sent successfully!');
            event.target.reset();
        } else {
            showToast(data.message || 'Failed to send message.');
        }
    } catch (err) {
        console.error('Contact form error:', err);
        showToast('Cannot connect to server.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Send Message';
    }
}

// ========== Toggle Functions ==========
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
}

function handleAuthClick(e) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        // Redirect to profile page
        e.preventDefault();
        window.location.href = 'profile.html';
    }
    // else: navigate to auth.html (default anchor behavior)
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
