import { generateId } from "./storage/storageManager.js";
import * as topicService from "./services/topicService.js";
import * as bookmarkService from "./services/bookmarkService.js";
import * as summaryService from "./services/summaryService.js";

const P = {
  getTopics: topicService.getTopics,
  createTopic: topicService.createTopic,
  deleteTopic: topicService.deleteTopic,
  getBookmarks: bookmarkService.getBookmarks,
  saveBookmark: bookmarkService.saveBookmark,
  updateBookmark: bookmarkService.updateBookmark,
  removeBookmark: bookmarkService.removeBookmark,
};

const te =
    '-apple-system, BlinkMacSystemFont, "Inter", "SF Pro Display", "Segoe UI", system-ui, sans-serif',
  $ = document.createElement("div");
$.id = "studysync-root-host";
$.style.cssText =
  "all: initial; position: fixed; top: 0; left: 0; width: 0; height: 0; z-index: 2147483647;";
document.documentElement.appendChild($);
const O = $.attachShadow({ mode: "open" }),
  K = document.createElement("style");
K.textContent = re();
O.appendChild(K);
// inject global styles for highlights into the page (not the shadow root)
try {
  const globalStyleId = "studysync-global-styles";
  if (!document.getElementById(globalStyleId)) {
    const gs = document.createElement("style");
    gs.id = globalStyleId;
    gs.textContent = `
      .studysync-highlight {
        background-color: var(--ss-color, rgba(59,130,246,0.22));
        border-radius: 2px;
        padding: 1px 2px;
        cursor: text;
        transition: box-shadow 120ms ease, background-color 120ms ease;
      }
      .studysync-highlight:hover {
        box-shadow: 0 0 0 4px var(--ss-color-hover, rgba(59,130,246,0.35));
      }
      .studysync-tooltip { position: absolute; z-index:2147483648; pointer-events: none; transform: translate(-50%, -100%); }
    `;
    document.documentElement.appendChild(gs);
  }
} catch (err) {
  console.error("studysync: failed to inject global highlight styles", err);
}
const v = document.createElement("div");
v.className = "ss-layer";
O.appendChild(v);
let l = null,
  k = null;

// Single source of truth for the current selection range to be used
// for bookmark/topic saving + highlight application.
let savedRange = null;

function saveCurrentSelection() {
  try {
    const selection = window.getSelection();
    if (
      selection &&
      selection.rangeCount > 0 &&
      !selection.isCollapsed
    ) {
      savedRange = selection.getRangeAt(0).cloneRange();
      console.log("[StudySync] savedRange updated via saveCurrentSelection");
    } else {
      savedRange = null;
      console.warn("[StudySync] saveCurrentSelection: range not captured");
    }
  } catch (err) {
    savedRange = null;
    console.warn("[StudySync] saveCurrentSelection failed", err);
  }
}

function se(t, e) {
  (b(),
    (l = document.createElement("div")),
    (l.className = "ss-bubble"),
    (l.innerHTML = `
    <button class="ss-bubble-btn" data-action="summary">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3l1.9 5.8H20l-4.9 3.6 1.9 5.8L12 14.6 7 18.2l1.9-5.8L4 8.8h6.1z"/>
      </svg>
      <span>AI Summary</span>
    </button>
    <div class="ss-bubble-divider"></div>
    <button class="ss-bubble-btn" data-action="bookmark">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
      <span>Bookmark</span>
    </button>
  `),
    v.appendChild(l));
  const a = 232,
    s = 38,
    o = 10,
    i = window.innerWidth,
    y = window.innerHeight;
  let c = e.left + e.width / 2 - a / 2,
    d = e.top - s - o;
  (d < 8 && (d = e.bottom + o),
    (c = Math.max(8, Math.min(c, i - a - 8))),
    (d = Math.max(8, Math.min(d, y - s - 8))),
    (l.style.left = `${c}px`),
    (l.style.top = `${d}px`),
    l.animate(
      [
        { opacity: 0, transform: "translateY(4px) scale(0.96)" },
        { opacity: 1, transform: "translateY(0) scale(1)" },
      ],
      {
        duration: 160,
        easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        fill: "forwards",
      },
    ),
    l.addEventListener("mousedown", (u) => u.preventDefault()),
      l.querySelectorAll("[data-action]").forEach((u) => {
        u.addEventListener("click", (w) => {
          (w.preventDefault(), w.stopPropagation());
          const L = u.dataset.action;
          try {
            saveCurrentSelection();
          } catch (captureErr) {
            // saveCurrentSelection already normalizes errors to savedRange=null
            console.warn("[StudySync] Range capture failed", captureErr);
          }

          (T(L, t), b());
        });
      }));
}
function b() {
  l && (l.remove(), (l = null));
}
function isEventFromHost(event) {
  try {
    if (typeof event.composedPath === "function") {
      return event.composedPath().includes($);
    }
    return event.target && ($ === event.target || $.contains(event.target));
  } catch {
    return false;
  }
}

