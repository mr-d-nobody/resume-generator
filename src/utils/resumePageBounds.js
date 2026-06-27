const A4_RATIO = 297 / 210;
const MEDIA_SELECTOR = 'img, svg, canvas, video, picture, table';

function addRect(bounds, rootRect, rect) {
  if (!rect || rect.width <= 0.2 || rect.height <= 0.2) return;
  bounds.bottom = Math.max(bounds.bottom, rect.bottom - rootRect.top);
}

function addTextBounds(root, rootRect, bounds) {
  const doc = root.ownerDocument;
  const view = doc.defaultView || window;
  const nodeFilter = view.NodeFilter;
  const walker = doc.createTreeWalker(
    root,
    nodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        return node.nodeValue.trim()
          ? nodeFilter.FILTER_ACCEPT
          : nodeFilter.FILTER_REJECT;
      }
    }
  );
  const range = doc.createRange();

  while (walker.nextNode()) {
    range.selectNodeContents(walker.currentNode);
    [...range.getClientRects()].forEach((rect) => addRect(bounds, rootRect, rect));
  }

  range.detach();
}

function addMediaBounds(root, rootRect, bounds) {
  root.querySelectorAll(MEDIA_SELECTOR).forEach((element) => {
    [...element.getClientRects()].forEach((rect) => addRect(bounds, rootRect, rect));
  });
}

export function getA4PageHeightForWidth(width) {
  return width * A4_RATIO;
}

export function getResumeContentBounds(root, minimumHeight = 0) {
  if (!root) {
    return { width: 0, height: minimumHeight, contentHeight: 0 };
  }

  const rootRect = root.getBoundingClientRect();
  const bounds = { bottom: 0 };

  addTextBounds(root, rootRect, bounds);
  addMediaBounds(root, rootRect, bounds);

  const contentHeight = Math.max(0, bounds.bottom);
  return {
    width: Math.ceil(rootRect.width),
    height: Math.ceil(Math.max(minimumHeight, contentHeight)),
    contentHeight: Math.ceil(contentHeight)
  };
}
