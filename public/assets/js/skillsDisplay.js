document.addEventListener("DOMContentLoaded", () => {
  const skillsContainer = document.getElementById("skills-container");
  const skills = JSON.parse(localStorage.getItem("skills")) || [];

  // نعرض أول 4 مهارات فقط
  const topSkills = skills.slice(0, 4);

  if (topSkills.length === 0) {
    skillsContainer.innerHTML = `
    <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
      font-weight: bold;
      font-size: 20px;
      text-align: center;
    ">
      No skills added yet.
    </div>
  `;
    return;
  }

  topSkills.forEach((skill) => {
    const skillCard = document.createElement("div");
    skillCard.className = "skill-card";

    skillCard.innerHTML = `
      <i class="${skill.icon}" style="color: ${skill.color}; font-size: 3rem;"></i>
      <h3>${skill.name}</h3>
    `;

    skillsContainer.appendChild(skillCard);
  });
});