function handleSelectionChange() {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) {
    return b();
  }

  const text = selection.toString().trim();
  if (text.length < 3) {
    return b();
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (!rect.width && !rect.height) {
    return b();
  }

  k = { text, rect };
  se(text, rect);
}

document.addEventListener("mouseup", () => {
  setTimeout(handleSelectionChange, 10);
});
document.addEventListener("selectionchange", () => {
  const selection = window.getSelection();
  if (!selection) return;
  const text = selection.toString().trim();
  if (text.length >= 3) {
    handleSelectionChange();
  } else if (k && !text) {
    b();
  }
});
document.addEventListener("mousedown", (t) => {
  if (!isEventFromHost(t)) {
    b();
  }
});
window.addEventListener("scroll", b, !0);
window.addEventListener("resize", b);
let n = null,
  p = null;
async function T(t, e) {
  closePanel();
  p = document.createElement("div");
  p.className = "ss-backdrop";
  p.addEventListener("click", closePanel);
  v.appendChild(p);
  
  n = document.createElement("div");
  n.className = "ss-panel";
  v.appendChild(n);
  
  // Add panel-level event delegation for all close/cancel buttons
  // This ensures listeners survive innerHTML updates during dynamic rendering
  n.addEventListener("click", (event) => {
    const target = event.target.closest("[data-close], [data-cancel]");
    if (target) {
      event.preventDefault();
      event.stopPropagation();
      closePanel();
    }
  });
  
  t === "summary" ? await ae(e) : await openBookmarkPanel(e);
  
  requestAnimationFrame(() => {
    if (p) {
      p.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 180,
        fill: "forwards",
      });
    }
    if (n) {
      n.animate(
        [{ transform: "translateX(100%)" }, { transform: "translateX(0)" }],
        {
          duration: 280,
          easing: "cubic-bezier(0.2, 0.9, 0.2, 1)",
          fill: "forwards",
        },
      );
    }
  });
}
function closePanel() {
    console.log("CLOSE PANEL RUNNING");

    if (n) {
        n.remove();
        n = null;
    }

    if (p) {
        p.remove();
        p = null;
    }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    b();
    closePanel();
  }
});

