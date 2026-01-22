const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const SOURCE_DIR = "/Users/parkblo/Desktop/repo/parkblo.github.io/_posts";
const TARGET_DIR = path.join(__dirname, "../_posts");

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

const files = fs.readdirSync(SOURCE_DIR).filter((file) => file.endsWith(".md"));

files.forEach((file) => {
  const fullPath = path.join(SOURCE_DIR, file);
  const content = fs.readFileSync(fullPath, "utf8");
  const parsed = matter(content);

  const { data, content: body } = parsed;

  const newSlug = file.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
  const dateStr = file.match(/^\d{4}-\d{2}-\d{2}/)[0];

  // Convert categories array to single string
  let category = "Development";
  if (
    data.categories &&
    Array.isArray(data.categories) &&
    data.categories.length > 0
  ) {
    category = data.categories[0];
  } else if (typeof data.categories === "string") {
    category = data.categories;
  }

  const newFrontmatter = {
    title: data.title || newSlug,
    date: dateStr,
    description: data.description || "",
    category: category,
    icon: "pixelarticons-font-ship", // Default icon
  };

  const newContent = matter.stringify(body, newFrontmatter);

  // Use slug as filename for the new blog
  const targetFile = path.join(TARGET_DIR, `${newSlug}.mdx`);
  fs.writeFileSync(targetFile, newContent);
  console.log(`Migrated: ${file} -> ${newSlug}.mdx`);
});

console.log("Migration completed!");
