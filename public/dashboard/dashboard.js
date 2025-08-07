window.addEventListener("DOMContentLoaded", function () {
  const loggedInUser = JSON.parse(localStorage.getItem("currentUser"));
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (!loggedInUser || isLoggedIn !== "true") {
    window.location.href = "/public/login.html";
  }

  // ✅ عرض اسم المستخدم داخل الداشبورد
  const usernameElement = document.getElementById("dashboard-username");
  if (usernameElement && loggedInUser) {
    usernameElement.textContent =
      loggedInUser.username || loggedInUser.name || loggedInUser.email;
  }
});

// ==== Selectors & Storage Setup ====

const sidebarItems = document.querySelectorAll(".sidebar ul li");
const sections = document.querySelectorAll(".section");

const projectList = document.getElementById("project-list");
const clearProjectsBtn = document.getElementById("clear-projects-btn");
const restoreProjectBtn = document.getElementById("restore-project-btn");

const recycleList = document.getElementById("recycle-list");
const logList = document.getElementById("log-list");
const clearRecycleBtn = document.getElementById("clear-recycle-btn");
const searchInput = document.getElementById("searchInput");

let projects = JSON.parse(localStorage.getItem("projects")) || [];
let deletedProjects = JSON.parse(localStorage.getItem("deletedProjects")) || [];
let logs = JSON.parse(localStorage.getItem("projectLogs")) || [];

let lastDeletedProject = null;
let restoreUsed = false;
let editIndex = null;

// ==== Toast ====
function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// ==== UI Navigation ====

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

// ==== Project Rendering ====

function renderProjects(filterTerm = "") {
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

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      deleteProject(index);
    });
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      startEditProject(index);
    });
  });
}

searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  renderProjects(term);
});

function deleteProject(index) {
  const deleted = { ...projects[index], id: projects[index].id || Date.now() };

  if (!restoreUsed) {
    lastDeletedProject = deleted;
    restoreProjectBtn.style.display = "inline-block";
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

function startEditProject(index) {
  const project = projects[index];
  editIndex = index;

  projectTitleInput.value = project.title;
  projectDescriptionInput.value = project.description;
  projectImageURLInput.value = project.image?.startsWith("data:")
    ? ""
    : project.image || "";
  projectDemoInput.value = project.demo || "";

  techInputs.forEach((input, i) => {
    input.value = project.technologies[i] || "";
  });

  projectFormContainer.style.display = "block";
  addProjectBtn.textContent = "✏️ Update Project";
}

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
    restoreProjectBtn.style.display = "none";
    showToast("All projects moved to recycle bin.");
  }
});

// ==== Recycle Bin ====

function renderRecycleBin() {
  recycleList.innerHTML = "";
  recycleList.className = "recycle-list";

  if (deletedProjects.length === 0) {
    recycleList.innerHTML = "<p>No deleted projects.</p>";
    clearRecycleBtn.style.display = "none";
    return;
  } else {
    clearRecycleBtn.style.display = "inline-block";
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

// ==== Logs ====

function renderLogs() {
  logList.innerHTML = "";
  logs.forEach((log) => {
    const li = document.createElement("li");
    li.textContent = `🕒 "${log.title}" was deleted at ${log.time}`;
    logList.appendChild(li);
  });
}

// ==== Add / Edit Project ====

const addProjectBtn = document.getElementById("add-project-btn");
const projectFormContainer = document.getElementById("project-form-container");
const projectForm = document.getElementById("project-form");
const projectTitleInput = document.getElementById("project-title");
const projectDescriptionInput = document.getElementById("project-description");
const projectImageInput = document.getElementById("project-image");
const projectImageURLInput = document.getElementById("project-image-url");
const projectDemoInput = document.getElementById("project-demo");
const techInputs = document.querySelectorAll(".tech-input");
// ==== Selectors ====

addProjectBtn.addEventListener("click", () => {
  projectFormContainer.style.display =
    projectFormContainer.style.display === "none" ? "block" : "none";
});

projectForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = projectTitleInput.value.trim();
  const description = projectDescriptionInput.value.trim();
  const demo = projectDemoInput.value.trim();
  const imageURL = projectImageURLInput.value.trim();
  const imageFile = projectImageInput.files[0];

  const technologies = [...techInputs]
    .map((input) => input.value.trim())
    .filter(Boolean);

  if (!title || !description) {
    showToast("Please fill in the required fields.");
    return;
  }

  if (imageFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const image = e.target.result;
      saveProject(title, description, image, technologies, demo);
    };
    reader.readAsDataURL(imageFile);
  } else {
    const image = imageURL || null;
    saveProject(title, description, image, technologies, demo);
  }
});

