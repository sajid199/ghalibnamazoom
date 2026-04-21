const canvas = document.getElementById("previewCanvas");
const ctx = canvas.getContext("2d");

const controls = {
  canvasWidth: document.getElementById("canvasWidth"),
  canvasHeight: document.getElementById("canvasHeight"),
  backgroundColor: document.getElementById("backgroundColor"),
  backgroundOverlay: document.getElementById("backgroundOverlay"),
  cornerRadius: document.getElementById("cornerRadius"),
  backgroundImageInput: document.getElementById("backgroundImageInput"),
  showHeader: document.getElementById("showHeader"),
  profileImageInput: document.getElementById("profileImageInput"),
  profileName: document.getElementById("profileName"),
  profileHandle: document.getElementById("profileHandle"),
  headerX: document.getElementById("headerX"),
  headerY: document.getElementById("headerY"),
  profileSize: document.getElementById("profileSize"),
  nameSize: document.getElementById("nameSize"),
  handleSize: document.getElementById("handleSize"),
  headerGap: document.getElementById("headerGap"),
  quoteText: document.getElementById("quoteText"),
  fontFamily: document.getElementById("fontFamily"),
  quoteAlign: document.getElementById("quoteAlign"),
  quoteX: document.getElementById("quoteX"),
  quoteY: document.getElementById("quoteY"),
  quoteWidth: document.getElementById("quoteWidth"),
  quoteFontSize: document.getElementById("quoteFontSize"),
  quoteLineHeight: document.getElementById("quoteLineHeight"),
  quoteColor: document.getElementById("quoteColor"),
  highlightText: document.getElementById("highlightText"),
  highlightColor: document.getElementById("highlightColor"),
  highlightBaseSize: document.getElementById("highlightBaseSize"),
  highlightTargetSize: document.getElementById("highlightTargetSize"),
  highlightGlow: document.getElementById("highlightGlow"),
  previewProgress: document.getElementById("previewProgress"),
  watermarkText: document.getElementById("watermarkText"),
  watermarkSize: document.getElementById("watermarkSize"),
  watermarkX: document.getElementById("watermarkX"),
  watermarkY: document.getElementById("watermarkY"),
  watermarkColor: document.getElementById("watermarkColor"),
  watermarkOpacity: document.getElementById("watermarkOpacity"),
  videoDuration: document.getElementById("videoDuration"),
  downloadName: document.getElementById("downloadName"),
  downloadImage: document.getElementById("downloadImage"),
  downloadVideo: document.getElementById("downloadVideo"),
  resetLayout: document.getElementById("resetLayout"),
  statusMessage: document.getElementById("statusMessage"),
  selectionHint: document.getElementById("selectionHint")
};

const STORAGE_KEY = "story-composer-state-v2";
let backgroundImage = null;
let profileImage = null;
let currentHitRegions = [];
let activeRegionId = null;
let dragTarget = null;

function createDefaultState() {
  return {
    canvasWidth: 1080,
    canvasHeight: 1920,
    backgroundColor: "#dcefe4",
    backgroundOverlay: 0.2,
    cornerRadius: 36,
    showHeader: true,
    profileName: "Ghalib Nama",
    profileHandle: "@Ghalibnama",
    headerX: 56,
    headerY: 56,
    profileSize: 92,
    nameSize: 38,
    handleSize: 24,
    headerGap: 28,
    quoteText: "\u0928\u093e \u0938\u0924\u0940 \u0915\u094b \u0936\u093f\u0935 \u092c\u091a\u093e \u0938\u0915\u0947,\n\u0928\u093e \u0938\u0940\u0924\u093e \u0915\u094b \u0930\u093e\u092e \u0938\u092e\u094d\u092e\u093e\u0928 \u0926\u093f\u0932\u093e \u0938\u0915\u0947,\n\u0914\u0930 \u0928\u093e \u0939\u0940 \u0926\u094d\u0930\u094c\u092a\u0926\u0940 \u0915\u093e \u091a\u0940\u0930\u0939\u0930\u0923 \u092a\u093e\u0902\u0921\u0935 \u0930\u094b\u0915 \u092a\u093e\u090f,\n\u092b\u093f\u0930 \u092a\u0924\u093f \u0915\u094b \u092a\u0930\u092e\u0947\u0936\u094d\u0935\u0930 \u0915\u093f\u0938\u0928\u0947 \u0915\u0939\u093e?",
    fontFamily: '"Nirmala UI", "Mangal", sans-serif',
    quoteAlign: "center",
    quoteX: 540,
    quoteY: 760,
    quoteWidth: 940,
    quoteFontSize: 78,
    quoteLineHeight: 1.15,
    quoteColor: "#171717",
    highlightText: "\u092a\u0930\u092e\u0947\u0936\u094d\u0935\u0930",
    highlightColor: "#f11709",
    highlightBaseSize: 128,
    highlightTargetSize: 184,
    highlightGlow: 0.45,
    previewProgress: 0,
    watermarkText: "@Ghalibnama",
    watermarkSize: 48,
    watermarkX: 540,
    watermarkY: 1845,
    watermarkColor: "#8b918d",
    watermarkOpacity: 0.45,
    videoDuration: 10,
    downloadName: "marked-word-story"
  };
}