async function ae(t) {
  if (!n) return;

  const render = (bulletsHtml, loading) => {
    if (!n) return;

    n.innerHTML = `
      ${R("AI Summary", "Temporary insight — nothing is saved to your knowledge base.")}

      <div class="ss-panel-body">

        <section class="ss-section">
          <div class="ss-label">Selected content</div>
          <div class="ss-quote">${x(t)}</div>
        </section>

        <section class="ss-section">
          <div class="ss-label">Summary</div>

          <div class="ss-summary-card">
            <div class="ss-summary-head">
              <span class="ss-spark"></span>
              <span>Key takeaways</span>
            </div>

            <ul class="ss-bullets">
              ${bulletsHtml}
            </ul>
          </div>
        </section>

        <div class="ss-panel-actions">
          <button type="button" class="ss-btn-ghost" data-close>
            Close
          </button>

          <button
            type="button"
            class="ss-btn ${loading ? "is-disabled" : ""}"
            data-save-summary
          >
            ${loading ? "Generating..." : "Save summary"}
          </button>
        </div>

      </div>
    `;

    // No need for individual close button listener - event delegation handles it
  };

  const skeleton = Array.from({ length: 4 })
    .map(
      () =>
        `<li><span style="display:inline-block;height:10px;width:${60 + Math.floor(Math.random()*30)}%;background:linear-gradient(90deg,#eef0f3,#e3e6ea,#eef0f3);background-size:200% 100%;border-radius:6px;animation:ss-shimmer 1.2s linear infinite"></span></li>`
    )
    .join("");

  render(skeleton, true);

  const { bullets } = await summaryService.generateSummary(t);

  render(
    bullets.map((item) => `<li>${x(item)}</li>`).join(""),
    false
  );

  const saveBtn = n.querySelector("[data-save-summary]");

  if (saveBtn) {
    saveBtn.onclick = async () => {
      await summaryService.saveSummary({
        id: generateId("sum"),
        text: t.trim().slice(0, 240),
        bullets,
        url: location.href,
        title: document.title,
        createdAt: Date.now(),
      });

      ie("Summary saved");
      closePanel();
    };
  }
}
async function openBookmarkPanel(selectedText) {
  console.log("studysync: bookmark panel opened, text:", selectedText.substring(0, 50));
  if (!n) return;
  let topics = await topicService.getTopics();
  if (!Array.isArray(topics)) {
    topics = [];
  }
  console.log("studysync: topics loaded", topics.length, "topics");

  let selectedTopicId = null,
    noteText = "",
    isCreatingNewTopic = false;

  function renderBookmarkPanel() {
    if (!n) return;

    n.innerHTML = `
      ${R("Bookmark", "Save this into a topic to build your knowledge base.")}
      <div class="ss-panel-body">
        <section class="ss-section">
          <div class="ss-label">Selected content</div>
          <div class="ss-quote">${x(selectedText)}</div>
        </section>

        <section class="ss-section">
          <div class="ss-row-between">
            <div class="ss-label">Choose topic</div>
            <button class="ss-link" data-new-topic>${isCreatingNewTopic ? "Cancel" : "+ New topic"}</button>
          </div>

          ${
            isCreatingNewTopic
              ? `
            <div class="ss-newtopic">
              <input class="ss-input" id="ss-new-topic-name" placeholder="Topic name (e.g. Machine Learning)" />
              <div class="ss-color-picker-group">
                <label class="ss-label">Topic color</label>
                <div class="ss-color-picker-wrapper">
                  <input type="color" id="ss-color-picker" value="#3b82f6" class="ss-color-picker-input" aria-label="Choose topic color" />
                </div>
              </div>
              <button class="ss-btn ss-btn-full" data-create-topic>Create topic</button>
            </div>
          `
              : `
            <div class="ss-topics">
              ${topics
                .map(
                  (topic) => `
                <button class="ss-topic ${selectedTopicId === topic.id ? "is-active" : ""}" data-topic="${topic.id}">
                  <span class="ss-topic-dot" style="background:${topic.color}"></span>
                  <span class="ss-topic-name">${x(topic.name)}</span>
                  <span class="ss-topic-count">${topic.count}</span>
                </button>
              `,
                )
                .join("")}
            </div>
          `
          }
        </section>

        <section class="ss-section">
          <div class="ss-label">Note (optional)</div>
          <textarea class="ss-textarea" id="ss-note" placeholder="Why does this matter? Add context for future you…">${x(noteText)}</textarea>
        </section>

        <div class="ss-panel-actions">
          <button class="ss-btn-ghost" data-close>Cancel</button>
          <button class="ss-btn ${selectedTopicId ? "" : "is-disabled"}" data-save>Save bookmark</button>
        </div>
      </div>
    `;

    // No need for individual close button listener - event delegation handles it

    const newTopicToggle = n.querySelector("[data-new-topic]");
    newTopicToggle == null || newTopicToggle.addEventListener("click", () => {
      console.log("studysync: new topic toggle clicked, isCreatingNewTopic before:", isCreatingNewTopic);
      isCreatingNewTopic = !isCreatingNewTopic;
      renderBookmarkPanel();
      console.log("studysync: new topic toggle complete, isCreatingNewTopic after:", isCreatingNewTopic);
    });

    n.querySelectorAll("[data-topic]").forEach((topicButton) =>
      topicButton.addEventListener("click", () => {
        console.log("studysync: topic selected:", topicButton.dataset.topic);
        selectedTopicId = topicButton.dataset.topic;
        renderBookmarkPanel();
        console.log("studysync: topic selection complete, selectedTopicId=", selectedTopicId);
      }),
    );

    const noteInput = n.querySelector("#ss-note");
    if (noteInput) {
      noteInput.addEventListener("input", () => {
        noteText = noteInput.value;
      });
    }

    if (isCreatingNewTopic) {
      console.log("studysync: new topic form shown, setting up color picker");
      let topicColor = "#3b82f6";
      const colorPickerInput = n.querySelector("#ss-color-picker");
      console.log("studysync: color picker found:", !!colorPickerInput);
      if (colorPickerInput) {
        // initialize preview as the input itself
        colorPickerInput.value = topicColor;
        colorPickerInput.style.backgroundColor = topicColor;
        colorPickerInput.addEventListener("input", (event) => {
          topicColor = event.target.value;
          console.log("studysync: color changed:", topicColor);
          // live preview: color the input's background
          try {
            event.target.style.backgroundColor = topicColor;
          } catch {}
        });
      } else {
        console.warn("studysync: color picker not found");
      }
      const createTopicButton = n.querySelector("[data-create-topic]");
      console.log("studysync: create button found:", !!createTopicButton);
      if (createTopicButton) {
        createTopicButton.addEventListener("click", async () => {
          console.log("studysync: create topic clicked, color:", topicColor);
          const topicNameInput = n?.querySelector("#ss-new-topic-name");
          const newTopicName = (topicNameInput?.value || "").trim();
          console.log("studysync: topic name:", newTopicName);
          if (!newTopicName) {
            console.warn("studysync: empty topic name");
            return;
          }
          console.log("studysync: creating topic with color:", topicColor);
          console.log("[StudySync] savedRange (before topic creation):", savedRange);
          const createdTopic = await topicService.createTopic(newTopicName, topicColor);
          console.log("studysync: topic created:", createdTopic);
          topics = [createdTopic, ...topics];
          selectedTopicId = createdTopic.id;
          isCreatingNewTopic = false;
          renderBookmarkPanel();
        });
      }
    }

    const saveButton = n.querySelector("[data-save]");
    if (saveButton) {
      saveButton.addEventListener("click", async () => {
        console.log("studysync: save bookmark clicked, topic id:", selectedTopicId);
        if (!selectedTopicId) {
          console.warn("studysync: no topic selected");
          return;
        }
        const selectedTopic = topics.find((topic) => topic.id === selectedTopicId);
        if (!selectedTopic) {
          console.warn("studysync: selected topic not found", selectedTopicId);
          return;
        }
        console.log("studysync: found topic:", selectedTopic?.name, "color:", selectedTopic?.color);
        let rangeMeta = null;
        try {
          if (savedRange) {
            const cloned = savedRange.cloneRange ? savedRange.cloneRange() : savedRange;
            rangeMeta = serializeRange(cloned);
            if (rangeMeta) {
              console.log("[StudySync] Range Serialized");
            } else {
              console.warn("[StudySync] Range serialization returned null");
            }
          } else {
            // Try text-based fallback serialization
            const fallback = findAndCreateRangeFromText(selectedText);
            if (fallback) {
              rangeMeta = serializeRange(fallback);
              if (rangeMeta) console.log("[StudySync] Range Serialized via text fallback");
            } else {
              console.warn("[StudySync] Range Lost - no savedRange and text fallback failed");
            }
          }
        } catch (err) {
          console.warn("[StudySync] Range serialization error", err);
        }

        const bookmarkData = {
          text: selectedText,
          topicId: selectedTopic.id,
          topicName: selectedTopic.name,
          topicColor: selectedTopic.color,
          url: window.location.href,
          title: document.title,
          note: noteText || void 0,
          range: rangeMeta,
        };
        console.log("[StudySync] about to create bookmark (topicId, topicName):", selectedTopic.id, selectedTopic.name);
        console.log("[StudySync] savedRange (before bookmark save):", savedRange);

        console.log("studysync: saving bookmark with data:", bookmarkData);
        try {
          await bookmarkService.saveBookmark(bookmarkData);
          console.log("studysync: bookmark saved to storage");
        } catch (saveErr) {
          console.error("studysync: failed to save bookmark:", saveErr);
          throw saveErr;
        }

        console.log("[StudySync] savedRange (before highlight):", savedRange);
        console.log("studysync: applying highlight, color:", selectedTopic.color, "name:", selectedTopic.name);
        try {
          if (rangeMeta) {
            console.log("studysync: highlighting with serialized range");
            ne(selectedText, selectedTopic.color, selectedTopic.name, rangeMeta);
          } else {
            console.log("studysync: highlighting with current selection");
            ne(selectedText, selectedTopic.color, selectedTopic.name, null);
          }
          console.log("studysync: highlight applied successfully");
        } catch (err) {
          console.error("studysync: highlight rendering failed:", err);
        }
        console.log("studysync: showing success dialog");
        showBookmarkSaved(selectedTopic);
      });
    }
  }

  function showBookmarkSaved(topic) {
    if (!n) return;
    
    n.innerHTML = `
      <div class="ss-success">
        <div class="ss-success-check">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <h3>Saved to ${x(topic.name)}</h3>
        <p>Your highlight is visible on the page. Open the side panel any time to revisit.</p>
        <div class="ss-success-actions">
          <button class="ss-btn-ghost" data-close>Close</button>
          <button class="ss-btn" data-open-side>Open side panel</button>
        </div>
      </div>
    `;

    // Event delegation handles data-close button
    // Set up data-open-side button listener
    const openSideAction = n.querySelector("[data-open-side]");
    if (openSideAction) {
      openSideAction.addEventListener("click", () => {
        try {
          chrome.runtime.sendMessage({ type: "OPEN_SIDE_PANEL" });
        } catch {}
        closePanel();
      });
    }
  }

  renderBookmarkPanel();
}
function ne(t, e, a, serializedRange = null) {
  try {
    let range = null;
    
    // If serializedRange is provided (for restoration), try to deserialize it
    if (serializedRange) {
      try {
        range = deserializeRange(serializedRange);
      } catch (deserializeErr) {
        console.warn("studysync: error deserializing saved range", deserializeErr);
      }
      
      // If XPath restoration failed, try text-based fallback for restoration
      if (!range && serializedRange.text) {
        try {
          range = findAndCreateRangeFromText(serializedRange.text);
        } catch (textSearchErr) {
          console.warn("studysync: text-based fallback failed for restoration", textSearchErr);
        }
      }
    }
    
    // If no serializedRange was provided, use the previously captured savedRange
    if (!range && !serializedRange) {
      if (!savedRange) {
        console.error("No saved range available");
        return;
      }
      if (savedRange) {
        try {
          range = savedRange.cloneRange ? savedRange.cloneRange() : savedRange;
          console.log("[StudySync] Range Restored");
        } catch (restoreErr) {
          console.warn("[StudySync] savedRange invalid, attempting text search fallback", restoreErr);
          savedRange = null;
        }
      }

      if (!range) {
        try {
          range = findAndCreateRangeFromText(t);
          if (range) {
            console.log("[StudySync] Range Restored via text search");
          } else {
            console.warn("[StudySync] Range Lost");
            return;
          }
        } catch (err) {
          console.warn("[StudySync] Range restoration failed", err);
          return;
        }
      }
    }
    
    // Validate range exists and is not collapsed
    if (!range || range.collapsed) {
      console.warn("studysync: range is invalid or collapsed, nothing to highlight");
      return;
    }

    try {
      const i = document.createElement("span");
      i.className = "studysync-highlight";
      i.style.setProperty("--ss-color", A(e, 0.22));
      i.style.setProperty("--ss-color-hover", A(e, 0.35));
      i.style.setProperty("--ss-color-strong", A(e, 0.9));
      i.dataset.topic = a || "Topic";
      // attempt surroundContents; if it fails (e.g., partial non-text nodes), use extract/insert fallback
      try {
        range.surroundContents(i);
      } catch (wrapErr) {
        try {
          const extracted = range.extractContents();
          i.appendChild(extracted);
          range.insertNode(i);
        } catch (insertErr) {
          console.error("studysync: failed to wrap range with span", wrapErr, insertErr);
          return;
        }
      }
      Y(i);
      // clear live selection
      try {
        const sel = window.getSelection();
        sel && sel.removeAllRanges();
      } catch {}
    } catch (err) {
      console.error("studysync: error creating highlight element", err);
    }
  } catch (eErr) {
    console.error("studysync: unexpected error in ne()", eErr);
  }
}
// -- Range serialization helpers ------------------------------------------------
function nodeXPath(node) {
  if (node.nodeType === Node.TEXT_NODE) return nodeXPath(node.parentNode) + "/text()";
  if (!node || node.nodeType !== Node.ELEMENT_NODE) return "";
  const parts = [];
  while (node && node.nodeType === Node.ELEMENT_NODE) {
    let index = 1;
    let sibling = node.previousSibling;
    while (sibling) {
      if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === node.nodeName) index++;
      sibling = sibling.previousSibling;
    }
    parts.unshift(node.nodeName.toLowerCase() + (index > 1 ? `[${index}]` : ""));
    node = node.parentNode;
  }
  return parts.length ? "/" + parts.join("/") : null;
}

