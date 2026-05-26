/**
 * Romantic confession SPA — Vanilla JS
 * Flow: #s0 → #s1 → #s2 → #s3 → #s4 | Three.js: final-screen-3d.js
 */

// ==================== CONTENT CONFIG (customize here) ====================

/** Screen 2 — letter (typewriter) */
const LETTER_TEXT =
  'Chào Bem,\n\nMấy ngày nay bạn đã suy nghĩ rất cẩn thận để có thể dũng cảm nói ra những lời này...\nHai đứa mình quen nhau tới nay đã gần 7 năm rồi. Và đặc biệt là 3 tuần qua, khi được Bem cho phép bạn bước vào thế giới của Bem, được quan tâm và tìm hiểu sâu sắc hơn, bạn thực sự rất vui. Trong thời gian này, bạn cảm thấy cuộc sống của mình như có thêm một vệt màu hồng vút qua. Mỗi ngày trôi qua không còn tẻ nhạt nữa, vì bạn đã có một người để nhớ, một điều để mong đợi mỗi sớm mai.Nhưng Bem à, càng lúc bạn càng nhận ra càng ngày bạn càng tham lam, bạn không thể tiếp tục làm bạn với người mà mình thương được nữa. Bạn không muốn bọn mình chỉ dừng lại ở mức độ bạn bè, bạn khao khát có những "đặc quyền" lớn lao hơn. Cộng thêm việc cảm nhận được Bem đang dần open hơn, bạn lại càng muốn được thể hiện tình cảm của mình một cách rõ ràng và trọn vẹn nhất qua từng lời nói, cử chỉ. Bạn muốn được làm một phần trong cuộc sống của Bem: một chút phiền phức đáng yêu, một sự quan tâm chân thành, một nỗi nhớ nhung và quan trọng nhất là một chỗ dựa vững chắc. \nDù hiện tại bạn có thể chưa hoàn hảo, chưa có trong tay những điều lớn lao, nhưng bạn hứa sẽ luôn nỗ lực không ngừng. Bạn muốn cố gắng vì chính mình, và vì để Bem cảm nhận được rằng: ở bên bạn, Bem luôn có một nơi an toàn và bình yên nhất để tin tưởng.'+ 
  '\n\nNên là hôm nay bạn mạnh dạn make a move...\nLiệu Bem có thể cho bạn một cơ hội được hỏi là: ...';

/** Scrapbook (Screens 1–3) — ảnh trong thư mục images/ */
const SCRAPBOOK_IMAGES = [
  "images/651969745_18097225636959543_4843858491545233309_n.jpg",
  "images/653415025_18124711261576296_3279492354001215226_n.jpg",
  "images/654585650_18186810742366875_42857474834090634_n.jpg",
  "images/BAO06479.jpg",
  "images/z7867897943182_595deb8bf8c8e11c64c4b528ba867bb5.jpg",
  "images/z7867897943405_b7922e69c994144649050c6bcf101ae7.jpg",
];

/** Screen 4 — INSERT COUPLE PHOTO URL */
const MEMORIAL_IMAGE =
  "images/656268617_18199510201338584_5218352067584475385_n.jpg";

const FINAL_TITLE =
  "Yay! Cảm ơn Bem đã đồng ý chấp nhận yêu cầu này từ bạn ❤️✨";

const FINAL_MESSAGE = "Yêuu bạn nhiều lắm luôn đóaa! Hy vọng chúng ta sẽ có thật nhiều kỷ niệm đẹp bên nhau nhé!";

/** Screen 3 — 5 pleading lines (clicks 1–5 → index 0–4) */
const PLEADING_TEXTS = [
  "Ơ kìa, sao lại bấm Không? Huhu...",
  "Suy nghĩ lại chút đi mà...", 
  "Tớ năn nỉ đó, đừng từ chối nữa...",
  "Cậu chắc chắn là Không chứ?",
  "Đừng bấm Không nữa, tớ buồn lắm...",
];

