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