function loadState() {
  const defaults = createDefaultState();
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return defaults;
  }

  try {
    return {
      ...defaults,
      ...JSON.parse(saved)
    };
  } catch (error) {
    console.warn("Could not restore saved state:", error);
    return defaults;
  }
}

const state = loadState();

function resizeCanvas() {
  canvas.width = Number(state.canvasWidth);
  canvas.height = Number(state.canvasHeight);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function updateStatus(message, busy = false) {
  controls.statusMessage.textContent = message;
  controls.statusMessage.dataset.busy = busy ? "true" : "false";
}

function setSelectionHint(label) {
  controls.selectionHint.textContent = `Selected: ${label}`;
}

function syncControls() {
  Object.entries({
    canvasWidth: state.canvasWidth,
    canvasHeight: state.canvasHeight,
    backgroundColor: state.backgroundColor,
    backgroundOverlay: state.backgroundOverlay,
    cornerRadius: state.cornerRadius,
    profileName: state.profileName,
    profileHandle: state.profileHandle,
    headerX: state.headerX,
    headerY: state.headerY,
    profileSize: state.profileSize,
    nameSize: state.nameSize,
    handleSize: state.handleSize,
    headerGap: state.headerGap,
    quoteText: state.quoteText,
    fontFamily: state.fontFamily,
    quoteAlign: state.quoteAlign,
    quoteX: state.quoteX,
    quoteY: state.quoteY,
    quoteWidth: state.quoteWidth,
    quoteFontSize: state.quoteFontSize,
    quoteLineHeight: state.quoteLineHeight,
    quoteColor: state.quoteColor,
    highlightText: state.highlightText,
    highlightColor: state.highlightColor,
    highlightBaseSize: state.highlightBaseSize,
    highlightTargetSize: state.highlightTargetSize,
    highlightGlow: state.highlightGlow,
    previewProgress: state.previewProgress,
    watermarkText: state.watermarkText,
    watermarkSize: state.watermarkSize,
    watermarkX: state.watermarkX,
    watermarkY: state.watermarkY,
    watermarkColor: state.watermarkColor,
    watermarkOpacity: state.watermarkOpacity,
    videoDuration: state.videoDuration,
    downloadName: state.downloadName
  }).forEach(([key, value]) => {
    controls[key].value = value;
  });

  controls.showHeader.checked = state.showHeader;
  resizeCanvas();
}

function afterStateChange() {
  saveState();
  resizeCanvas();
  draw();
}

function attachInput(id, key, parser = (value) => value) {
  controls[id].addEventListener("input", () => {
    state[key] = parser(controls[id].value);
    afterStateChange();
  });
}

function readFileAsImage(file, onReady) {
  if (!file) {
    onReady(null);
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => onReady(image);
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function roundRect(context, x, y, width, height, radius) {
  const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function fontSpec(size) {
  return `700 ${size}px ${state.fontFamily}`;
}

function measureToken(context, text, size) {
  context.font = fontSpec(size);
  return context.measureText(text).width;
}

function buildSegments(text, highlightText) {
  const phrase = highlightText.trim();
  if (!phrase) {
    return [{ text, highlight: false }];
  }

  const source = text;
  const lowerSource = source.toLocaleLowerCase();
  const lowerPhrase = phrase.toLocaleLowerCase();
  const segments = [];
  let cursor = 0;

  while (cursor < source.length) {
    const matchIndex = lowerSource.indexOf(lowerPhrase, cursor);
    if (matchIndex === -1) {
      segments.push({ text: source.slice(cursor), highlight: false });
      break;
    }

    if (matchIndex > cursor) {
      segments.push({ text: source.slice(cursor, matchIndex), highlight: false });
    }

    segments.push({
      text: source.slice(matchIndex, matchIndex + phrase.length),
      highlight: true
    });

    cursor = matchIndex + phrase.length;
  }

  return segments.filter((segment) => segment.text);
}

function buildTokens(text, highlightText) {
  const segments = buildSegments(text, highlightText);
  const tokens = [];

  segments.forEach((segment) => {
    const parts = segment.text.split(/(\n|[^\S\r\n]+)/);
    parts.forEach((part) => {
      if (!part) return;
      if (part === "\n") {
        tokens.push({ text: part, type: "newline", highlight: false });
      } else if (/^[^\S\r\n]+$/.test(part)) {
        tokens.push({ text: part, type: "space", highlight: segment.highlight });
      } else {
        tokens.push({ text: part, type: "word", highlight: segment.highlight });
      }
    });
  });

  return tokens;
}

function lineStartX(lineWidth) {
  if (state.quoteAlign === "left") return state.quoteX;
  if (state.quoteAlign === "right") return state.quoteX - lineWidth;
  return state.quoteX - lineWidth / 2;
}

function layoutQuote(context) {
  const tokens = buildTokens(state.quoteText, state.highlightText);
  const maxWidth = Number(state.quoteWidth);
  const lineHeight = Math.max(Number(state.quoteFontSize), Number(state.highlightBaseSize)) * Number(state.quoteLineHeight);
  const lines = [];
  let currentLine = [];
  let currentWidth = 0;

  function flushLine() {
    while (currentLine.length && currentLine[currentLine.length - 1].type === "space") {
      currentWidth -= currentLine[currentLine.length - 1].width;
      currentLine.pop();
    }

    lines.push({
      tokens: currentLine,
      width: Math.max(0, currentWidth)
    });
    currentLine = [];
    currentWidth = 0;
  }

  tokens.forEach((token) => {
    if (token.type === "newline") {
      flushLine();
      return;
    }

    const size = token.highlight ? Number(state.highlightBaseSize) : Number(state.quoteFontSize);
    const width = measureToken(context, token.text, size);
    const measuredToken = { ...token, width, size };

    if (token.type === "space" && currentLine.length === 0) {
      return;
    }

    const nextWidth = currentWidth + width;
    if (token.type === "word" && currentLine.length > 0 && nextWidth > maxWidth) {
      flushLine();
    }

    if (token.type === "space" && currentLine.length === 0) {
      return;
    }

    currentLine.push(measuredToken);
    currentWidth += width;
  });

  if (currentLine.length || !lines.length) {
    flushLine();
  }

  const laidOutTokens = [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  lines.forEach((line, lineIndex) => {
    const startX = lineStartX(line.width);
    const baseY = state.quoteY + lineIndex * lineHeight;
    let cursorX = startX;

    line.tokens.forEach((token) => {
      laidOutTokens.push({
        ...token,
        x: cursorX,
        y: baseY
      });

      if (token.type !== "space") {
        minX = Math.min(minX, cursorX);
        minY = Math.min(minY, baseY);
        maxX = Math.max(maxX, cursorX + token.width);
        maxY = Math.max(maxY, baseY + token.size);
      }

      cursorX += token.width;
    });
  });

  if (!laidOutTokens.length) {
    minX = state.quoteX;
    minY = state.quoteY;
    maxX = state.quoteX;
    maxY = state.quoteY;
  }

  return {
    tokens: laidOutTokens,
    bounds: {
      x: minX,
      y: minY,
      width: Math.max(1, maxX - minX),
      height: Math.max(lineHeight, maxY - minY)
    }
  };
}

function drawHeader(context) {
  if (!state.showHeader) return null;

  const avatarSize = Number(state.profileSize);
  const x = Number(state.headerX);
  const y = Number(state.headerY);
  const textX = x + avatarSize + Number(state.headerGap);

  if (profileImage) {
    context.save();
    context.beginPath();
    context.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    context.clip();
    context.drawImage(profileImage, x, y, avatarSize, avatarSize);
    context.restore();
  } else {
    context.fillStyle = "#8a5f45";
    context.beginPath();
    context.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#fff4ea";
    context.font = `700 ${avatarSize * 0.4}px Georgia, serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("GN", x + avatarSize / 2, y + avatarSize / 2);
  }

  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillStyle = "#121212";
  context.font = `700 ${state.nameSize}px ${state.fontFamily}`;
  context.fillText(state.profileName, textX, y + 2);
  const nameWidth = context.measureText(state.profileName).width;

  context.fillStyle = "#606060";
  context.font = `500 ${state.handleSize}px ${state.fontFamily}`;
  context.fillText(state.profileHandle, textX, y + Number(state.nameSize) + 12);
  const handleWidth = context.measureText(state.profileHandle).width;

  return {
    id: "header",
    label: "header block",
    boxes: [{
      x,
      y,
      width: avatarSize + Number(state.headerGap) + Math.max(nameWidth, handleWidth),
      height: Math.max(avatarSize, Number(state.nameSize) + Number(state.handleSize) + 18)
    }]
  };
}

function drawWatermark(context) {
  if (!state.watermarkText.trim()) return null;

  const size = Number(state.watermarkSize);
  context.save();
  context.globalAlpha = Number(state.watermarkOpacity);
  context.fillStyle = state.watermarkColor;
  context.font = `500 ${size}px ${state.fontFamily}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(state.watermarkText, Number(state.watermarkX), Number(state.watermarkY));
  const width = context.measureText(state.watermarkText).width;
  context.restore();

  return {
    id: "watermark",
    label: "watermark",
    boxes: [{
      x: Number(state.watermarkX) - width / 2,
      y: Number(state.watermarkY) - size / 2,
      width,
      height: size
    }]
  };
}

function drawGlow(context, centerX, centerY, radius, opacity) {
  const gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  gradient.addColorStop(0, `rgba(255, 82, 43, ${opacity})`);
  gradient.addColorStop(1, "rgba(255, 82, 43, 0)");
  context.fillStyle = gradient;
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.fill();
}

function drawQuote(context, animationProgress = 0) {
  const layout = layoutQuote(context);
  const easedProgress = 1 - (1 - animationProgress) ** 2;

  layout.tokens.forEach((token) => {
    if (token.type === "space") {
      return;
    }

    const baseSize = token.highlight ? Number(state.highlightBaseSize) : Number(state.quoteFontSize);
    const animatedSize = token.highlight
      ? baseSize + (Number(state.highlightTargetSize) - baseSize) * easedProgress
      : baseSize;

    context.textAlign = "left";
    context.textBaseline = "top";
    context.font = fontSpec(animatedSize);

    const drawWidth = context.measureText(token.text).width;
    let drawX = token.x;
    let drawY = token.y;

    if (token.highlight) {
      const centerX = token.x + token.width / 2;
      const centerY = token.y + token.size / 2;
      drawX = centerX - drawWidth / 2;
      drawY = centerY - animatedSize / 2;

      if (Number(state.highlightGlow) > 0) {
        drawGlow(
          context,
          centerX,
          centerY,
          Math.max(animatedSize, drawWidth) * 0.68,
          Number(state.highlightGlow) * (0.35 + easedProgress * 0.65)
        );
      }

      context.shadowColor = "rgba(255, 75, 26, 0.38)";
      context.shadowBlur = 10 + 26 * easedProgress;
      context.fillStyle = state.highlightColor;
    } else {
      context.shadowBlur = 0;
      context.fillStyle = state.quoteColor;
    }

    context.fillText(token.text, drawX, drawY);
    context.shadowBlur = 0;
  });

  return {
    id: "quote",
    label: "quote block",
    boxes: [layout.bounds]
  };
}

function drawSelection(context, regions) {
  if (!activeRegionId) return;

  const region = regions.find((item) => item.id === activeRegionId);
  if (!region) return;

  context.save();
  context.strokeStyle = "rgba(184, 63, 32, 0.92)";
  context.lineWidth = 3;
  context.setLineDash([12, 8]);
  region.boxes.forEach((box) => {
    context.strokeRect(box.x - 8, box.y - 8, box.width + 16, box.height + 16);
  });
  context.restore();
}

function drawScene(context, animationProgress = 0, options = {}) {
  const showSelection = options.showSelection ?? true;
  const width = Number(state.canvasWidth);
  const height = Number(state.canvasHeight);
  context.clearRect(0, 0, width, height);

  context.save();
  roundRect(context, 0, 0, width, height, Number(state.cornerRadius));
  context.clip();

  context.fillStyle = state.backgroundColor;
  context.fillRect(0, 0, width, height);

  if (backgroundImage) {
    const ratio = Math.max(width / backgroundImage.width, height / backgroundImage.height);
    const drawWidth = backgroundImage.width * ratio;
    const drawHeight = backgroundImage.height * ratio;
    const drawX = (width - drawWidth) / 2;
    const drawY = (height - drawHeight) / 2;
    context.globalAlpha = 1;
    context.drawImage(backgroundImage, drawX, drawY, drawWidth, drawHeight);
  }

  context.globalAlpha = 1;
  context.fillStyle = `rgba(255, 255, 255, ${Number(state.backgroundOverlay)})`;
  context.fillRect(0, 0, width, height);

  const regions = [];

  const headerRegion = drawHeader(context);
  if (headerRegion) {
    regions.push(headerRegion);
  }

  regions.push(drawQuote(context, animationProgress));

  const watermarkRegion = drawWatermark(context);
  if (watermarkRegion) {
    regions.push(watermarkRegion);
  }

  if (showSelection) {
    drawSelection(context, regions);
  }

  context.restore();
  return regions;
}

function draw() {
  const previewProgress = Number(state.previewProgress) / 100;
  currentHitRegions = drawScene(ctx, previewProgress, { showSelection: true });
}

function resetLayout() {
  Object.assign(state, createDefaultState());
  backgroundImage = null;
  profileImage = null;
  activeRegionId = null;
  controls.backgroundImageInput.value = "";
  controls.profileImageInput.value = "";
  syncControls();
  setSelectionHint("none");
  afterStateChange();
  updateStatus("Sample layout restored.");
}

function pointerPosition(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
}

function findHitTarget(x, y) {
  return [...currentHitRegions].reverse().find((region) =>
    region.boxes.some((box) => (
      x >= box.x &&
      x <= box.x + box.width &&
      y >= box.y &&
      y <= box.y + box.height
    ))
  );
}

function syncDragInputs() {
  controls.headerX.value = state.headerX;
  controls.headerY.value = state.headerY;
  controls.quoteX.value = state.quoteX;
  controls.quoteY.value = state.quoteY;
  controls.watermarkX.value = state.watermarkX;
  controls.watermarkY.value = state.watermarkY;
}

function bindCanvasDragging() {
  canvas.addEventListener("pointerdown", (event) => {
    const position = pointerPosition(event);
    const target = findHitTarget(position.x, position.y);

    if (!target) {
      activeRegionId = null;
      setSelectionHint("none");
      draw();
      return;
    }

    activeRegionId = target.id;
    setSelectionHint(target.label);
    draw();

    if (target.id === "header") {
      dragTarget = {
        id: "header",
        offsetX: position.x - Number(state.headerX),
        offsetY: position.y - Number(state.headerY)
      };
    }

    if (target.id === "quote") {
      dragTarget = {
        id: "quote",
        offsetX: position.x - Number(state.quoteX),
        offsetY: position.y - Number(state.quoteY)
      };
    }

    if (target.id === "watermark") {
      dragTarget = {
        id: "watermark",
        offsetX: position.x - Number(state.watermarkX),
        offsetY: position.y - Number(state.watermarkY)
      };
    }

    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!dragTarget) return;

    const position = pointerPosition(event);

    if (dragTarget.id === "header") {
      state.headerX = Math.round(position.x - dragTarget.offsetX);
      state.headerY = Math.round(position.y - dragTarget.offsetY);
    }

    if (dragTarget.id === "quote") {
      state.quoteX = Math.round(position.x - dragTarget.offsetX);
      state.quoteY = Math.round(position.y - dragTarget.offsetY);
    }

    if (dragTarget.id === "watermark") {
      state.watermarkX = Math.round(position.x - dragTarget.offsetX);
      state.watermarkY = Math.round(position.y - dragTarget.offsetY);
    }

    syncDragInputs();
    saveState();
    draw();
  });

  canvas.addEventListener("pointerup", () => {
    dragTarget = null;
  });

  canvas.addEventListener("pointercancel", () => {
    dragTarget = null;
  });
}

function safeFileName() {
  const cleaned = (state.downloadName || "marked-word-story").trim().replace(/[<>:"/\\|?*]+/g, "-");
  return cleaned || "marked-word-story";
}

function exportImage() {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = Number(state.canvasWidth);
  exportCanvas.height = Number(state.canvasHeight);
  const exportContext = exportCanvas.getContext("2d");
  drawScene(exportContext, 0, { showSelection: false });

  const link = document.createElement("a");
  link.href = exportCanvas.toDataURL("image/png");
  link.download = `${safeFileName()}.png`;
  link.click();
  updateStatus("PNG image downloaded.");
}

async function exportVideo() {
  const duration = Math.max(1, Number(state.videoDuration));
  const fps = 30;
  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : "video/webm";

  updateStatus(`Rendering ${duration}-second zoom video. Please wait...`, true);

  const streamCanvas = document.createElement("canvas");
  streamCanvas.width = Number(state.canvasWidth);
  streamCanvas.height = Number(state.canvasHeight);
  const streamContext = streamCanvas.getContext("2d");
  const stream = streamCanvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks = [];

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  const finished = new Promise((resolve) => {
    recorder.onstop = resolve;
  });

  recorder.start();

  const totalFrames = duration * fps;
  for (let frame = 0; frame < totalFrames; frame += 1) {
    const progress = totalFrames <= 1 ? 1 : frame / (totalFrames - 1);
    drawScene(streamContext, progress, { showSelection: false });
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 1000 / fps));
  }

  recorder.stop();
  await finished;

  const blob = new Blob(chunks, { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeFileName()}.webm`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  updateStatus("Zoom video downloaded as WebM.");
}

function bindControls() {
  attachInput("canvasWidth", "canvasWidth", Number);
  attachInput("canvasHeight", "canvasHeight", Number);
  attachInput("backgroundColor", "backgroundColor");
  attachInput("backgroundOverlay", "backgroundOverlay", Number);
  attachInput("cornerRadius", "cornerRadius", Number);
  attachInput("profileName", "profileName");
  attachInput("profileHandle", "profileHandle");
  attachInput("headerX", "headerX", Number);
  attachInput("headerY", "headerY", Number);
  attachInput("profileSize", "profileSize", Number);
  attachInput("nameSize", "nameSize", Number);
  attachInput("handleSize", "handleSize", Number);
  attachInput("headerGap", "headerGap", Number);
  attachInput("quoteText", "quoteText");
  attachInput("fontFamily", "fontFamily");
  attachInput("quoteAlign", "quoteAlign");
  attachInput("quoteX", "quoteX", Number);
  attachInput("quoteY", "quoteY", Number);
  attachInput("quoteWidth", "quoteWidth", Number);
  attachInput("quoteFontSize", "quoteFontSize", Number);
  attachInput("quoteLineHeight", "quoteLineHeight", Number);
  attachInput("quoteColor", "quoteColor");
  attachInput("highlightText", "highlightText");
  attachInput("highlightColor", "highlightColor");
  attachInput("highlightBaseSize", "highlightBaseSize", Number);
  attachInput("highlightTargetSize", "highlightTargetSize", Number);
  attachInput("highlightGlow", "highlightGlow", Number);
  attachInput("previewProgress", "previewProgress", Number);
  attachInput("watermarkText", "watermarkText");
  attachInput("watermarkSize", "watermarkSize", Number);
  attachInput("watermarkX", "watermarkX", Number);
  attachInput("watermarkY", "watermarkY", Number);
  attachInput("watermarkColor", "watermarkColor");
  attachInput("watermarkOpacity", "watermarkOpacity", Number);
  attachInput("videoDuration", "videoDuration", Number);
  attachInput("downloadName", "downloadName");

  controls.showHeader.addEventListener("change", () => {
    state.showHeader = controls.showHeader.checked;
    afterStateChange();
  });

  controls.backgroundImageInput.addEventListener("change", (event) => {
    readFileAsImage(event.target.files?.[0], (image) => {
      backgroundImage = image;
      afterStateChange();
    });
  });

  controls.profileImageInput.addEventListener("change", (event) => {
    readFileAsImage(event.target.files?.[0], (image) => {
      profileImage = image;
      afterStateChange();
    });
  });

  controls.resetLayout.addEventListener("click", resetLayout);
  controls.downloadImage.addEventListener("click", exportImage);
  controls.downloadVideo.addEventListener("click", () => {
    exportVideo().catch((error) => {
      console.error(error);
      updateStatus("Video export failed in this browser.");
    });
  });
}

bindControls();
bindCanvasDragging();
syncControls();

const img = new Image();
img.onload = () => {
  profileImage = img;
  afterStateChange();
};
img.src = 'assets/images.jpg';

setSelectionHint("none");
draw();