function saveProject(title, description, image, technologies, demo) {
  if (editIndex !== null) {
    projects[editIndex] = {
      ...projects[editIndex],
      title,
      description,
      image,
      technologies,
      demo,
    };
    editIndex = null;
    addProjectBtn.textContent = "➕ Add Project";
  } else {
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
  projectForm.reset();
  projectFormContainer.style.display = "none";
  restoreProjectBtn.style.display = "none";
  lastDeletedProject = null;
  restoreUsed = false;
  showToast("Project saved successfully.");
}
const clearLogsBtn = document.getElementById("clear-logs-btn");

clearLogsBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear the logs?")) {
    logs = [];
    localStorage.setItem("projectLogs", JSON.stringify(logs));
    renderLogs();
    showToast("Logs cleared.");
  }
});
// Export Projects
document.getElementById("export-projects-btn").addEventListener("click", () => {
  const dataStr = JSON.stringify(projects, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "projects-export.json";
  a.click();
  URL.revokeObjectURL(url);
});

// Import Projects
document.getElementById("import-projects-btn").addEventListener("click", () => {
  document.getElementById("import-file-input").click();
});

document
  .getElementById("import-file-input")
  .addEventListener("change", (event) => {
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

// ==== Initial Load ====

renderProjects();
renderRecycleBin();
renderLogs();
function getSkillsFromStorage() {
  return JSON.parse(localStorage.getItem("skills")) || [];
}

function saveSkillsToStorage(skills) {
  localStorage.setItem("skills", JSON.stringify(skills));
}

function updateColorFilterOptions(skills) {
  const filterColor = document.getElementById("filter-color");
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
  const skillList = document.getElementById("skill-list");
  const searchInput = document
    .getElementById("search-input")
    .value.toLowerCase();
  const selectedColor = document.getElementById("filter-color").value;

  const skills = getSkillsFromStorage();

  const filteredSkills = skills.filter((skill) => {
    const matchName = skill.name.toLowerCase().includes(searchInput);
    const matchColor = selectedColor === "" || skill.color === selectedColor;
    return matchName && matchColor;
  });

  updateColorFilterOptions(skills);

  skillList.innerHTML = "";

  if (filteredSkills.length === 0) {
    skillList.innerHTML = `<p class="no-skills">No matching skills found.</p>`;
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
    skillList.appendChild(skillCard);
  });

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

function addSkill(skill) {
  const skills = getSkillsFromStorage();
  skills.push(skill);
  saveSkillsToStorage(skills);
  renderSkills();
}

document.getElementById("skill-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("skill-name").value.trim();
  const icon = document.getElementById("skill-icon").value.trim();
  const color = document.getElementById("skill-color").value;

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
  addSkill(newSkill);

  // Reset form
  document.getElementById("skill-name").value = "";
  document.getElementById("skill-icon").value = "";
  document.getElementById("skill-color").value = "#00c8ff";
  showToast("✅ Skill added successfully.");
});

document.getElementById("search-input").addEventListener("input", renderSkills);
document
  .getElementById("filter-color")
  .addEventListener("change", renderSkills);

document.getElementById("clear-skills-btn").addEventListener("click", () => {
  const confirmClear = confirm("⚠️ Are you sure you want to clear all skills?");
  if (!confirmClear) return;
  localStorage.removeItem("skills");
  showToast("🗑 All skills cleared.");
  renderSkills();
});

document.getElementById("restore-skill-btn").addEventListener("click", () => {
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

// ✅ Initial Render
renderSkills();

function renderMessages(filter = "") {
  const messageList = document.getElementById("message-list");
  const search = filter.toLowerCase();
  const messages = JSON.parse(localStorage.getItem("messages")) || [];

  const filteredMessages = messages.filter(
    (msg) =>
      msg.name.toLowerCase().includes(search) ||
      msg.email.toLowerCase().includes(search)
  );

  messageList.innerHTML =
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
    messageList.appendChild(li);
  });
}

function deleteMessage(id) {
  const messages = JSON.parse(localStorage.getItem("messages")) || [];
  const updated = messages.filter((msg) => msg.id !== id);
  localStorage.setItem("messages", JSON.stringify(updated));
  renderMessages(document.getElementById("search-message").value);
  showToast("🗑 Message deleted!");
}

function clearAllMessages() {
  localStorage.removeItem("messages");
  renderMessages();
  showToast("🧹 All messages cleared!");
}

document.addEventListener("DOMContentLoaded", () => {
  renderMessages();

  const searchInput = document.getElementById("search-message");
  searchInput.addEventListener("input", (e) => {
    renderMessages(e.target.value);
  });

  const clearAllBtn = document.getElementById("clear-all-btn");
  clearAllBtn.addEventListener("click", () => {
    if (confirm("⚠️ Are you sure you want to delete all messages?")) {
      clearAllMessages();
    }
  });
});
