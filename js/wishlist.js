const WISHLIST_API = 'http://127.0.0.1:5000/api/auth/wishlist';

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }

    // Ensure booksData is populated
    if (booksData.length === 0) {
        await fetchBooksFromAPI();
    }

    await loadWishlistItems();
});

async function loadWishlistItems() {
    const token = localStorage.getItem('token');
    const grid = document.getElementById('wishlist-grid');
    const emptyState = document.getElementById('empty-state');

    try {
        const res = await fetch(WISHLIST_API, {
            headers: { 'x-auth-token': token }
        });
        const wishlistIds = await res.json();

        if (res.ok) {
            if (wishlistIds.length === 0) {
                grid.innerHTML = '';
                emptyState.style.display = 'block';
            } else {
                emptyState.style.display = 'none';
                const favoriteBooks = booksData.filter(book => wishlistIds.includes(book.id));
                
                grid.innerHTML = favoriteBooks.map(book => `
                    <div class="book-card" data-id="${book.id}">
                        <div class="book-image" style="background: ${getGradient(book.category)}">
                            <div class="book-actions">
                                <button onclick="removeFromWishlistPage('${book.id}')" title="Remove from Wishlist">
                                    <i class="fas fa-heart" style="color: #ef4444;"></i>
                                </button>
                                <button onclick="openBookModal('${book.id}')" title="Quick View">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            <img src="${book.thumbnail}" alt="${book.title}" style="width: 100%; height: 100%; object-fit: contain; padding: 20px;">
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
                                </div>
                                <button class="add-to-cart" onclick="addToCart(${book.id})">
                                    <i class="fas fa-cart-plus"></i> Add
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
            
            // Update counts
            const counts = document.querySelectorAll('.wishlist-count');
            counts.forEach(el => el.textContent = wishlistIds.length);
        }
    } catch (err) {
        console.error('Wishlist load error:', err);
    }
}

async function removeFromWishlistPage(id) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${WISHLIST_API}/${id}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': token }
        });
        if (res.ok) {
            showToast('Removed from wishlist');
            await loadWishlistItems();
            // Also sync local wishlist in index.js if needed
            if (typeof wishlist !== 'undefined') {
                wishlist = wishlist.filter(item => item !== id);
            }
        }
    } catch (err) {
        console.error('Remove error:', err);
    }
}