/** Screen 3 — INSERT GIF URLs HERE */
const GIF_URLS = [
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdmJ3amU5dDNpOHl1bDRzbm05NWwyeDB0NG8zaTF3Mmp3dXZzOGx1cCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/5SbA6ZRhiI5jriUwqu/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmtmM3Znd2V0aXIybHN0OXljcHJuMjFreGlxeHhpdXd0NzFmN3liOSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/y6lu312reRzVC46yFn/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bmc0ZnU4aXd1cGRiOHRtamY0aWVzM3JqY2V3NzRndWxpeXlmeWd2YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/SjUVdtZJD1amvPddOq/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bmc0ZnU4aXd1cGRiOHRtamY0aWVzM3JqY2V3NzRndWxpeXlmeWd2YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/7diCX3MXpTp3JwF8dR/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3NmaG9hZXkwN3UzcDJzYnpidGJxcHRndXIzMmNibzlwZ2QyOHBqYyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/SEgSwox3DSlx7QH4xQ/giphy.gif",
];

// ==================== DOM ====================

const screens = {
  s0: document.getElementById("s0"),
  s1: document.getElementById("s1"),
  s2: document.getElementById("s2"),
  s3: document.getElementById("s3"),
  s4: document.getElementById("s4"),
};

const btnTrigger = document.getElementById("btn-trigger");
const btnWatch = document.getElementById("btn-watch");
const bgMusic = document.getElementById("bg-music");
const typewriterEl = document.getElementById("typewriter");
const btnNextLetter = document.getElementById("btn-next-letter");
const confessionGif = document.getElementById("confession-gif");
const pleadingText = document.getElementById("pleading-text");
const yesBtn = document.getElementById("yes-btn");
const noBtn = document.getElementById("no-btn");

const FLEX_SCREENS = new Set(["s0", "s1", "s2", "s3"]);

// ==================== SPA navigation ====================

/**
 * Toggle screens via display:none / flex|block (.screen--active).
 * @param {"s0"|"s1"|"s2"|"s3"|"s4"} id
 */
function showScreen(id) {
  Object.entries(screens).forEach(([key, el]) => {
    if (!el) return;
    const active = key === id;
    el.classList.toggle("screen--active", active);
    el.classList.toggle("screen--flex", active && FLEX_SCREENS.has(key));
  });
}

// ==================== Screen 0: music + intro ====================

function playBackgroundMusic() {
  if (!bgMusic) return;
  bgMusic.volume = 0.85;
  const p = bgMusic.play();
  if (p?.catch) {
    p.catch(() => {
      /* Retry once on next click if blocked */
      bgMusic.play().catch(() => {});
    });
  }
}

btnTrigger?.addEventListener("click", () => {
  playBackgroundMusic();
  showScreen("s1");
});

// ==================== Screen 1: go to letter + typewriter ====================

btnWatch?.addEventListener("click", () => {
  showScreen("s2");
  startTypewriter();
});

// ==================== Screen 2: typewriter ====================

let typewriterTimer = null;
const TYPE_SPEED_MS = 38;
const LINE_BREAK_PAUSE = 3;

function clearTypewriter() {
  if (typewriterTimer) {
    clearTimeout(typewriterTimer);
    typewriterTimer = null;
  }
  if (typewriterEl) typewriterEl.innerHTML = "";
  if (btnNextLetter) {
    btnNextLetter.hidden = true;
    btnNextLetter.classList.remove("is-visible");
  }
}

function scrollLetterToEnd() {
  const body = typewriterEl?.closest(".letter-body");
  if (body) body.scrollTop = body.scrollHeight;
}

