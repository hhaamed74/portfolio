// =========================
// 📌 Contact Form Handler
// =========================
document.addEventListener("DOMContentLoaded", () => {
  // === Select the contact form and handle submit event ===
  document.getElementById("contact-form").addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent default form submission (page reload)

    // === Get form field values and trim whitespace ===
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    // === Basic validation: all fields must be filled ===
    if (!name || !email || !message) {
      showToast("❌ Please fill in all fields", "error");
      return;
    }

    // === Retrieve existing messages from localStorage or create empty array ===
    const messages = JSON.parse(localStorage.getItem("messages")) || [];

    // === Create a new message object ===
    const newMessage = {
      id: Date.now(), // Unique ID based on current timestamp
      name, // Sender's name
      email, // Sender's email
      message, // Message content
      date: new Date().toLocaleString(), // Current date & time in readable format
    };

    // === Add the new message to the messages array ===
    messages.push(newMessage);

    // === Save updated messages list back to localStorage ===
    localStorage.setItem("messages", JSON.stringify(messages));

    // === Show success notification ===
    showToast("✅ Message sent successfully!", "success");

    // === Reset the form fields ===
    document.getElementById("contact-form").reset();
  });
});
