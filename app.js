const fileInput = document.getElementById("file-input");
const dropZone = document.querySelector(".uploader__drop");
const status = document.getElementById("status");
const preview = document.getElementById("preview");
const error = document.getElementById("error");
const emptyState = document.getElementById("empty-state");

const tagClassMap = {
  placename: "place",
  persname: "person",
  orgname: "organization",
  term: "term",
  note: "noteref",
  ref: "noteref",
  graphic: "tei-graphic",
  pb: "pagebreak",
  head: "tei-head",
  p: "tei-p",
  quote: "tei-quote",
  list: "tei-list",
  item: "tei-item",
};

const blockTags = new Set([
  "div",
  "p",
  "head",
  "quote",
  "list",
  "item",
  "table",
  "row",
  "cell",
  "lg",
  "l",
  "ab",
]);

const listTags = new Set(["list", "item"]);

function updateStatus(message) {
  status.textContent = message;
}

function resetMessages() {
  error.textContent = "";
  updateStatus("");
}

function renderNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    if (!node.textContent || !node.textContent.trim()) {
      return null;
    }
    return document.createTextNode(node.textContent);
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const tagName = node.tagName.toLowerCase();
  if (tagName === "lb") {
    return document.createElement("br");
  }

  if (tagName === "pb") {
    const span = document.createElement("span");
    span.className = tagClassMap[tagName];
    span.textContent = "";
    return span;
  }

  let elementTag = "span";
  if (tagName === "p") {
    elementTag = "p";
  } else if (tagName === "head") {
    elementTag = "h2";
  } else if (tagName === "list") {
    elementTag = "ul";
  } else if (tagName === "item") {
    elementTag = "li";
  } else if (tagName === "quote") {
    elementTag = "blockquote";
  } else if (tagName === "table") {
    elementTag = "table";
  } else if (tagName === "row") {
    elementTag = "tr";
  } else if (tagName === "cell") {
    const role = (node.getAttribute("role") || "").toLowerCase();
    elementTag = role === "label" || role === "head" ? "th" : "td";
  } else if (tagName === "graphic") {
    elementTag = "img";
  } else if (tagName === "ref") {
    elementTag = node.getAttribute("target") ? "a" : "span";
  } else if (tagName === "note") {
    elementTag = "sup";
  } else if (blockTags.has(tagName)) {
    elementTag = "div";
  }

  const el = document.createElement(elementTag);

  const mappedClass = tagClassMap[tagName];
  if (mappedClass) {
    el.classList.add(mappedClass);
  }

  if (tagName === "ref" && node.getAttribute("target")) {
    el.setAttribute("href", node.getAttribute("target"));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noreferrer");
  }

  if (tagName === "graphic") {
    const url = node.getAttribute("url") || node.getAttribute("target");
    if (url) {
      el.setAttribute("src", url);
    }
    el.setAttribute("alt", node.getAttribute("n") || "Abbildung");
  }

  const children = Array.from(node.childNodes)
    .map(renderNode)
    .filter(Boolean);

  if (elementTag === "img") {
    return el;
  }

  if (tagName === "table") {
    el.classList.add("table", "table-bordered", "table-striped");
  }

  if (tagName === "cell" && el.tagName.toLowerCase() === "th") {
    el.classList.add("table-head");
  }

  if (listTags.has(tagName)) {
    el.classList.add(tagName === "list" ? "tei-list" : "tei-item");
  }

  children.forEach((child) => el.appendChild(child));
  return el;
}

function renderDocument(xmlDoc) {
  preview.innerHTML = "";

  const root = xmlDoc.documentElement;
  if (!root) {
    emptyState.style.display = "flex";
    return;
  }

  const rendered = renderNode(root);
  if (rendered) {
    preview.appendChild(rendered);
    emptyState.style.display = "none";
  } else {
    emptyState.style.display = "flex";
  }
}

function parseXml(text) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, "application/xml");
  const parseError = xmlDoc.querySelector("parsererror");
  if (parseError) {
    throw new Error("Ungültiges XML. Bitte prüfe die Datei.");
  }
  return xmlDoc;
}

function handleXmlText(text, filename = "") {
  resetMessages();
  try {
    const xmlDoc = parseXml(text);
    renderDocument(xmlDoc);
    updateStatus(filename ? `Geladen: ${filename}` : "XML geladen.");
  } catch (err) {
    preview.innerHTML = "";
    emptyState.style.display = "flex";
    error.textContent = err.message;
  }
}

function handleFile(file) {
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    handleXmlText(reader.result, file.name);
  };
  reader.onerror = () => {
    error.textContent = "Die Datei konnte nicht gelesen werden.";
  };
  reader.readAsText(file);
}

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  handleFile(file);
});

dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.classList.add("is-dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("is-dragover");
});

dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.classList.remove("is-dragover");
  const file = event.dataTransfer.files[0];
  handleFile(file);
});