function startTypewriter() {
  clearTypewriter();
  if (!typewriterEl) return;

  let index = 0;
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  typewriterEl.appendChild(cursor);

  function typeNext() {
    if (index >= LETTER_TEXT.length) {
      cursor.remove();
      scrollLetterToEnd();
      if (btnNextLetter) {
        btnNextLetter.hidden = false;
        requestAnimationFrame(() => btnNextLetter.classList.add("is-visible"));
      }
      return;
    }

    const char = LETTER_TEXT[index];
    cursor.before(document.createTextNode(char));
    index += 1;
    scrollLetterToEnd();

    const delay = char === "\n" ? TYPE_SPEED_MS * LINE_BREAK_PAUSE : TYPE_SPEED_MS;
    typewriterTimer = setTimeout(typeNext, delay);
  }

  typeNext();
}

btnNextLetter?.addEventListener("click", () => {
  clearTypewriter();
  showScreen("s3");
  resetConfessionScreen();
});

// ==================== Screen 3: Yes / No ====================

let noClickCount = 0;
let noFleeMode = false;
let yesScale = 1;
let noScale = 1;

const YES_SCALE_MAX = 2;
const NO_SCALE_MIN = 0.38;
const SCALE_STEP = 0.28;

function applyButtonScales() {
  if (typeof gsap !== "undefined") {
    gsap.set(yesBtn, { scale: yesScale });
    gsap.set(noBtn, { scale: noScale });
  } else {
    yesBtn.style.transform = `scale(${yesScale})`;
    noBtn.style.transform = `scale(${noScale})`;
  }
}

function finalizeButtonScales() {
  yesScale = YES_SCALE_MAX;
  noScale = NO_SCALE_MIN;
  applyButtonScales();
}

function updatePleading(index) {
  if (!pleadingText || index < 0 || index >= PLEADING_TEXTS.length) return;
  pleadingText.textContent = PLEADING_TEXTS[index];
  pleadingText.classList.remove("is-visible");
  requestAnimationFrame(() => pleadingText.classList.add("is-visible"));
}

function updateGif(index) {
  if (confessionGif && index >= 0 && index < GIF_URLS.length) {
    confessionGif.src = GIF_URLS[index];
  }
}

function getSafeRandomPosition(el) {
  const pad = 16;
  const w = el.offsetWidth || 90;
  const h = el.offsetHeight || 40;
  const maxL = Math.max(pad, window.innerWidth - w - pad);
  const maxT = Math.max(pad, window.innerHeight - h - pad);
  return {
    left: pad + Math.random() * (maxL - pad),
    top: pad + Math.random() * (maxT - pad),
  };
}

function fleeNoButton() {
  if (!noFleeMode || !noBtn) return;
  const { left, top } = getSafeRandomPosition(noBtn);

  if (typeof gsap !== "undefined") {
    gsap.to(noBtn, {
      left,
      top,
      duration: 0.18,
      ease: "power2.out",
      overwrite: "auto",
    });
  } else {
    noBtn.style.left = `${left}px`;
    noBtn.style.top = `${top}px`;
  }
}

function enableNoFleeMode() {
  if (noFleeMode) return;
  noFleeMode = true;

  noBtn.removeEventListener("click", onNoClick);
  noBtn.classList.add("is-fleeing");

  const { left, top } = getSafeRandomPosition(noBtn);
  noBtn.style.position = "fixed";
  noBtn.style.left = `${left}px`;
  noBtn.style.top = `${top}px`;

  finalizeButtonScales();

  noBtn.addEventListener("mouseenter", fleeNoButton);
  noBtn.addEventListener("mouseover", fleeNoButton);
  noBtn.addEventListener("touchstart", fleeNoButton, { passive: true });
}

function onNoClick() {
  noClickCount += 1;

  if (noClickCount <= 4) {
    updateGif(noClickCount);
    updatePleading(noClickCount - 1);
    yesScale = Math.min(YES_SCALE_MAX, yesScale + SCALE_STEP);
    noScale = Math.max(NO_SCALE_MIN, noScale - SCALE_STEP * 0.85);
    applyButtonScales();
  }

  if (noClickCount === 5) {
    updateGif(4);
    updatePleading(4);
    enableNoFleeMode();
  }
}

