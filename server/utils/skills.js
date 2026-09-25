// Central skill/technology dictionary used by the deterministic AI mock.
// Extend freely. Keys are normalized (lowercase), values are canonical display names.
const SKILL_DICTIONARY = {
  java: "Java",
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  "c++": "C++",
  "c#": "C#",
  go: "Go",
  golang: "Go",
  rust: "Rust",
  php: "PHP",
  ruby: "Ruby",
  kotlin: "Kotlin",
  swift: "Swift",
  sql: "SQL",
  "html": "HTML",
  "html5": "HTML",
  "css": "CSS",
  "css3": "CSS",
  "html/css": "HTML/CSS",
  react: "React",
  "react.js": "React",
  reactjs: "React",
  angular: "Angular",
  vue: "Vue",
  "vue.js": "Vue",
  "next.js": "Next.js",
  nextjs: "Next.js",
  "node.js": "Node.js",
  nodejs: "Node.js",
  node: "Node.js",
  express: "Express",
  "express.js": "Express",
  django: "Django",
  flask: "Flask",
  spring: "Spring Boot",
  "spring boot": "Spring Boot",
  springboot: "Spring Boot",
  "rest": "REST APIs",
  "rest api": "REST APIs",
  "rest apis": "REST APIs",
  "restful": "REST APIs",
  graphql: "GraphQL",
  mongodb: "MongoDB",
  mongo: "MongoDB",
  postgresql: "PostgreSQL",
  postgres: "PostgreSQL",
  mysql: "MySQL",
  redis: "Redis",
  docker: "Docker",
  kubernetes: "Kubernetes",
  k8s: "Kubernetes",
  aws: "AWS",
  azure: "Azure",
  gcp: "GCP",
  "google cloud": "GCP",
  git: "Git/GitHub",
  github: "Git/GitHub",
  gitlab: "GitLab",
  "ci/cd": "CI/CD",
  jenkins: "Jenkins",
  linux: "Linux",
  dsa: "DSA",
  "data structures": "DSA",
  algorithms: "DSA",
  "machine learning": "Machine Learning",
  ml: "Machine Learning",
  "deep learning": "Deep Learning",
  tensorflow: "TensorFlow",
  pytorch: "PyTorch",
  pandas: "Pandas",
  numpy: "NumPy",
  tailwind: "Tailwind CSS",
  "tailwind css": "Tailwind CSS",
  bootstrap: "Bootstrap",
  redux: "Redux",
  "react native": "React Native",
  flutter: "Flutter",
  android: "Android",
  ios: "iOS",
  figma: "Figma",
  jira: "Jira",
  agile: "Agile",
  scrum: "Scrum",
  microservices: "Microservices",
  kafka: "Kafka",
  rabbitmq: "RabbitMQ",
  websockets: "WebSockets",
  "unit testing": "Unit Testing",
  jest: "Jest",
  cypress: "Cypress",
  selenium: "Selenium",
};

// Multi-word phrases checked first (longest match wins).
const PHRASES = Object.keys(SKILL_DICTIONARY)
  .filter((k) => k.includes(" ") || k.includes("/"))
  .sort((a, b) => b.length - a.length);

const SINGLES = Object.keys(SKILL_DICTIONARY).filter((k) => !k.includes(" "));

function extractSkills(text) {
  if (!text) return [];
  const lower = " " + String(text).toLowerCase().replace(/[\n\r]+/g, " ") + " ";
  const found = new Set();

  for (const phrase of PHRASES) {
    if (lower.includes(phrase)) found.add(SKILL_DICTIONARY[phrase]);
  }
  // Tokenize for single-word skills to avoid substring false positives (e.g. "go" in "google")
  const tokens = lower.split(/[^a-z0-9+#./]+/).filter(Boolean);
  const tokenSet = new Set(tokens);
  for (const single of SINGLES) {
    if (tokenSet.has(single)) found.add(SKILL_DICTIONARY[single]);
  }
  return Array.from(found);
}

module.exports = { SKILL_DICTIONARY, extractSkills };
