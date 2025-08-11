// =======================
//  DOM Element Selectors
// =======================
const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");

const registerMessage = document.getElementById("register-message");
const loginMessage = document.getElementById("login-message");

// =======================
//  Local Storage Helpers
// =======================

/**
 * Retrieve all registered users from localStorage.
 * @returns {Array} List of user objects
 */
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

/**
 * Save updated users list to localStorage.
 * @param {Array} users - List of user objects
 */
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

/**
 * Store the current logged-in user in localStorage.
 * @param {Object} user - The current user object
 */
function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

/**
 * Retrieve the current logged-in user from localStorage.
 * @returns {Object|null} Current user object or null
 */
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

/**
 * Logout the current user and redirect to login page.
 */
function logoutUser() {
  localStorage.removeItem("currentUser");
  showToast("👋 Logged out successfully!");
  setTimeout(() => {
    window.location.href = "/public/login.html";
  }, 1000);
}

// =======================
//  UI Feedback Functions
// =======================

/**
 * Display a message in a target element and show toast.
 * @param {HTMLElement} element - Target DOM element
 * @param {string} text - Message content
 * @param {string} [type="error"] - Message type ("success" or "error")
 */
function showMessage(element, text, type = "error") {
  element.textContent = text;
  element.style.color = type === "success" ? "green" : "red";
  showToast(text, type);
  setTimeout(() => (element.textContent = ""), 3000);
}

/**
 * Display a toast notification.
 * @param {string} message - Notification content
 * @param {string} [type="default"] - Toast type ("success", "error", or "default")
 */
function showToast(message, type = "default") {
  const toast = document.getElementById("toast");
  toast.textContent = message;

  // Change background color based on type
  if (type === "success") {
    toast.style.backgroundColor = "#28a745";
  } else if (type === "error") {
    toast.style.backgroundColor = "#dc3545";
  } else {
    toast.style.backgroundColor = "#333";
  }

  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// =======================
//  Registration Handling
// =======================
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    // === Form Validation ===
    const nameRegex = /^[a-zA-Z\s]{3,30}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!name || !nameRegex.test(name)) {
      showMessage(
        registerMessage,
        "❌ Name must be 3-30 letters only.",
        "error"
      );
      return;
    }

    if (!email || !emailRegex.test(email)) {
      showMessage(registerMessage, "❌ Invalid email format.", "error");
      return;
    }

    if (!password || !passwordRegex.test(password)) {
      showMessage(
        registerMessage,
        "❌ Password must be at least 8 characters with upper, lower, number, and symbol.",
        "error"
      );
      return;
    }

    // === Check if email is already registered ===
    const users = getUsers();
    const userExists = users.find((user) => user.email === email);

    if (userExists) {
      showMessage(registerMessage, "❌ Email is already registered.", "error");
      return;
    }

    // === Save New User ===
    const newUser = { name, email, password };
    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);

    showMessage(registerMessage, "✅ Registered successfully!", "success");

    setTimeout(() => {
      window.location.href = "/public/login.html";
    }, 1500);
  });
}

// =======================
//  Login Handling
// =======================
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document
      .getElementById("login-email")
      .value.trim()
      .toLowerCase();
    const password = document.getElementById("login-password").value;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      showMessage(loginMessage, "❌ Enter a valid email.", "error");
      return;
    }

    if (!password) {
      showMessage(loginMessage, "❌ Password cannot be empty.", "error");
      return;
    }

    // === Authenticate User ===
    const users = getUsers();
    const foundUser = users.find(
      (user) => user.email === email && user.password === password
    );

    if (!foundUser) {
      showMessage(loginMessage, "❌ Invalid email or password.", "error");
      return;
    }

    // === Save Session and Redirect ===
    setCurrentUser(foundUser);
    localStorage.setItem("isLoggedIn", "true");

    showMessage(loginMessage, "✅ Login successful!", "success");

    setTimeout(() => {
      window.location.href = "/public/index.html";
    }, 1000);
  });
}

// =======================
//  Logout & Auth Checks
// =======================
document.addEventListener("DOMContentLoaded", () => {
  // Logout Button Event
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logoutUser);
  }

  // Update navigation menu based on login state
  const authMenu = document.querySelector(".auth-dropdown");
  if (authMenu) {
    const currentUser = getCurrentUser();
    authMenu.innerHTML = currentUser
      ? `
        <li><a href="/public/dashboard/dashboard.html">Dashboard</a></li>
        <li><a href="#" id="logout-btn">Logout</a></li>
      `
      : `
        <li><a href="/public/login.html">Log In</a></li>
        <li><a href="/public/register.html">Register</a></li>
      `;
    if (currentUser) {
      const logoutLink = document.getElementById("logout-btn");
      if (logoutLink) {
        logoutLink.addEventListener("click", logoutUser);
      }
    }
  }

  // Restrict access to protected pages
  const isProtected = window.location.pathname.includes("/public/dashboard/");

  if (
    isProtected &&
    (!getCurrentUser() || localStorage.getItem("isLoggedIn") !== "true")
  ) {
    alert("Please login to access the dashboard.");
    window.location.href = "/public/login.html";
  }
});
