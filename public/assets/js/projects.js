const projectsGrid = document.querySelector(".projects-grid");
const projectsCountElem = document.getElementById("projects-count");

let projects = JSON.parse(localStorage.getItem("projects")) || [];

function renderProjects() {
  projectsGrid.innerHTML = "";

  // عرض عدد المشاريع
  projectsCountElem.textContent = `You have ${projects.length} project${
    projects.length !== 1 ? "s" : ""
  }.`;

  if (projects.length === 0) {
    projectsGrid.innerHTML = `<p style="font-size:18px;">No projects to display yet.</p>`;
    return;
  }

  projects.forEach((project) => {
    const projectCard = document.createElement("div");
    projectCard.classList.add("project-card");

    const techList =
      project.technologies && Array.isArray(project.technologies)
        ? `<ul class="tech-used">${project.technologies
            .map((tech) => `<li>${tech}</li>`)
            .join("")}</ul>`
        : "";

    const demoLink = project.demo
      ? `<a href="${project.demo}" target="_blank" class="project-btn">🔗 View Demo</a>`
      : "";

    const imageTag = project.image
      ? `<img src="${project.image}" alt="${project.title}" />`
      : "";

    projectCard.innerHTML = `
      ${imageTag}
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      ${techList}
      ${demoLink}
    `;

    projectsGrid.appendChild(projectCard);
  });
}

renderProjects();
