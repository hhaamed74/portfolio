// ==== Selectors ====
const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");

const registerMessage = document.getElementById("register-message");
const loginMessage = document.getElementById("login-message");

// ==== Helper Functions ====
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

function logoutUser() {
  localStorage.removeItem("currentUser");
  showToast("👋 Logged out successfully!");
  setTimeout(() => {
    window.location.href = "/public/login.html";
  }, 1000);
}

function showMessage(element, text, type = "error") {
  element.textContent = text;
  element.style.color = type === "success" ? "green" : "red";
  showToast(text, type);
  setTimeout(() => (element.textContent = ""), 3000);
}

function showToast(message, type = "default") {
  const toast = document.getElementById("toast");
  toast.textContent = message;

  // تغيير اللون حسب النوع
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

// ==== Register Logic ====
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    const users = getUsers();
    const userExists = users.find((user) => user.email === email);

    if (userExists) {
      showMessage(registerMessage, "❌ Email is already registered.", "error");
      return;
    }

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

/// ==== Login Logic ====
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document
      .getElementById("login-email")
      .value.trim()
      .toLowerCase();
    const password = document.getElementById("login-password").value;

    const users = getUsers();
    const foundUser = users.find(
      (user) => user.email === email && user.password === password
    );

    if (!foundUser) {
      showMessage(loginMessage, "❌ Invalid email or password.", "error");
      return;
    }

    // ✅ حفظ بيانات المستخدم وتسجيل الدخول
    setCurrentUser(foundUser);
    localStorage.setItem("isLoggedIn", "true");

    showMessage(loginMessage, "✅ Login successful!", "success");
    setTimeout(() => {
      window.location.href = "/public/dashboard/index.html";
    }, 1000);
  });
}

// ==== Logout Listener ====
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logoutUser);
  }

  // Update menu based on login status
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

  const isProtected = window.location.pathname.includes("/public/dashboard/");

  if (
    isProtected &&
    (!getCurrentUser() || localStorage.getItem("isLoggedIn") !== "true")
  ) {
    alert("Please login to access the dashboard.");
    window.location.href = "/public/login.html";
  }
});
