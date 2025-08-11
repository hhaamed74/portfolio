// ==========================
// 1) Authentication & User Info (on initial DOM load)
// ==========================
window.addEventListener("DOMContentLoaded", function () {
  const loggedInUser = JSON.parse(localStorage.getItem("currentUser"));
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  // Redirect to login if not authenticated
  if (!loggedInUser || isLoggedIn !== "true") {
    window.location.href = "/public/login.html";
  }

  // Display username in dashboard if available
  const usernameElement = document.getElementById("dashboard-username");
  if (usernameElement && loggedInUser) {
    usernameElement.textContent =
      loggedInUser.username || loggedInUser.name || loggedInUser.email;
  }
});

// ==========================
// 2) Selectors & Storage Setup
// ==========================
const sidebarItems = document.querySelectorAll(".sidebar ul li");
const sections = document.querySelectorAll(".section");

// Projects-related selectors
const projectList = document.getElementById("project-list");
const clearProjectsBtn = document.getElementById("clear-projects-btn");
const restoreProjectBtn = document.getElementById("restore-project-btn");

// Recycle & logs
const recycleList = document.getElementById("recycle-list");
const logList = document.getElementById("log-list");
const clearRecycleBtn = document.getElementById("clear-recycle-btn");

// Project search input
const searchInput = document.getElementById("searchInput");

// Project data from localStorage
let projects = JSON.parse(localStorage.getItem("projects")) || [];
let deletedProjects = JSON.parse(localStorage.getItem("deletedProjects")) || [];
let logs = JSON.parse(localStorage.getItem("projectLogs")) || [];

// Other state variables
let lastDeletedProject = null;
let restoreUsed = false;
let editIndex = null;

// ==========================
// 3) Toast Utility Functions
// ==========================
function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// ==========================
// 4) UI Navigation (Sidebar handling)
// ==========================
function showSection(index) {
  sections.forEach((section, i) => {
    section.style.display = i === index ? "block" : "none";
  });
}

sidebarItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    sidebarItems.forEach((el) => el.classList.remove("active"));
    item.classList.add("active");
    showSection(index);
  });
});

// ==========================
// 5) Projects Management
//    - renderProjects(filterTerm)
//    - deleteProject(index)
//    - startEditProject(index)
//    - restore last deleted
//    - clear all projects
//    - add/edit project form handling
// ==========================

function renderProjects(filterTerm = "") {
  if (!projectList) return;
  projectList.innerHTML = "";

  const filteredProjects = projects.filter((project) => {
    const textContent = `
      ${project.title}
      ${project.description}
      ${project.technologies.join(" ")}
    `.toLowerCase();

    return textContent.includes(filterTerm.toLowerCase());
  });

  filteredProjects.forEach((project, index) => {
    const card = document.createElement("div");
    card.classList.add("project-card");

    const techBadges = project.technologies
      .map((tech) => `<span class="badge">${tech}</span>`)
      .join(" ");

    card.innerHTML = `
      ${
        project.image
          ? `<img src="${project.image}" alt="${project.title}" />`
          : ""
      }
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      ${
        project.demo
          ? `<a href="${project.demo}" target="_blank" style="color: white; text-decoration:none;">🔗 View Demo</a>`
          : ""
      }
      <div class="badges">${techBadges}</div>
      <button class="delete-btn" data-index="${index}">🗑️ Delete</button>
      <button class="edit-btn" data-index="${index}">✏️ Edit</button>
    `;

    projectList.appendChild(card);
  });

  // Attach delete listeners
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      deleteProject(index);
    });
  });

  // Attach edit listeners
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      startEditProject(index);
    });
  });
}

// Live search for projects
if (searchInput) {
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    renderProjects(term);
  });
}

// Delete single project (move to recycle & logs)
function deleteProject(index) {
  index = Number(index);
  if (isNaN(index) || !projects[index]) return;

  const deleted = { ...projects[index], id: projects[index].id || Date.now() };

  if (!restoreUsed) {
    lastDeletedProject = deleted;
    if (restoreProjectBtn) restoreProjectBtn.style.display = "inline-block";
  } else {
    lastDeletedProject = null;
  }

  logs.push({ title: deleted.title, time: new Date().toLocaleString() });
  deletedProjects.push(deleted);
  projects.splice(index, 1);

  localStorage.setItem("projects", JSON.stringify(projects));
  localStorage.setItem("deletedProjects", JSON.stringify(deletedProjects));
  localStorage.setItem("projectLogs", JSON.stringify(logs));

  renderProjects();
  renderRecycleBin();
  renderLogs();
}

