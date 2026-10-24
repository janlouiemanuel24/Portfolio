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

const shootingStarCursor = document.querySelector(".shooting-star-cursor");
const shootingStarTrail = document.querySelector(".shooting-star-trail");
const trailContext = shootingStarTrail?.getContext("2d");
if (
  shootingStarCursor &&
  shootingStarTrail &&
  trailContext &&
  !reduceMotion.matches &&
  window.matchMedia("(pointer: fine)").matches
) {
  const trailParticles = [];
  const cursor = { x: 0, y: 0, targetX: 0, targetY: 0, angle: 0, speed: 0, lastMove: 0 };
  let trailFrame = 0;
  let hasPointerPosition = false;

  const resizeShootingStarTrail = () => {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    shootingStarTrail.width = Math.round(window.innerWidth * pixelRatio);
    shootingStarTrail.height = Math.round(window.innerHeight * pixelRatio);
    trailContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };

  const drawShootingStar = (now) => {
    trailFrame = 0;
    trailContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const elapsed = now - cursor.lastMove;
    const trailOpacity = Math.max(0, 1 - elapsed / 180);
    const tailLength = Math.min(150, 34 + cursor.speed * 2.2);

    if (trailOpacity > 0 && cursor.speed > 0) {
      const tailX = cursor.x - Math.cos(cursor.angle) * tailLength;
      const tailY = cursor.y - Math.sin(cursor.angle) * tailLength;
      const gradient = trailContext.createLinearGradient(tailX, tailY, cursor.x, cursor.y);
      gradient.addColorStop(0, "rgba(99, 232, 240, 0)");
      gradient.addColorStop(.72, `rgba(99, 232, 240, ${.38 * trailOpacity})`);
      gradient.addColorStop(1, `rgba(255, 255, 255, ${.95 * trailOpacity})`);
      trailContext.beginPath();
      trailContext.moveTo(tailX, tailY);
      trailContext.lineTo(cursor.x, cursor.y);
      trailContext.lineWidth = 2.5 + Math.min(cursor.speed * .08, 2);
      trailContext.lineCap = "round";
      trailContext.strokeStyle = gradient;
      trailContext.shadowBlur = 14;
      trailContext.shadowColor = `rgba(99, 232, 240, ${.8 * trailOpacity})`;
      trailContext.stroke();
      trailContext.shadowBlur = 0;
    }

    for (let index = trailParticles.length - 1; index >= 0; index -= 1) {
      const particle = trailParticles[index];
      const age = now - particle.born;
      const progress = age / particle.lifetime;
      if (progress >= 1) {
        trailParticles.splice(index, 1);
        continue;
      }

      particle.x += particle.vx;
      particle.y += particle.vy;
      const opacity = (1 - progress) * particle.opacity;
      trailContext.beginPath();
      trailContext.arc(particle.x, particle.y, particle.size * (1 - progress * .5), 0, Math.PI * 2);
      trailContext.fillStyle = `rgba(175, 248, 255, ${opacity})`;
      trailContext.shadowBlur = 9;
      trailContext.shadowColor = `rgba(99, 232, 240, ${opacity})`;
      trailContext.fill();
      trailContext.shadowBlur = 0;
    }

    if (trailParticles.length || trailOpacity > 0) {
      trailFrame = window.requestAnimationFrame(drawShootingStar);
    }
  };

  window.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;

    const previousX = cursor.targetX;
    const previousY = cursor.targetY;
    const deltaX = event.clientX - previousX;
    const deltaY = event.clientY - previousY;
    const distance = Math.hypot(deltaX, deltaY);
    cursor.targetX = event.clientX;
    cursor.targetY = event.clientY;
    cursor.lastMove = performance.now();

    if (!hasPointerPosition) {
      cursor.x = cursor.targetX;
      cursor.y = cursor.targetY;
      hasPointerPosition = true;
    } else if (distance > 0) {
      cursor.angle = Math.atan2(deltaY, deltaX);
      cursor.speed = Math.min(distance, 55);
      const particleCount = Math.min(Math.floor(distance / 5), 12);
      for (let index = 0; index < particleCount; index += 1) {
        const progress = (index + 1) / (particleCount + 1);
        trailParticles.push({
          x: previousX + deltaX * progress,
          y: previousY + deltaY * progress,
          vx: -Math.cos(cursor.angle) * (1 + Math.random() * 1.4) + (Math.random() - .5) * 1.1,
          vy: -Math.sin(cursor.angle) * (1 + Math.random() * 1.4) + (Math.random() - .5) * 1.1,
          born: cursor.lastMove,
          lifetime: 300 + Math.random() * 280,
          size: 1 + Math.random() * 2,
          opacity: .45 + Math.random() * .5,
        });
      }
      if (trailParticles.length > 120) trailParticles.splice(0, trailParticles.length - 120);
    }

    shootingStarCursor.style.setProperty("--cursor-x", `${cursor.targetX}px`);
    shootingStarCursor.style.setProperty("--cursor-y", `${cursor.targetY}px`);
    shootingStarCursor.style.setProperty("--cursor-angle", `${cursor.angle}rad`);
    shootingStarCursor.classList.add("is-visible");
    if (!trailFrame) trailFrame = window.requestAnimationFrame(drawShootingStar);
  }, { passive: true });

  window.addEventListener("pointerleave", () => {
    shootingStarCursor.classList.remove("is-visible");
  });
  window.addEventListener("resize", resizeShootingStarTrail, { passive: true });
  resizeShootingStarTrail();
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
      } else {
        element.classList.remove("is-visible");
      }
    });
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
    if (!element.classList.contains("project-card")) {
      element.style.setProperty("--reveal-x", `${revealOffsets[index % revealOffsets.length]}px`);
    }
    element.style.setProperty("--reveal-tilt", `${index % 2 === 0 ? -2 : 2}deg`);
  });
  window.addEventListener("scroll", scheduleRevealCheck, { passive: true });
  window.addEventListener("resize", scheduleRevealCheck, { passive: true });
  revealVisibleTargets();
} else {
  revealTargets.forEach((element) => element.classList.add("is-visible"));
}
