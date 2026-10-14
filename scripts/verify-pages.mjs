// Server rendering and navigation audit. No browser or live Supabase is used.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const modules = new Map();
let data;
let currentPath = "/";
function loadSource(file) {
 if (file === path.join(root, "src/lib/data.ts")) return { getPortfolio: async () => data };
 if (file === path.join(root, "src/app/admin/actions.ts")) return { logoutAction: () => { throw new Error("Server actions are not invoked by this audit"); } };
 if (modules.has(file)) return modules.get(file).exports;
 const module = { exports: {} }; modules.set(file, module);
 const compiled = ts.transpileModule(fs.readFileSync(file, "utf8"), { reportDiagnostics: true, compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
 const parseErrors = compiled.diagnostics?.filter(d => d.category === ts.DiagnosticCategory.Error) || [];
 if (parseErrors.length) throw new Error(file+": "+parseErrors.map(d => ts.flattenDiagnosticMessageText(d.messageText," ")).join("; "));
 const code = compiled.outputText;
 const localRequire = id => {
  if (id === "next/navigation") return {
   usePathname: () => currentPath, useRouter: () => ({ refresh() {} }),
   notFound: () => { const e = new Error("Not found"); e.status = 404; throw e; },
   redirect: uri => { const e = new Error("Redirect"); e.status = 307; e.location = uri; throw e; },
   permanentRedirect: uri => { const e = new Error("Permanent redirect"); e.status = 308; e.location = uri; throw e; },
  };
  if (id === "server-only") return {};
  if (id.startsWith("@/") || id.startsWith(".")) {
   const base = id.startsWith("@/") ? path.join(root,"src",id.slice(2)) : path.resolve(path.dirname(file),id);
   const target = [base,base+".tsx",base+".ts"].find(f => fs.existsSync(f) && fs.statSync(f).isFile());
   if (!target) throw Error("Missing source import: "+id);
   return loadSource(target);
  }
  return require(id);
 };
 new Function("require","module","exports",code)(localRequire,module,module.exports);
 return module.exports;
}
const { defaults }=loadSource(path.join(root,"src/lib/defaults.ts"));
const { publicProjects, portfolioProjects }=loadSource(path.join(root,"src/lib/public-projects.ts"));
assert.equal(publicProjects(defaults.projects).length,0,"Seeded samples leaked into public work");
// Synthetic published owner records exercise all real detail and collection routes.
const ownerProjects=defaults.projects.map((project,i)=>({...project,is_demo:false,slug:"work-"+project.slug.replace(/^demo-/,""),title:"Portfolio project "+(i+1),summary:"Published owner work",description:"The project brief and final delivery."}));
data={...defaults,projects:ownerProjects};
const { collections, collectionPath, serviceSlug, servicePath }=loadSource(path.join(root,"src/lib/collections.ts"));
const routes = [
 ...["/","/about","/skills","/services","/projects","/journey","/contact","/preview"].map(url=>({url,file:url==="/"?"src/app/page.tsx":"src/app"+url+"/page.tsx",params:{}})),
 ...collections.map(c=>({url:collectionPath(c.format),file:"src/app/projects/collections/[format]/page.tsx",params:{format:c.format}})),
 ...defaults.services.map(s=>({url:servicePath(s),file:"src/app/services/[slug]/page.tsx",params:{slug:serviceSlug(s)}})),
 ...ownerProjects.map(p=>({url:"/projects/"+p.slug,file:"src/app/projects/[slug]/page.tsx",params:{slug:p.slug}})),
];
const validPaths = new Set([...routes.map(r=>r.url),...defaults.projects.map(p=>"/projects/"+p.slug),"/admin","/admin/preview","/admin/login","/admin/forgot-password","/admin/reset-password"]);
let assetChecks=0, linkChecks=0;
for(const route of routes) {
 currentPath=route.url;
 const page=loadSource(path.join(root,route.file));
 const element=await page.default({params:Promise.resolve(route.params)});
 const html=renderToStaticMarkup(element);
 assert(html.includes("<h1"),route.url+" has no page heading");
 assert(html.includes('id="main"'),route.url+" has no main content landmark");
 for(const m of html.matchAll(/src="(\/assets\/[^"?]+)"/g)) { assert(fs.existsSync(path.join(root,"public",m[1])),route.url+" missing asset: "+m[1]); assetChecks++; }
 for(const m of html.matchAll(/href="(\/[^"]*)"/g)) { const href=m[1].split(/[?#]/)[0]||"/"; if(href.startsWith("/assets/")){assert(fs.existsSync(path.join(root,"public",href)));continue;} assert(validPaths.has(href),route.url+" broken internal page link: "+href); linkChecks++; }
 if(route.url!=="/admin/preview") {
  assert(html.includes('class="floating-menu"'),route.url+" lost the three-line menu");
  assert(!html.includes('class="site-header"') && !html.includes('class="header-contact"'),route.url+" still renders the removed navbar strip");
 }
 if(route.url==="/" || route.url==="/skills") {
  const text=html.replaceAll("&amp;","&");
  const cvSkills=["AI Content & Creative Ads","AI-Powered Ads & Content Creation","Logo Design & Brand Identity","Social Media Management & Marketing","SEO & Digital Marketing","Web & AI Website Development","Frontend & Backend Development","Next.js","React","UI/UX Design","Graphic Design & Branding","Adobe Photoshop","Adobe Illustrator","Figma Design","Next.js & React Development","Adobe Photoshop & Illustrator"];
  for(const skill of cvSkills) assert(text.includes(skill),route.url+" missing CV skill: "+skill);
  const inventory=text.match(/<section[^>]*class="[^"]*skill-inventory[^"]*"[\s\S]*?<\/section>/)?.[0];
  assert(inventory,route.url+" has no full skill inventory");
  for(const label of ["AI Content & Creative Ads","Social Media Management & Marketing","AI-Powered Ads & Content Creation","Logo Design & Brand Identity","SEO & Digital Marketing","Web & AI Website Development","Frontend & Backend Development","Next.js & React Development","UI/UX Design","Graphic Design & Branding","Adobe Photoshop & Illustrator","Figma Design"]) assert(inventory.includes(label),"Missing exact CV inventory entry: "+label);

  for(const role of ["AI Content Creator","Performance Marketer","Web & App Developer"]) assert(text.includes(role),route.url+" lost role: "+role);
 }
 if(route.url==="/contact") {
  assert(html.includes('href="mailto:muhiudinali215@gmail.com"'));
  assert(html.includes('href="tel:+923014772404"'));
  const platformRow=html.match(/<nav class="contact-static-platforms"[\s\S]*?<\/nav>/)?.[0];
  assert(platformRow,"Contact has no touch platform navigation");
  for(const name of ["email","phone","linkedin","instagram","tiktok","x","github"]) assert(platformRow.includes("/assets/contact-logos/"+name+".svg"),"Missing contact mark: "+name);
  for(const src of platformRow.matchAll(/src="([^"]+)"/g)) assert(src[1].startsWith("/assets/contact-logos/"),"Project image appears in contact platform row");
 }
 assert.equal(html.includes('data-animation="projects-showcase"'),route.url==="/projects",route.url+" has the Projects Showcase outside its approved page");
 if(route.url.startsWith("/projects/collections/") || route.url==="/skills") assert(html.includes('data-animation="expand-on-hover"'),route.url+" is missing the collection gallery");
 if(route.url==="/skills") { assert(html.includes('id="video-ads"')); assert(html.includes('href="/skills#video-ads"')); }
 assert(!html.includes('class="collection-grid"'),route.url+" still contains the removed collection card grid");
 if(route.url!=="/preview") assert(!html.includes("SAMPLE COLLECTIONS") && !html.includes("SAMPLE PROJECT") && !html.includes(" · SAMPLE"),route.url+" shows sample/developer labels");
 if(route.url==="/" || route.url==="/projects") {
  assert(html.includes('class="project-collection-nav '));
  for(const collection of collections) assert(html.includes('href="'+collectionPath(collection.format)+'"'),"Missing integrated collection link");
 }
 if(route.url==="/") {
  const groups=[...html.matchAll(/<div class="ribbon-group">([\s\S]*?)<\/div>/g)];
  assert.equal(groups.length,2);assert.equal(groups[0][1],groups[1][1],"Marquee copies differ and cannot loop seamlessly");
  assert.equal((html.match(/class="loader-half /g)||[]).length,16,"Starting stair animation is missing");
  assert.equal((html.match(/class="orbit-particle"/g)||[]).length,2,"Portrait axis nodes are missing");
 }
}
// Sample mode can be disabled. Empty owner-only views never expose database samples.
data={...defaults,projects:[]};
for(const route of routes.filter(route=>["/","/projects"].includes(route.url) || route.url.startsWith("/projects/collections/"))) {
 currentPath=route.url;
 const html=renderToStaticMarkup(await loadSource(path.join(root,route.file)).default({params:Promise.resolve(route.params)}));
 for(const project of defaults.projects) assert(!html.includes(project.title),"Hardcoded sample appears on "+route.url);
 assert(html.includes("empty-projects"));
}
for(const project of defaults.projects) await assert.rejects(()=>loadSource(path.join(root,"src/app/projects/[slug]/page.tsx")).default({params:Promise.resolve({slug:project.slug})}),e=>e.status===404);
// Requested local examples render across pages and their direct detail URLs.
data={...defaults,projects:portfolioProjects([],defaults.projects,true)};
const sampleRoutes=[...routes.filter(route=>["/","/projects","/skills"].includes(route.url)||route.url.startsWith("/projects/collections/")),...defaults.projects.map(project=>({url:"/projects/"+project.slug,file:"src/app/projects/[slug]/page.tsx",params:{slug:project.slug}}))];
for(const route of sampleRoutes) {
 currentPath=route.url;
 const html=renderToStaticMarkup(await loadSource(path.join(root,route.file)).default({params:Promise.resolve(route.params)}));
 assert(html.includes("SAMPLE"),route.url+" is not labelling the example work");
 assert.equal(html.includes('data-animation="projects-showcase"'),route.url==="/projects",route.url+" repeats the showcase outside /projects");
 if(route.url==="/skills"||route.url==="/projects/collections/video-ads") {
  for(const project of defaults.projects.filter(project=>project.format==="video-ads")) for(const media of project.media) assert(html.includes(media.poster_url),route.url+" is missing a video poster");
 }
 for(const src of html.matchAll(/src="(\/assets\/[^"?]+)"/g))assert(fs.existsSync(path.join(root,"public",src[1])),"Missing sample asset "+src[1]);
 for(const link of html.matchAll(/href="(\/[^"]*)"/g)){ const target=link[1].split(/[?#]/)[0]||"/"; if(target.startsWith("/assets/")){assert(fs.existsSync(path.join(root,"public",target)));continue;} assert(validPaths.has(target),"Broken sample link "+link[1]); }
}
data={...defaults,projects:ownerProjects};

for(const project of defaults.projects) {
 for(const media of project.media) {
  assert(fs.existsSync(path.join(root,"public",media.url)));
  if(media.kind==="video") assert(media.poster_url && fs.existsSync(path.join(root,"public",media.poster_url)));
 }
}
const { RecordForm }=loadSource(path.join(root,"src/components/admin/record-form.tsx"));
for(const [resource,row] of [["profile",defaults.profile],["skills",defaults.skills[0]],["services",defaults.services[0]],["socials",defaults.socials[0]],["experience",defaults.experience[0]],["education",defaults.education[0]],["projects",defaults.projects[0]],["media",defaults.projects[0].media[0]]]) {
 const html=renderToStaticMarkup(React.createElement(RecordForm,{resource,row,projects:defaults.projects,onSaved(){}}));
 assert(html.includes("Save changes"),resource+" has no save action");assert(!html.includes("<fieldset disabled"),resource+" editor is a disabled preview");
}

const form=renderToStaticMarkup(React.createElement(RecordForm,{resource:"projects",row:defaults.projects[0],projects:defaults.projects,onSaved(){}}));
assert(form.includes("Save changes"));assert(!form.includes("<fieldset disabled"));assert(form.includes("Collection page"));assert(form.includes("Sample project"));
for(const [file,params] of [["src/app/services/[slug]/page.tsx",{slug:"missing-service"}],["src/app/projects/[slug]/page.tsx",{slug:"missing-project"}],["src/app/projects/collections/[format]/page.tsx",{format:"missing-format"}]]) {
 await assert.rejects(()=>loadSource(path.join(root,file)).default({params:Promise.resolve(params)}),e=>e.status===404);
}
assert.throws(()=>loadSource(path.join(root,"src/app/expertise/page.tsx")).default(),e=>e.status===308 && e.location==="/skills");
assert.throws(()=>loadSource(path.join(root,"src/app/admin/preview/page.tsx")).default(),e=>e.status===307 && e.location==="/admin");
const { navigation }=loadSource(path.join(root,"src/components/navbar.tsx"));
assert(navigation.some(([label,url])=>label==="Skills" && url==="/skills"));
assert(!navigation.some(([label,url])=>label==="Expertise" || url==="/expertise"));
console.log("PASS "+routes.length+" rendered pages, "+linkChecks+" internal links, "+assetChecks+" asset references, full CV skills, preserved roles, hamburger-only navigation, contact marks, /expertise redirect, integrated collection controls, retained starting stairs, identical ribbon copies, two orbit nodes, six empty public states, owner-only empty states, 13 rendered sample-mode pages, Projects-only showcase, Skills/collection galleries, all media paths and enabled real admin forms.");
console.log("This is server-rendering verification; browser motion and hosted Supabase integration still need live review.");