function resetConfessionScreen() {
  noClickCount = 0;
  noFleeMode = false;
  yesScale = 1;
  noScale = 1;

  if (confessionGif) confessionGif.src = GIF_URLS[0];
  if (pleadingText) {
    pleadingText.textContent = "";
    pleadingText.classList.remove("is-visible");
  }

  noBtn.classList.remove("is-fleeing");
  noBtn.style.position = "";
  noBtn.style.left = "";
  noBtn.style.top = "";
  noBtn.removeEventListener("mouseenter", fleeNoButton);
  noBtn.removeEventListener("mouseover", fleeNoButton);
  noBtn.removeEventListener("touchstart", fleeNoButton);
  noBtn.removeEventListener("click", onNoClick);
  noBtn.addEventListener("click", onNoClick);

  applyButtonScales();
}

yesBtn?.addEventListener("click", () => {
  showScreen("s4");
  initSparkleRain();
  requestAnimationFrame(() => initFinalScreen3D());
});

noBtn?.addEventListener("click", onNoClick);

// ==================== Screen 4 helpers ====================

function initSparkleRain() {
  const container = document.getElementById("sparkle-rain");
  if (!container || container.childElementCount > 0) return;

  const count = window.innerWidth < 768 ? 48 : 80;
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "sparkle";
    s.style.left = `${Math.random() * 100}%`;
    s.style.setProperty("--fall-dur", `${2 + Math.random() * 3}s`);
    s.style.setProperty("--fall-delay", `${Math.random() * 3}s`);
    container.appendChild(s);
  }
}

function activateSparkleRain() {
  document.getElementById("sparkle-rain")?.classList.add("is-active");
}

let finalInitAttempts = 0;

function initFinalScreen3D() {
  if (typeof window.startFinalScreen !== "function") {
    finalInitAttempts += 1;
    if (finalInitAttempts > 50) {
      const hint = document.getElementById("final-hint");
      if (hint) {
        hint.textContent =
          "Không tải được Three.js. Chạy bằng Live Server (http://), không mở file:// trực tiếp.";
      }
      return;
    }
    setTimeout(initFinalScreen3D, 120);
    return;
  }

  finalInitAttempts = 0;
  window.startFinalScreen({
    titleEl: document.getElementById("final-title"),
    title: FINAL_TITLE,
    messageEl: document.getElementById("final-message"),
    message: FINAL_MESSAGE,
    imageEl: document.getElementById("couple-photo"),
    imageWrap: document.getElementById("couple-wrap"),
    imageCenter: MEMORIAL_IMAGE,
    onMatched: activateSparkleRain,
  });
}

// ==================== Scrapbook images ====================

function initScrapbookImages() {
  document.querySelectorAll(".scrapbook-bg .polaroid[data-scrap]").forEach((img) => {
    const idx = Number(img.dataset.scrap);
    if (SCRAPBOOK_IMAGES[idx]) {
      img.src = SCRAPBOOK_IMAGES[idx];
      img.alt = `Kỷ niệm ${idx + 1}`;
    }
  });
}

// ==================== Floating hearts density ====================

function enrichFloatingHearts() {
  document.querySelectorAll(".bg-hearts").forEach((container) => {
    const existing = container.querySelectorAll(".floating-heart").length;
    const target = 18;
    for (let i = existing; i < target; i++) {
      const h = document.createElement("span");
      h.className = "floating-heart";
      h.textContent = "♥";
      h.style.left = `${Math.random() * 94 + 2}%`;
      h.style.top = `${Math.random() * 90 + 4}%`;
      h.style.setProperty("--dur", `${5 + Math.random() * 5}s`);
      h.style.setProperty("--delay", `${Math.random() * 2.5}s`);
      container.appendChild(h);
    }
  });
}

function init() {
  showScreen("s0");
  if (confessionGif) confessionGif.src = GIF_URLS[0];
  const couplePhoto = document.getElementById("couple-photo");
  if (couplePhoto && MEMORIAL_IMAGE) couplePhoto.src = MEMORIAL_IMAGE;
  initScrapbookImages();
  enrichFloatingHearts();
  applyButtonScales();
}

init();
