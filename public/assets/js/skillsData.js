const skills = [
  {
    name: "HTML",
    icon: "fab fa-html5",
    color: "#e34c26",
    description:
      "HTML (HyperText Markup Language) is the standard language for creating web pages.",
    code: `&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;My Page&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Hello World&lt;/h1&gt;
  &lt;/body&gt;
&lt;/html&gt;`,
  },
  {
    name: "CSS",
    icon: "fab fa-css3-alt",
    color: "#264de4",
    description:
      "CSS (Cascading Style Sheets) is used to style and layout web pages.",
    code: `body {
  background-color: #f0f0f0;
  color: #333;
  font-family: Arial, sans-serif;
}`,
  },
  {
    name: "JavaScript",
    icon: "fab fa-js",
    color: "#f7df1e",
    description:
      "JavaScript is a versatile scripting language primarily used for web development. It allows developers to create interactive elements on web pages.",
    code: `const greeting = "Hello, world!";
console.log(greeting);`,
  },
  {
    name: "React",
    icon: "fab fa-react",
    color: "#61dafb",
    description:
      "React is a JavaScript library for building user interfaces. Developed by Facebook, it's used to create fast and interactive single-page applications using components.",
    code: `
import React from 'react';

function App() {
  return <h1>Hello, React!</h1>;
}

export default App;`,
  },
  {
    name: "Git",
    icon: "fab fa-git-alt",
    color: "#f34f29",
    description:
      "Git is a distributed version control system used to track changes in source code during software development. It allows teams to collaborate, manage code history, and work on multiple features in parallel.",
    code: `
git init
git add .
git commit -m "Initial commit"
git branch feature
git checkout feature`,
  },
  {
    name: "npm",
    icon: "fab fa-npm",
    color: "#cb3837",
    description:
      "npm (Node Package Manager) is the default package manager for Node.js. It helps developers install, share, and manage dependencies in JavaScript projects.",
    code: `
npm init -y
npm install react
npm install --save-dev eslint
npm run build
npm start`,
  },
  {
    name: "Word",
    icon: "fas fa-file-word",
    color: "#2B579A",
    description:
      "Microsoft Word is a word processing application used to create, edit, and format text-based documents such as letters, reports, and resumes.",
    code: `No code available for Word.`,
  },
  {
    name: "Excel",
    icon: "fas fa-file-excel",
    color: "#217346",
    description:
      "Microsoft Excel is a spreadsheet application used to organize, analyze, and visualize data using formulas, charts, and pivot tables.",
    code: `
=SUM(A1:A5)
=IF(A1>100, "Yes", "No")
=VLOOKUP(42, A2:B10, 2, FALSE)
=AVERAGE(B1:B10)
=COUNTIF(A1:A10, ">50")`,
  },
];