// Start editing a project (populate form fields)
function startEditProject(index) {
  index = Number(index);
  if (isNaN(index) || !projects[index]) return;

  const project = projects[index];
  editIndex = index;

  // These elements are defined later; ensure they exist in DOM
  if (typeof projectTitleInput !== "undefined") {
    projectTitleInput.value = project.title;
  }
  if (typeof projectDescriptionInput !== "undefined") {
    projectDescriptionInput.value = project.description;
  }
  if (typeof projectImageURLInput !== "undefined") {
    projectImageURLInput.value = project.image?.startsWith("data:")
      ? ""
      : project.image || "";
  }
  if (typeof projectDemoInput !== "undefined") {
    projectDemoInput.value = project.demo || "";
  }

  if (typeof techInputs !== "undefined") {
    techInputs.forEach((input, i) => {
      input.value = project.technologies[i] || "";
    });
  }

  if (typeof projectFormContainer !== "undefined") {
    projectFormContainer.style.display = "block";
  }
  if (typeof addProjectBtn !== "undefined") {
    addProjectBtn.textContent = "✏️ Update Project";
  }
}

// Restore last deleted project (single-use)
if (restoreProjectBtn) {
  restoreProjectBtn.addEventListener("click", () => {
    if (lastDeletedProject && !restoreUsed) {
      projects.push(lastDeletedProject);
      localStorage.setItem("projects", JSON.stringify(projects));
      renderProjects();
      lastDeletedProject = null;
      restoreUsed = true;
      restoreProjectBtn.style.display = "none";
      showToast("Project restored.");
    } else {
      showToast("Project has been permanently deleted and cannot be restored.");
    }
  });
}

// Clear all projects (move to recycle)
if (clearProjectsBtn) {
  clearProjectsBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all projects?")) {
      projects.forEach((p) => {
        deletedProjects.push({ ...p, id: p.id || Date.now() });
        logs.push({ title: p.title, time: new Date().toLocaleString() });
      });

      projects = [];
      lastDeletedProject = null;
      restoreUsed = false;

      localStorage.setItem("projects", JSON.stringify(projects));
      localStorage.setItem("deletedProjects", JSON.stringify(deletedProjects));
      localStorage.setItem("projectLogs", JSON.stringify(logs));

      renderProjects();
      renderRecycleBin();
      renderLogs();
      if (restoreProjectBtn) restoreProjectBtn.style.display = "none";
      showToast("All projects moved to recycle bin.");
    }
  });
}

// ==========================
// 6) Recycle Bin Rendering & Clear
// ==========================
function renderRecycleBin() {
  if (!recycleList) return;
  recycleList.innerHTML = "";
  recycleList.className = "recycle-list";

  if (deletedProjects.length === 0) {
    recycleList.innerHTML = "<p>No deleted projects.</p>";
    if (clearRecycleBtn) clearRecycleBtn.style.display = "none";
    return;
  } else {
    if (clearRecycleBtn) clearRecycleBtn.style.display = "inline-block";
  }

  deletedProjects.forEach((p) => {
    const div = document.createElement("div");
    div.className = "recycle-card";

    div.innerHTML = `
      <div class="deleted-card">
        ${p.image ? `<img src="${p.image}" alt="${p.title}" />` : ""}
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <div class="badges">
          ${p.technologies
            .map((tech) => `<span class="badge">${tech}</span>`)
            .join(" ")}
        </div>
      </div>
    `;
    recycleList.appendChild(div);
  });
}

if (clearRecycleBtn) {
  clearRecycleBtn.addEventListener("click", () => {
    if (
      confirm(
        "Are you sure you want to permanently delete all recycled projects?"
      )
    ) {
      deletedProjects = [];
      localStorage.setItem("deletedProjects", JSON.stringify(deletedProjects));
      renderRecycleBin();
      showToast("Recycle bin cleared.");
    }
  });
}

// ==========================
// 7) Logs Rendering
// ==========================
function renderLogs() {
  if (!logList) return;
  logList.innerHTML = "";
  logs.forEach((log) => {
    const li = document.createElement("li");
    li.textContent = `🕒 "${log.title}" was deleted at ${log.time}`;
    logList.appendChild(li);
  });
}

// ==========================
// 8) Add / Edit Project Form Handling & Save
// ==========================

