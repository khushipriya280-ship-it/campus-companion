import fs from "node:fs";
import path from "node:path";

const deployDir = path.resolve("dist/client");
const assetsDir = path.join(deployDir, "assets");

if (!fs.existsSync(assetsDir)) {
  console.error("Could not find assets directory:", assetsDir);
  process.exit(1);
}

const files = fs.readdirSync(assetsDir);
const mainJs = files.find((f) => /^index-.*\.js$/.test(f)) || files.find((f) => f.endsWith(".js"));
const mainCss = files.find((f) => /^styles-.*\.css$/.test(f)) || files.find((f) => f.endsWith(".css"));

console.log("Generating index.html & 404.html...");
console.log("Main JS:", mainJs);
console.log("Main CSS:", mainCss);

const tsrBootstrap = `<script>
      window.$_TSR = window.$_TSR || {
        h: function() { this.hydrated = true; if (this.c) this.c(); },
        e: function() { this.streamEnded = true; if (this.c) this.c(); },
        c: function() { if (this.hydrated && this.streamEnded) delete window.$_TSR; },
        p: function(s) { !this.initialized ? this.buffer.push(s) : s(); },
        buffer: [],
        initialized: false,
        router: { matches: [], manifest: {}, dehydratedData: {} }
      };
    </script>`;

const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Campus Buddy — Your Complete Student Life Manager</title>
    <meta name="description" content="Campus Buddy is the all-in-one student productivity app for assignments, attendance, exams, projects, internships and career prep." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" />
    ${tsrBootstrap}
    ${mainCss ? `<link rel="stylesheet" href="/assets/${mainCss}" />` : ""}
  </head>
  <body>
    <div id="root"></div>
    ${mainJs ? `<script type="module" async src="/assets/${mainJs}"></script>` : ""}
  </body>
</html>
`;

fs.writeFileSync(path.join(deployDir, "index.html"), htmlContent, "utf8");
fs.writeFileSync(path.join(deployDir, "404.html"), htmlContent, "utf8");

console.log("Successfully generated index.html and 404.html in dist/client");
