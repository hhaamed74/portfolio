document.addEventListener("DOMContentLoaded", function () {
  // ========== Navbar Dropdown ==========
  const authMenu = document.querySelector(".auth-menu");
  if (authMenu) {
    authMenu.addEventListener("click", function (e) {
      e.stopPropagation();
      authMenu.classList.toggle("show");
    });

    document.addEventListener("click", function () {
      authMenu.classList.remove("show");
    });
  }

  // ========== Set Current Year ==========
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ========== Mobile Menu Toggle ==========
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }

  // ========== Animate Skill Progress Bars ==========
  const skillsSection = document.getElementById("skills");
  const skillElements = document.querySelectorAll(".skill");

  const showSkills = () => {
    skillElements.forEach((skill) => {
      const progress = skill.querySelector(".progress");
      const percent = skill.dataset.progress;
      const color = skill.dataset.color;

      if (progress) {
        progress.style.width = percent + "%";
        progress.style.backgroundColor = color;
      }

      const icon = skill.querySelector("i");
      if (icon) icon.style.color = color;
    });
  };

  const hideSkills = () => {
    skillElements.forEach((skill) => {
      const progress = skill.querySelector(".progress");
      if (progress) progress.style.width = "0%";
    });
  };

  if (skillsSection && skillElements.length > 0) {
    window.addEventListener("scroll", () => {
      const sectionPos = skillsSection.getBoundingClientRect().top;
      const screenPos = window.innerHeight / 1.2;

      if (sectionPos < screenPos) {
        showSkills();
      } else {
        hideSkills();
      }
    });
  }

  // ========== Calculate Age ==========
  const ageEl = document.getElementById("age");
  if (ageEl) {
    const birthDate = new Date("2002-09-15");
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    ageEl.textContent = age;
  }

  // ========== Show More Features ==========
  const showMoreBtn = document.getElementById("show-more-btn");
  if (showMoreBtn) {
    showMoreBtn.addEventListener("click", () => {
      alert("More features coming soon!");
    });
  }
});