// Form element selectors (these should exist in DOM)
const addProjectBtn = document.getElementById("add-project-btn");
const projectFormContainer = document.getElementById("project-form-container");
const projectForm = document.getElementById("project-form");
const projectTitleInput = document.getElementById("project-title");
const projectDescriptionInput = document.getElementById("project-description");
const projectImageInput = document.getElementById("project-image");
const projectImageURLInput = document.getElementById("project-image-url");
const projectDemoInput = document.getElementById("project-demo");
const techInputs = document.querySelectorAll(".tech-input");

// Toggle project form visibility
if (addProjectBtn) {
  addProjectBtn.addEventListener("click", () => {
    if (!projectFormContainer) return;
    projectFormContainer.style.display =
      projectFormContainer.style.display === "none" ? "block" : "none";
  });
}

// Form submit handler (add or update)
if (projectForm) {
  projectForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = projectTitleInput?.value.trim() || "";
    const description = projectDescriptionInput?.value.trim() || "";
    const demo = projectDemoInput?.value.trim() || "";
    const imageURL = projectImageURLInput?.value.trim() || "";
    const imageFile = projectImageInput?.files?.[0];

    const technologies = [...(techInputs || [])]
      .map((input) => input.value.trim())
      .filter(Boolean);

    if (!title || !description) {
      showToast("Please fill in the required fields.");
      return;
    }

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = function (ev) {
        const image = ev.target.result;
        saveProject(title, description, image, technologies, demo);
      };
      reader.readAsDataURL(imageFile);
    } else {
      const image = imageURL || null;
      saveProject(title, description, image, technologies, demo);
    }
  });
}

function saveProject(title, description, image, technologies, demo) {
  if (editIndex !== null) {
    // Update existing project
    projects[editIndex] = {
      ...projects[editIndex],
      title,
      description,
      image,
      technologies,
      demo,
    };
    editIndex = null;
    if (addProjectBtn) addProjectBtn.textContent = "➕ Add Project";
  } else {
    // Prevent duplicate project
    const isDuplicate = projects.some(
      (p) =>
        p.title === title &&
        p.description === description &&
        (p.image === image || !image)
    );
    if (isDuplicate) {
      showToast("This project already exists.");
      return;
    }

    // Add new project
    const project = {
      id: Date.now(),
      title,
      description,
      image,
      technologies,
      demo,
    };
    projects.push(project);
  }

  localStorage.setItem("projects", JSON.stringify(projects));
  renderProjects();
  if (projectForm) projectForm.reset();
  if (projectFormContainer) projectFormContainer.style.display = "none";
  if (restoreProjectBtn) restoreProjectBtn.style.display = "none";
  lastDeletedProject = null;
  restoreUsed = false;
  showToast("Project saved successfully.");
}

// ==========================
// 9) Clear Logs button
// ==========================
const clearLogsBtn = document.getElementById("clear-logs-btn");
if (clearLogsBtn) {
  clearLogsBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear the logs?")) {
      logs = [];
      localStorage.setItem("projectLogs", JSON.stringify(logs));
      renderLogs();
      showToast("Logs cleared.");
    }
  });
}

// ==========================
// 10) Export / Import Projects
// ==========================
const exportBtn = document.getElementById("export-projects-btn");
if (exportBtn) {
  exportBtn.addEventListener("click", () => {
    const dataStr = JSON.stringify(projects, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "projects-export.json";
    a.click();
    URL.revokeObjectURL(url);
  });
}

const importBtn = document.getElementById("import-projects-btn");
if (importBtn) {
  importBtn.addEventListener("click", () => {
    const importInput = document.getElementById("import-file-input");
    if (importInput) importInput.click();
  });
}

const importFileInput = document.getElementById("import-file-input");
if (importFileInput) {
  importFileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) throw new Error("Invalid format");

        imported.forEach((p) => {
          if (!projects.find((proj) => proj.id === p.id)) {
            projects.push({ ...p, id: generateId() }); // assign new ID
          }
        });

        localStorage.setItem("projects", JSON.stringify(projects));
        renderProjects();
        showToast("✅ Imported successfully!");
      } catch (err) {
        showToast("❌ Failed to import: " + err.message);
      }
    };

    reader.readAsText(file);
  });
}

// ==========================
// 11) Skills Management (Advanced version integrated with UI elements used earlier)
//    - storage helpers
//    - renderSkills() with color filter support
//    - addSkill(), delete with restore logic
// ==========================
function getSkillsFromStorage() {
  return JSON.parse(localStorage.getItem("skills")) || [];
}

