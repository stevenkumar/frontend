const API_BASE = 'http://127.0.0.1:5000/api/auth';

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }

    await loadProfile();
});

async function loadProfile() {
    const token = localStorage.getItem('token');
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'flex';

    try {
        const res = await fetch(`${API_BASE}/profile`, {
            headers: { 'x-auth-token': token }
        });
        const user = await res.json();

        if (res.ok) {
            document.getElementById('display-name').textContent = user.name;
            document.getElementById('display-email').textContent = user.email;
            document.getElementById('input-name').value = user.name;
            document.getElementById('input-email').value = user.email;

            if (user.profilePicture) {
                const imgUrl = `http://127.0.0.1:5000${user.profilePicture}`;
                document.getElementById('profileImagePreview').innerHTML = `
                    <div class="profile-img">
                        <img src="${imgUrl}" alt="Profile">
                    </div>`;
            } else {
                document.getElementById('profileImagePreview').innerHTML = `
                    <div class="profile-img">
                        <i class="fas fa-user"></i>
                    </div>`;
            }
        } else {
            showToast('Failed to load profile.');
        }
    } catch (err) {
        console.error('Load profile error:', err);
        showToast('Cannot connect to server.');
    } finally {
        if (overlay) overlay.style.display = 'none';
    }
}

// Handle Image Preview
document.getElementById('profileImgInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profileImagePreview').innerHTML = `
                <div class="profile-img">
                    <img src="${e.target.result}" alt="Preview">
                </div>`;
        };
        reader.readAsDataURL(file);
    }
});

// Handle Form Submission
document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const saveBtn = document.getElementById('save-btn');
    const name = document.getElementById('input-name').value;
    const email = document.getElementById('input-email').value;
    const fileInput = document.getElementById('profileImgInput');

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (fileInput.files[0]) {
        formData.append('profilePicture', fileInput.files[0]);
    }

    try {
        const res = await fetch(`${API_BASE}/profile`, {
            method: 'PUT',
            headers: { 'x-auth-token': token },
            body: formData
        });

        const data = await res.json();

        if (res.ok) {
            showToast('Profile updated successfully!');
            // Update local storage user info
            localStorage.setItem('user', JSON.stringify(data.user));
            document.getElementById('display-name').textContent = data.user.name;
            document.getElementById('display-email').textContent = data.user.email;
        } else {
            showToast(data.message || 'Update failed.');
        }
    } catch (err) {
        console.error('Update error:', err);
        showToast('Error connecting to server.');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
    }
});

function handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 3000);
}
