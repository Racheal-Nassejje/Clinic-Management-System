//  ACTIVE SIDEBAR LINK 

function setActiveSidebarLink() {
  const currentPage = window.location.pathname.split('/').pop();
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const linkPage = link.getAttribute('href').split('/').pop();
    const parentItem = link.parentElement;

    if (linkPage === currentPage) {
      parentItem.classList.add('active');
    } else {
      parentItem.classList.remove('active');
    }
  });
}

// DISPLAY LOGGED IN USERNAME 
function displayUsername() {
  const username = localStorage.getItem('clinicms_user');
  const userElements = document.querySelectorAll('.topbar-user');

  if (username && userElements) {
    userElements.forEach(el => {
      el.innerHTML = `&#128100; ${username} &bull; Administrator`;
    });
  }

  const profileName = document.querySelector('.profile-name');
  if (username && profileName) {
    profileName.textContent = username;
  }
}

// LOGIN FORM 
function initLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  // Password toggle
  const toggleBtn = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', function () {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈';
      } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = "👁️";
      }
    });
  }

  // Login form submission
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorDiv = document.getElementById('loginError');

    // Simple validation
    if (username === '') {
      errorDiv.textContent = 'Please enter your username.';
      return;
    }

    if (password === '') {
      errorDiv.textContent = 'Please enter your password.';
      return;
    }

    if (password.length < 4) {
      errorDiv.textContent = 'Password must be at least 4 characters.';
      return;
    }

    // Save username to localStorage
    localStorage.setItem('clinicms_user', username);

    // Redirect to dashboard
    window.location.href = '../HTML/dashboard.html';
  });
}

// LOGOUT 
function initLogout() {
  const logoutLinks = document.querySelectorAll('.nav-link--logout');

  logoutLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      localStorage.removeItem('clinicms_user');
      window.location.href = '../HTML/index.html';
    });
  });
}

// PROTECT PAGES 
// Redirect to login if not logged in
function protectPage() {
  const currentPage = window.location.pathname;
  const isLoginPage = currentPage.includes('index.html');
  if (isLoginPage) return;

  const username = localStorage.getItem('clinicms_user');
  if (!username) {
    window.location.href = '../HTML/index.html';
  }
}

// RUN ALL ON PAGE LOAD 
document.addEventListener('DOMContentLoaded', function () {
  protectPage();
  setActiveSidebarLink();
  displayUsername();
  initLoginForm();
  initLogout();
});