function saveSkillsToStorage(skills) {
  localStorage.setItem("skills", JSON.stringify(skills));
}

function updateColorFilterOptions(skills) {
  const filterColor = document.getElementById("filter-color");
  if (!filterColor) return;
  const uniqueColors = [...new Set(skills.map((skill) => skill.color))];
  filterColor.innerHTML = `<option value="">🎨 Filter by color</option>`;
  uniqueColors.forEach((color) => {
    const option = document.createElement("option");
    option.value = color;
    option.textContent = color;
    option.style.color = color;
    filterColor.appendChild(option);
  });
}

function renderSkills() {
  const skillListElem = document.getElementById("skill-list");
  const searchInputElem = document.getElementById("search-input");
  const filterColorElem = document.getElementById("filter-color");
  if (!skillListElem || !searchInputElem || !filterColorElem) return;

  const searchInputValue = searchInputElem.value.toLowerCase();
  const selectedColor = filterColorElem.value;

  const skills = getSkillsFromStorage();

  const filteredSkills = skills.filter((skill) => {
    const matchName = skill.name.toLowerCase().includes(searchInputValue);
    const matchColor = selectedColor === "" || skill.color === selectedColor;
    return matchName && matchColor;
  });

  updateColorFilterOptions(skills);

  skillListElem.innerHTML = "";

  if (filteredSkills.length === 0) {
    skillListElem.innerHTML = `<p class="no-skills">No matching skills found.</p>`;
    return;
  }

  filteredSkills.forEach((skill, index) => {
    const skillCard = document.createElement("div");
    skillCard.className = "project-card";
    skillCard.innerHTML = `
      <i class="${skill.icon}" style="color:${skill.color}; font-size: 2rem;"></i>
      <h3>${skill.name}</h3>
      <button class="delete-skill-btn" data-index="${index}">🗑 Delete</button>
    `;
    skillListElem.appendChild(skillCard);
  });

  // Attach delete listeners for skills
  document.querySelectorAll(".delete-skill-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const confirmed = confirm(
        "⚠️ Are you sure you want to delete this skill?"
      );
      if (!confirmed) return;

      const index = this.dataset.index;
      const skills = getSkillsFromStorage();
      const deletedSkill = skills.splice(index, 1)[0];

      const prevDeleted =
        JSON.parse(localStorage.getItem("deletedSkills")) || [];
      const alreadyDeletedOnce = prevDeleted.some(
        (s) => s.name === deletedSkill.name && s.icon === deletedSkill.icon
      );

      if (alreadyDeletedOnce) {
        showToast("❌ Skill deleted permanently.");
        localStorage.removeItem("lastDeletedSkill");
      } else {
        showToast("⚠️ Skill deleted. You can restore it once.");
        localStorage.setItem("lastDeletedSkill", JSON.stringify(deletedSkill));
        prevDeleted.push(deletedSkill);
        localStorage.setItem("deletedSkills", JSON.stringify(prevDeleted));
      }

      saveSkillsToStorage(skills);
      renderSkills();
    });
  });
}

// Add skill handler (from skill form)
const skillForm = document.getElementById("skill-form");
if (skillForm) {
  skillForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const nameElem = document.getElementById("skill-name");
    const iconElem = document.getElementById("skill-icon");
    const colorElem = document.getElementById("skill-color");
    if (!nameElem || !iconElem || !colorElem) return;

    const name = nameElem.value.trim();
    const icon = iconElem.value.trim();
    const color = colorElem.value;

    if (!name || !icon) {
      showToast("⚠️ Please fill in both Name and Icon fields.");
      return;
    }

    const skills = getSkillsFromStorage();
    const duplicate = skills.some(
      (skill) =>
        skill.name.toLowerCase() === name.toLowerCase() || skill.icon === icon
    );

    if (duplicate) {
      showToast("❌ Skill with same name or icon already exists!");
      return;
    }

    const newSkill = { name, icon, color };
    skills.push(newSkill);
    saveSkillsToStorage(skills);

    // Reset form
    nameElem.value = "";
    iconElem.value = "";
    colorElem.value = "#00c8ff";
    showToast("✅ Skill added successfully.");
    renderSkills();
  });
}

// Search and filter bindings for skills
const skillSearchInput = document.getElementById("search-input");
const filterColorSelect = document.getElementById("filter-color");
if (skillSearchInput) skillSearchInput.addEventListener("input", renderSkills);
if (filterColorSelect)
  filterColorSelect.addEventListener("change", renderSkills);