function getNodeByXPath(xpath) {
  try {
    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    return result.singleNodeValue;
  } catch {
    return null;
  }
}

function serializeRange(range) {
  try {
    const startNode = range.startContainer;
    const endNode = range.endContainer;
    const startXPath = nodeXPath(startNode.nodeType === Node.TEXT_NODE ? startNode : startNode);
    const endXPath = nodeXPath(endNode.nodeType === Node.TEXT_NODE ? endNode : endNode);
    return {
      startXPath,
      startOffset: range.startOffset,
      endXPath,
      endOffset: range.endOffset,
      text: range.toString(),
      createdAt: Date.now(),
    };
  } catch {
    return null;
  }
}

function deserializeRange(serialized) {
  try {
    if (!serialized || !serialized.startXPath || !serialized.endXPath) return null;
    const startNode = getNodeByXPath(serialized.startXPath);
    const endNode = getNodeByXPath(serialized.endXPath);
    if (!startNode || !endNode) return null;
    
    // Validate that nodes are actually in the document
    if (!document.contains(startNode) || !document.contains(endNode)) return null;
    
    const rng = document.createRange();
    // If XPath points to element/text node, evaluate proper container
    const startContainer = startNode.nodeType === Node.TEXT_NODE ? startNode : startNode.firstChild || startNode;
    const endContainer = endNode.nodeType === Node.TEXT_NODE ? endNode : endNode.firstChild || endNode;
    
    if (!startContainer || !endContainer) return null;
    
    rng.setStart(startContainer, Math.min(serialized.startOffset || 0, (startContainer.textContent || "").length));
    rng.setEnd(endContainer, Math.min(serialized.endOffset || 0, (endContainer.textContent || "").length));
    
    // Check if the range is collapsed (start and end are the same position)
    if (rng.collapsed) return null;
    
    return rng;
  } catch {
    return null;
  }
}

