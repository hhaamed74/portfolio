document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("contact-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
      showToast("❌ Please fill in all fields", "error");
      return;
    }

    const messages = JSON.parse(localStorage.getItem("messages")) || [];

    const newMessage = {
      id: Date.now(),
      name,
      email,
      message,
      date: new Date().toLocaleString(),
    };

    messages.push(newMessage);
    localStorage.setItem("messages", JSON.stringify(messages));

    showToast("✅ Message sent successfully!", "success");

    document.getElementById("contact-form").reset();
  });
});
