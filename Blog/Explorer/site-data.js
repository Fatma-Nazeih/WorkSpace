/*
  FATMA'S KNOWLEDGE SPACE — site data
  ------------------------------------
  Edit this file to add/remove categories or notes.
  Every page on the site reads this same file to build the
  sidebar explorer and the search index, so you only ever
  maintain navigation in ONE place.

  "root" is used to compute relative links correctly depending
  on how deep the current page is nested. Pass it when you
  call renderExplorer()/renderSearch() from each page.
*/

const SITE = {
  title: "Fatma's Knowledge Space",
  tagline: "Notes, write-ups & tooling from the offensive security trenches.",

  explorer: [
    {
      type: "folder",
      name: "cloud-security",
      label: "cloud security",
      pages: [
        { title: "index", label: "index", url: "cloud-security/index.html" },
        { title: "AWS IAM Privilege Escalation Paths", label: "aws-iam-privesc-paths", url: "cloud-security/aws-iam-privilege-escalation.html" },
      ],
    },
    {
      type: "folder",
      name: "web-security",
      label: "web security",
      pages: [
        { title: "index", label: "index", url: "web-security/index.html" },
        { title: "IDOR Hunting Methodology", label: "idor-hunting-methodology", url: "web-security/idor-hunting-methodology.html" },
      ],
    },
    {
      type: "folder",
      name: "writeups",
      label: "writeups",
      pages: [
        { title: "index", label: "index", url: "writeups/index.html" },
        { title: "HTB — Forest", label: "htb-forest", url: "writeups/htb-forest.html" },
      ],
    },
    {
      type: "folder",
      name: "resources-and-tools",
      label: "resources and tools",
      pages: [
        { title: "index", label: "index", url: "resources-and-tools/index.html" },
        { title: "Recon Toolkit", label: "recon-toolkit", url: "resources-and-tools/recon-toolkit.html" },
      ],
    },
    {
      type: "folder",
      name: "active-directory",
      label: "active directory",
      pages: [
        { title: "index", label: "index", url: "active-directory/index.html" },
        { title: "Kerberoasting Explained", label: "kerberoasting-explained", url: "active-directory/kerberoasting-explained.html" },
      ],
    },
  ],
};

// Flatten explorer into a single searchable list: {title, url, category}
function buildSearchIndex() {
  const index = [];
  SITE.explorer.forEach((folder) => {
    folder.pages.forEach((page) => {
      if (page.label === "index") return; // skip bare folder landing pages in search
      index.push({ title: page.title, url: page.url, category: folder.label });
    });
  });
  return index;
}

/**
 * Renders the sidebar explorer tree into #explorer.
 * @param {string} root - relative path prefix to site root, e.g. "" at root, "../" inside a folder
 * @param {string} currentUrl - the url (relative to root) of the page currently open, for highlighting
 */
function renderExplorer(root, currentUrl) {
  const mount = document.getElementById("explorer");
  if (!mount) return;

  let html = "";
  SITE.explorer.forEach((folder, fi) => {
    const isLastFolder = fi === SITE.explorer.length - 1;
    const folderBranch = isLastFolder ? "└─" : "├─";
    const folderIndexUrl = folder.pages.find((p) => p.label === "index").url;
    const folderOpen = currentUrl && currentUrl.startsWith(folder.name + "/");

    html += `<div class="tree-folder ${folderOpen ? "open" : ""}">`;
    html += `<div class="tree-row tree-folder-row" data-target="folder-${folder.name}">`;
    html += `<span class="branch">${folderBranch}</span>`;
    html += `<span class="caret">▸</span>`;
    html += `<a class="tree-link folder-link" href="${root}${folderIndexUrl}">${folder.label}/</a>`;
    html += `</div>`;

    html += `<div class="tree-children" id="folder-${folder.name}">`;
    const childPages = folder.pages.filter((p) => p.label !== "index");
    childPages.forEach((page, pi) => {
      const isLastChild = pi === childPages.length - 1;
      const childBranch = isLastChild ? "└─" : "├─";
      const active = currentUrl === page.url ? "active" : "";
      html += `<div class="tree-row tree-page-row">`;
      html += `<span class="branch nested">${childBranch}</span>`;
      html += `<a class="tree-link ${active}" href="${root}${page.url}">${page.label}.md</a>`;
      html += `</div>`;
    });
    html += `</div></div>`;
  });

  mount.innerHTML = html;

  // toggle folders
  mount.querySelectorAll(".tree-folder-row").forEach((row) => {
    row.addEventListener("click", (e) => {
      if (e.target.tagName === "A") return; // let link navigate
      e.preventDefault();
      row.parentElement.classList.toggle("open");
    });
  });
}

/**
 * Wires up the search box (#search-input) with a results dropdown (#search-results).
 * @param {string} root - relative path prefix to site root
 */
function renderSearch(root) {
  const input = document.getElementById("search-input");
  const results = document.getElementById("search-results");
  if (!input || !results) return;

  const index = buildSearchIndex();

  function doSearch() {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      results.innerHTML = "";
      results.classList.remove("open");
      return;
    }
    const matches = index.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );

    if (matches.length === 0) {
      results.innerHTML = `<div class="search-empty">no matches found</div>`;
    } else {
      results.innerHTML = matches
        .map(
          (m) =>
            `<a class="search-result" href="${root}${m.url}">
               <span class="sr-title">${m.title}</span>
               <span class="sr-cat">${m.category}</span>
             </a>`
        )
        .join("");
    }
    results.classList.add("open");
  }

  input.addEventListener("input", doSearch);
  input.addEventListener("focus", doSearch);
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-wrap")) {
      results.classList.remove("open");
    }
  });
}