// Clear all skills button
const clearSkillsBtn = document.getElementById("clear-skills-btn");
if (clearSkillsBtn) {
  clearSkillsBtn.addEventListener("click", () => {
    const confirmClear = confirm(
      "⚠️ Are you sure you want to clear all skills?"
    );
    if (!confirmClear) return;
    localStorage.removeItem("skills");
    showToast("🗑 All skills cleared.");
    renderSkills();
  });
}

// Restore last deleted skill button
const restoreSkillBtn = document.getElementById("restore-skill-btn");
if (restoreSkillBtn) {
  restoreSkillBtn.addEventListener("click", () => {
    const lastDeletedSkillJSON = localStorage.getItem("lastDeletedSkill");

    if (!lastDeletedSkillJSON) {
      showToast("⚠️ No skill to restore!");
      return;
    }

    const lastDeletedSkill = JSON.parse(lastDeletedSkillJSON);
    const skills = getSkillsFromStorage();

    const alreadyExists = skills.some(
      (skill) =>
        skill.name.toLowerCase() === lastDeletedSkill.name.toLowerCase() ||
        skill.icon === lastDeletedSkill.icon
    );

    if (alreadyExists) {
      showToast("⚠️ This skill is already restored!");
      localStorage.removeItem("lastDeletedSkill");
      return;
    }

    skills.push(lastDeletedSkill);
    saveSkillsToStorage(skills);
    localStorage.removeItem("lastDeletedSkill");
    showToast("✅ Skill restored successfully");
    renderSkills();
  });
}

// Initial render for skills
// (A call later in initialization will also run renderSkills to ensure UI is up-to-date)

// ==========================
// 12) Messages Management
//     - renderMessages(filter)
//     - deleteMessage(id)
//     - clearAllMessages()
//     - search message input binding
// ==========================
function renderMessages(filter = "") {
  const messageListElem = document.getElementById("message-list");
  if (!messageListElem) return;

  const search = filter.toLowerCase();
  const messages = JSON.parse(localStorage.getItem("messages")) || [];

  const filteredMessages = messages.filter(
    (msg) =>
      (msg.name || "").toLowerCase().includes(search) ||
      (msg.email || "").toLowerCase().includes(search)
  );

  messageListElem.innerHTML =
    filteredMessages.length === 0
      ? `<li style="text-align: center">No messages found.</li>`
      : "";

  filteredMessages.forEach((msg) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="msg-box">
        <strong>👤 ${msg.name}</strong><br/>
        <small>📧 ${msg.email}</small><br/>
        <small>📅 ${msg.date}</small>
        <p>💬 ${msg.message}</p>
        <button class="message-delet" onclick="deleteMessage(${msg.id})">🗑 Delete</button>
      </div>
    `;
    messageListElem.appendChild(li);
  });
}

// Delete message by id (used in generated button onclick)
function deleteMessage(id) {
  const messages = JSON.parse(localStorage.getItem("messages")) || [];
  const updated = messages.filter((msg) => msg.id !== id);
  localStorage.setItem("messages", JSON.stringify(updated));
  const searchMessageInput = document.getElementById("search-message");
  renderMessages(searchMessageInput ? searchMessageInput.value : "");
  showToast("🗑 Message deleted!");
}

// Clear all messages
function clearAllMessages() {
  localStorage.removeItem("messages");
  renderMessages();
  showToast("🧹 All messages cleared!");
}

// Bind message search input & clear button on DOMContentLoaded (another listener exists below)
document.addEventListener("DOMContentLoaded", () => {
  renderMessages();

  const searchInputElem = document.getElementById("search-message");
  if (searchInputElem) {
    searchInputElem.addEventListener("input", (e) => {
      renderMessages(e.target.value);
    });
  }

  const clearAllBtn = document.getElementById("clear-all-btn");
  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", () => {
      if (confirm("⚠️ Are you sure you want to delete all messages?")) {
        clearAllMessages();
      }
    });
  }
});

// ==========================
// 13) Logout
// ==========================
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    localStorage.setItem("isLoggedIn", "false");
    window.location.href = "/public/login.html";
  });
}

// ==========================
// 14) Final Initialization (render everything that relies on storage / state)
// ==========================
renderProjects();
renderRecycleBin();
renderLogs();
renderSkills();
renderMessages();