// Fallback: Search for text in DOM and create range
function findAndCreateRangeFromText(searchText) {
  try {
    if (!searchText || searchText.length === 0) return null;
    
    const treeWalker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let currentNode;
    const textLength = searchText.length;
    
    while ((currentNode = treeWalker.nextNode())) {
      const nodeText = currentNode.textContent;
      const index = nodeText.indexOf(searchText);
      
      if (index !== -1) {
        try {
          const rng = document.createRange();
          rng.setStart(currentNode, index);
          rng.setEnd(currentNode, index + textLength);
          
          if (!rng.collapsed) {
            return rng;
          }
        } catch {
          continue;
        }
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

// Restore highlights on page load for this URL
async function restoreHighlightsForPage() {
  try {
    const all = await P.getBookmarks();
    if (!Array.isArray(all) || all.length === 0) return;
    const url = window.location.href;
    const relevant = all.filter((b) => b.url === url && b.range);
    console.debug(`studysync: restoreHighlightsForPage found ${relevant.length} highlights for ${url}`);
    
    for (const b of relevant) {
      try {
        let rg = null;
        
        // Primary: Try XPath-based restoration
        try {
          rg = deserializeRange(b.range);
        } catch (xpathErr) {
          console.debug("studysync: XPath restoration failed, trying text-based fallback", xpathErr);
        }
        
        // Fallback: Try text-based restoration
        if (!rg && b.range && b.range.text) {
          try {
            rg = findAndCreateRangeFromText(b.range.text);
            if (rg) {
              console.debug("studysync: successfully restored highlight using text search fallback");
            }
          } catch (textSearchErr) {
            console.debug("studysync: text-based fallback also failed", textSearchErr);
          }
        }
        
        // Only apply if we have a valid, non-collapsed range
        if (!rg || rg.collapsed) {
          console.warn(`studysync: could not restore highlight for text "${(b.range?.text || "").substring(0, 50)}"`);
          continue;
        }

        console.log("[StudySync] Range Restored");
        
        const span = document.createElement("span");
        span.className = "studysync-highlight";
        span.style.setProperty("--ss-color", A(b.topicColor || "#3b82f6", 0.22));
        span.style.setProperty("--ss-color-hover", A(b.topicColor || "#3b82f6", 0.35));
        span.style.setProperty("--ss-color-strong", A(b.topicColor || "#3b82f6", 0.9));
        span.dataset.topic = b.topicName || "Topic";
        
        try {
          rg.surroundContents(span);
          Y(span);
          console.debug("studysync: highlight restored successfully");
          console.log("[StudySync] Highlight Applied");
        } catch (err) {
          try {
            // fallback: try to extract text nodes and wrap manually
            const extracted = rg.extractContents();
            span.appendChild(extracted);
            rg.insertNode(span);
            Y(span);
            console.debug("studysync: highlight applied with extractContents fallback");
          } catch (fallbackErr) {
            console.error("studysync: failed to apply saved highlight", b, err, fallbackErr);
          }
        }
      } catch (bookmarkErr) {
        console.error("studysync: error restoring bookmark highlight", bookmarkErr);
      }
    }
  } catch (restoreErr) {
    console.error("studysync: error in restoreHighlightsForPage", restoreErr);
  }
}

// run restore on next tick so DOM is ready
setTimeout(() => {
  try {
    restoreHighlightsForPage();
  } catch {}
}, 300);

function Y(t) {
  let e = null;
  (t.addEventListener("mouseenter", (a) => {
    ((e = document.createElement("div")),
      (e.className = "studysync-tooltip"),
      (e.innerHTML = `<span class="studysync-tooltip-dot" style="background:${t.style.getPropertyValue("--ss-color-strong")}"></span>${x(t.dataset.topic || "Topic")}`),
      document.body.appendChild(e));
    const s = t.getBoundingClientRect();
    ((e.style.left = `${s.left + s.width / 2}px`),
      (e.style.top = `${s.top}px`));
  }),
    t.addEventListener("mouseleave", () => {
      (e == null || e.remove(), (e = null));
    }),
    t.addEventListener("click", (a) => {
      a.preventDefault();
      try {
        chrome.runtime.sendMessage({ type: "OPEN_SIDE_PANEL" });
      } catch {}
    }));
}
document.querySelectorAll(".studysync-highlight").forEach(Y);
var B, N;
(N = (B = chrome.runtime) == null ? void 0 : B.onMessage) == null ||
  N.addListener((t) => {
    (t == null ? void 0 : t.type) === "QUICK_SUMMARY" && k
      ? T("summary", k.text)
      : (t == null ? void 0 : t.type) === "QUICK_BOOKMARK" &&
        k &&
        T("bookmark", k.text);
  });
function ie(t) {
  const e = document.createElement("div");
  ((e.className = "ss-toast"),
    (e.textContent = t),
    v.appendChild(e),
    e.animate(
      [
        { opacity: 0, transform: "translateY(8px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 180, fill: "forwards" },
    ),
    setTimeout(() => {
      e.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 220,
        fill: "forwards",
      }).onfinish = () => e.remove();
    }, 1800));
}
function R(t, e) {
  return `
    <header class="ss-panel-head">
      <div class="ss-brand">
        <span class="ss-brand-mark"></span>
        <span class="ss-brand-text">StudySync</span>
      </div>
      <button class="ss-icon-btn" data-close aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
      <div class="ss-panel-title">
        <h2>${t}</h2>
        <p>${e}</p>
      </div>
    </header>
  `;
}
function x(t) {
  return t
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function A(t, e) {
  const a = t.replace("#", ""),
    s = parseInt(a.slice(0, 2), 16),
    o = parseInt(a.slice(2, 4), 16),
    i = parseInt(a.slice(4, 6), 16);
  return `rgba(${s}, ${o}, ${i}, ${e})`;
}
function re() {
  return `
    :host, .ss-layer { all: initial; }
    .ss-layer * { box-sizing: border-box; font-family: ${te}; }

    .ss-bubble {
      position: fixed;
      display: inline-flex;
      align-items: center;
      height: 38px;
      padding: 4px;
      background: #0a0a0a;
      color: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 28px rgba(0,0,0,0.28), 0 2px 6px rgba(0,0,0,0.18);
      opacity: 0;
    }
    .ss-bubble-btn {
      all: unset;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 30px;
      padding: 0 10px;
      border-radius: 8px;
      color: #fff;
      font-size: 12.5px;
      font-weight: 500;
      letter-spacing: -0.01em;
      cursor: pointer;
      transition: background 120ms ease, transform 120ms ease;
    }
    .ss-bubble-btn:hover { background: rgba(255,255,255,0.08); }
    .ss-bubble-btn:active { transform: scale(0.97); }
    .ss-bubble-divider {
      width: 1px; height: 18px;
      background: rgba(255,255,255,0.14);
      margin: 0 2px;
    }

    .ss-backdrop {
      position: fixed; inset: 0;
      background: rgba(10,10,10,0.32);
      backdrop-filter: blur(2px);
      opacity: 0;
    }
    .ss-panel {
      position: fixed;
      top: 0; right: 0; bottom: 0;
      width: min(420px, 92vw);
      background: #ffffff;
      box-shadow: -16px 0 48px rgba(0,0,0,0.16);
      display: flex; flex-direction: column;
      transform: translateX(100%);
      overflow: hidden;
    }

    .ss-panel-head {
      position: relative;
      padding: 18px 20px 14px;
      border-bottom: 1px solid #ececef;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
    }
    .ss-brand { display: inline-flex; align-items: center; gap: 8px; }
    .ss-brand-mark {
      width: 18px; height: 18px; border-radius: 6px;
      background: linear-gradient(135deg, #0a0a0a 0%, #2a2a2a 100%);
      position: relative;
    }
    .ss-brand-mark::after {
      content: ""; position: absolute; inset: 4px;
      border-radius: 3px; background: #fff;
      opacity: 0.9;
      clip-path: polygon(0 60%, 50% 0, 100% 60%, 100% 100%, 0 100%);
    }
    .ss-brand-text { font-size: 13px; font-weight: 600; letter-spacing: -0.01em; color: #0a0a0a; }
    .ss-panel-title { grid-column: 1 / -1; margin-top: 10px; }
    .ss-panel-title h2 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.02em; color: #0a0a0a; }
    .ss-panel-title p { margin: 4px 0 0; font-size: 13px; color: #71717a; line-height: 1.45; }

    .ss-icon-btn {
      all: unset; cursor: pointer;
      width: 28px; height: 28px;
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 8px; color: #71717a;
    }
    .ss-icon-btn:hover { background: #f4f4f5; color: #0a0a0a; }

    .ss-panel-body {
      flex: 1; overflow-y: auto;
      padding: 18px 20px 100px;
      display: flex; flex-direction: column; gap: 20px;
    }
    .ss-section { display: flex; flex-direction: column; gap: 8px; }
    .ss-label {
      font-size: 11px; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.06em; color: #71717a;
    }
    .ss-row-between { display: flex; align-items: center; justify-content: space-between; }
    .ss-link {
      all: unset; cursor: pointer;
      font-size: 12px; font-weight: 500; color: #0a0a0a;
      padding: 4px 8px; border-radius: 6px;
    }
    .ss-link:hover { background: #f4f4f5; }

    .ss-quote {
      font-size: 13.5px; line-height: 1.55; color: #27272a;
      background: #fafafa;
      border: 1px solid #ececef;
      border-left: 3px solid #0a0a0a;
      padding: 12px 14px; border-radius: 10px;
      max-height: 180px; overflow-y: auto;
    }

    .ss-summary-card {
      border: 1px solid #ececef; border-radius: 12px;
      padding: 14px; background: #fff;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }
    .ss-summary-head {
      display: flex; align-items: center; gap: 8px;
      font-size: 12px; font-weight: 600; color: #0a0a0a;
      margin-bottom: 10px;
    }
    .ss-spark {
      width: 14px; height: 14px; border-radius: 4px;
      background: linear-gradient(135deg, #3b6cf6, #0a0a0a);
    }
    .ss-bullets {
      margin: 0; padding-left: 18px;
      display: flex; flex-direction: column; gap: 6px;
      font-size: 13.5px; line-height: 1.5; color: #27272a;
    }

    .ss-topics { display: flex; flex-direction: column; gap: 6px; }
    .ss-topic {
      all: unset; cursor: pointer;
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px;
      border: 1px solid #ececef; border-radius: 10px;
      background: #fff; transition: all 120ms ease;
    }
    .ss-topic:hover { border-color: #d4d4d8; background: #fafafa; }
    .ss-topic.is-active {
      border-color: #0a0a0a; background: #fafafa;
      box-shadow: 0 0 0 1px #0a0a0a;
    }
    .ss-topic-dot { width: 10px; height: 10px; border-radius: 999px; flex-shrink: 0; }
    .ss-topic-name { flex: 1; font-size: 13.5px; font-weight: 500; color: #0a0a0a; }
    .ss-topic-count { font-size: 11.5px; color: #a1a1aa; font-variant-numeric: tabular-nums; }

    .ss-newtopic { display: flex; flex-direction: column; gap: 10px; }
    .ss-input, .ss-textarea {
      width: 100%;
      border: 1px solid #ececef; border-radius: 10px;
      padding: 10px 12px; font-size: 13px; color: #0a0a0a;
      background: #fff; outline: none; font-family: inherit;
      transition: border-color 120ms ease;
    }
    .ss-input:focus, .ss-textarea:focus { border-color: #0a0a0a; }
    .ss-textarea { min-height: 80px; resize: vertical; line-height: 1.5; }
    /* Color picker styles */
    .ss-color-picker-group { display: flex; flex-direction: column; gap: 8px; }
    .ss-color-picker-wrapper {
      display: flex; align-items: center; gap: 12px;
      background: #f9f9fb; padding: 10px 12px; border-radius: 10px;
      border: 1px solid #ececef;
    }
    .ss-color-picker-input {
      width: 50px; height: 40px; border: none; border-radius: 8px;
      cursor: pointer; padding: 2px;
    }
    

    .ss-panel-actions {
      position: absolute; left: 0; right: 0; bottom: 0;
      padding: 14px 20px;
      background: linear-gradient(to top, #fff 70%, rgba(255,255,255,0));
      display: flex; gap: 8px; justify-content: flex-end;
    }
    .ss-btn, .ss-btn-ghost {
      all: unset; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
      height: 36px; padding: 0 14px;
      font-size: 13px; font-weight: 500; border-radius: 10px;
      transition: background 120ms ease, transform 120ms ease;
    }
    .ss-btn { background: #0a0a0a; color: #fff; }
    .ss-btn:hover { background: #27272a; }
    .ss-btn:active { transform: scale(0.98); }
    .ss-btn.is-disabled { opacity: 0.4; pointer-events: none; }
    .ss-btn-full { width: 100%; }
    .ss-btn-ghost { color: #52525b; }
    .ss-btn-ghost:hover { background: #f4f4f5; color: #0a0a0a; }

    .ss-success {
      flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 40px 28px; text-align: center; gap: 14px;
    }
    .ss-success-check {
      width: 56px; height: 56px; border-radius: 999px;
      background: #ecfdf5; color: #059669;
      display: inline-flex; align-items: center; justify-content: center;
    }
    .ss-success h3 { margin: 0; font-size: 18px; font-weight: 600; letter-spacing: -0.01em; color: #0a0a0a; }
    .ss-success p { margin: 0; font-size: 13px; color: #71717a; line-height: 1.5; max-width: 280px; }
    .ss-success-actions { display: flex; gap: 8px; margin-top: 10px; }

    .ss-toast {
      position: fixed; bottom: 24px; left: 50%;
      transform: translateX(-50%);
      background: #0a0a0a; color: #fff;
      padding: 10px 14px; border-radius: 10px;
      font-size: 13px; font-weight: 500;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    }
    @keyframes ss-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
}
