document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("skillsContainer");

  skills.forEach((skill) => {
    const skillBox = document.createElement("article");
    skillBox.className = "skill-article";
    skillBox.style.borderColor = skill.color;

    skillBox.innerHTML = `
      <i class="${skill.icon}" style="color: ${skill.color}"></i>
      <h2>${skill.name}</h2>
      <p>${skill.description}</p>
      <pre><code class="language-${skill.name.toLowerCase()}">${
      skill.code
    }</code></pre>
    `;

    skillBox.id = skill.name;
    container.appendChild(skillBox);
  });

  Prism.highlightAll();
});
