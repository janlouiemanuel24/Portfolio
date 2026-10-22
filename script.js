const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");
const copyEmailButton = document.querySelector(".copy-email");
const localTime = document.querySelector("#local-time");
const yearLabel = document.querySelector("#year");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const introScreen = document.querySelector("#intro-screen");

if (introScreen && !reduceMotion.matches) {
  document.body.classList.add("intro-playing");
  introScreen.hidden = false;
  const finishIntro = () => {
    introScreen.hidden = true;
    document.body.classList.remove("intro-playing");
  };
  introScreen.addEventListener("animationend", (event) => {
    if (event.target !== introScreen || event.animationName !== "intro-exit") return;
    finishIntro();
  });
  window.setTimeout(() => {
    introScreen.classList.add("is-exiting");
    window.setTimeout(finishIntro, 800);
  }, 3700);
}

function setMenuOpen(isOpen) {
  if (!menuToggle || !siteNav) return;
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  siteNav.classList.toggle("is-open", isOpen);
}

menuToggle?.addEventListener("click", () => {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});

siteNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuOpen(false);
});

copyEmailButton?.addEventListener("click", async () => {
  const email = copyEmailButton.dataset.email;
  if (!email) return;

  const originalLabel = "Copy email address";
  try {
    await navigator.clipboard.writeText(email);
    copyEmailButton.textContent = "Email copied";
    window.setTimeout(() => {
      copyEmailButton.textContent = originalLabel;
    }, 2200);
  } catch (error) {
    copyEmailButton.textContent = "Copy unavailable — use the email link above";
    console.error("Could not copy the email address to the clipboard.", error);
  }
});

function updateFooterDetails() {
  const now = new Date();
  if (localTime) {
    localTime.textContent = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Manila",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(now);
  }
  if (yearLabel) yearLabel.textContent = String(now.getFullYear());
}

updateFooterDetails();
window.setInterval(updateFooterDetails, 60_000);

const interactivePortrait = document.querySelector(".hero-art");
const cartoonPortrait = interactivePortrait?.querySelector(".hero-cartoon");
const portraitPoses = {
  "top-left": "images/portrait-top-left.jpg",
  top: "images/portrait-top.jpg",
  "top-right": "images/portrait-top-right.jpg",
  left: "images/portrait-left.jpg",
  straight: "images/portrait-straight.jpg",
  right: "images/portrait-right.jpg",
  "bottom-left": "images/portrait-bottom-left.jpg",
  bottom: "images/portrait-bottom.jpg",
  "bottom-right": "images/portrait-bottom-right.jpg",
};

Object.values(portraitPoses).forEach((src) => {
  const image = new Image();
  image.src = src;
});

function updatePortrait(event) {
  if (!interactivePortrait || !cartoonPortrait) return;

  const bounds = interactivePortrait.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;

  const x = event.clientX - bounds.left;
  const y = event.clientY - bounds.top;
  const horizontalOffset = (x - bounds.width / 2) / bounds.width;
  const verticalOffset = (y - bounds.height / 2) / bounds.height;
  const horizontal = horizontalOffset < -.16 ? "left" : horizontalOffset > .16 ? "right" : "";
  const vertical = verticalOffset < -.16 ? "top" : verticalOffset > .16 ? "bottom" : "";
  const pose = [vertical, horizontal].filter(Boolean).join("-") || "straight";

  if (interactivePortrait.classList.contains("is-hovering")) {
    interactivePortrait.style.setProperty("--pointer-x", `${x}px`);
    interactivePortrait.style.setProperty("--pointer-y", `${y}px`);
  }
  if (cartoonPortrait.getAttribute("src") !== portraitPoses[pose]) {
    cartoonPortrait.setAttribute("src", portraitPoses[pose]);
  }
}

interactivePortrait?.addEventListener("pointerenter", (event) => {
  interactivePortrait.classList.add("is-hovering");
  updatePortrait(event);
});
interactivePortrait?.addEventListener("pointerleave", () => {
  interactivePortrait.classList.remove("is-hovering");
  interactivePortrait.style.removeProperty("--pointer-x");
  interactivePortrait.style.removeProperty("--pointer-y");
});
document.addEventListener("pointermove", updatePortrait, { passive: true });

const revealTargets = document.querySelectorAll([
  ".section-heading",
  ".project-card",
  ".work-note",
  ".about-top",
  ".about-content > *",
  ".principle",
  ".certificate-card",
  ".certificate-actions",
  ".contact-top",
  ".contact-main > *",
  ".contact-bottom > span",
].join(", "));
let scheduleRevealCheck;

if (!reduceMotion.matches) {
  let revealFrame = 0;
  const revealVisibleTargets = () => {
    const revealLine = window.innerHeight * 0.9;
    revealTargets.forEach((element) => {
      const bounds = element.getBoundingClientRect();
      if (bounds.top < revealLine && bounds.bottom > 0) {
        element.classList.add("is-visible");
      }
    });

    if ([...revealTargets].every((element) => element.classList.contains("is-visible"))) {
      window.removeEventListener("scroll", scheduleRevealCheck);
      window.removeEventListener("resize", scheduleRevealCheck);
    }
  };
  scheduleRevealCheck = () => {
    if (revealFrame) return;
    revealFrame = window.requestAnimationFrame(() => {
      revealFrame = 0;
      revealVisibleTargets();
    });
  };

  revealTargets.forEach((element, index) => {
    element.classList.add("scroll-reveal");
    const revealOffsets = [-18, 18, -10, 10];
    element.style.setProperty("--reveal-delay", `${(index % 4) * 110}ms`);
    element.style.setProperty("--reveal-x", `${revealOffsets[index % revealOffsets.length]}px`);
    element.style.setProperty("--reveal-tilt", `${index % 2 === 0 ? -2 : 2}deg`);
  });
  window.addEventListener("scroll", scheduleRevealCheck, { passive: true });
  window.addEventListener("resize", scheduleRevealCheck, { passive: true });
  revealVisibleTargets();
} else {
  revealTargets.forEach((element) => element.classList.add("is-visible"));
}
