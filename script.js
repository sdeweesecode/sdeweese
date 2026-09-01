// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

toggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  toggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });
});

// Lightbox
const lightbox = document.getElementById('lightbox');
const lbClose = lightbox.querySelector('.lightbox-close');
const lbPrev = lightbox.querySelector('.lightbox-btn.prev');
const lbNext = lightbox.querySelector('.lightbox-btn.next');
let lbImages = [];
let lbCurrent = 0;

function openLightbox(carousel, startIndex) {
  const imgs = carousel.querySelectorAll('img');
  // Clear old lightbox images
  lightbox.querySelectorAll('img').forEach(img => img.remove());
  lbImages = [];
  imgs.forEach((img, i) => {
    const clone = document.createElement('img');
    clone.src = img.src;
    clone.alt = img.alt;
    if (i === startIndex) clone.classList.add('active');
    lightbox.appendChild(clone);
    lbImages.push(clone);
  });
  lbCurrent = startIndex;
  lightbox.classList.add('open');
  // Hide arrows if single image
  lbPrev.style.display = lbImages.length <= 1 ? 'none' : 'flex';
  lbNext.style.display = lbImages.length <= 1 ? 'none' : 'flex';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  // Remove iframe so video stops playing
  lightbox.querySelectorAll('iframe').forEach(el => el.remove());
}

function lbGoTo(index) {
  lbImages[lbCurrent].classList.remove('active');
  lbCurrent = index;
  lbImages[lbCurrent].classList.add('active');
}

lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
lbPrev.addEventListener('click', () => {
  lbGoTo(lbCurrent === 0 ? lbImages.length - 1 : lbCurrent - 1);
});
lbNext.addEventListener('click', () => {
  lbGoTo(lbCurrent === lbImages.length - 1 ? 0 : lbCurrent + 1);
});
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lbPrev.click();
  if (e.key === 'ArrowRight') lbNext.click();
});

// Video play buttons
document.querySelectorAll('.carousel-play').forEach(btn => {
  btn.addEventListener('click', () => {
    const videoUrl = btn.getAttribute('data-video');
    lightbox.querySelectorAll('img, iframe').forEach(el => el.remove());
    const iframe = document.createElement('iframe');
    iframe.src = videoUrl;
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('allow', 'autoplay');
    lightbox.appendChild(iframe);
    lbImages = [];
    lbPrev.style.display = 'none';
    lbNext.style.display = 'none';
    lightbox.classList.add('open');
  });
});

// Carousels
document.querySelectorAll('.carousel').forEach(carousel => {
  const images = carousel.querySelectorAll('img');
  const dotsContainer = carousel.querySelector('.carousel-dots');
  const prevBtn = carousel.querySelector('.prev');
  const nextBtn = carousel.querySelector('.next');

  // Add expand button
  const expandBtn = document.createElement('button');
  expandBtn.classList.add('carousel-expand');
  expandBtn.setAttribute('aria-label', 'View full size');
  expandBtn.innerHTML = '&#x26F6;';
  carousel.appendChild(expandBtn);

  // Hide arrows and dots if only one image
  if (images.length <= 1) {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    dotsContainer.style.display = 'none';
    if (images.length === 1) images[0].classList.add('active');
    return;
  }

  // Make sure only the first image is active
  images.forEach((img, i) => {
    if (i === 0) img.classList.add('active');
    else img.classList.remove('active');
  });

  // Create dots
  images.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.classList.add('carousel-dot');
    if (i === 0) dot.classList.add('active');
    dot.setAttribute('aria-label', 'Go to image ' + (i + 1));
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('.carousel-dot');
  let current = 0;

  function goTo(index) {
    images[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = index;
    images[current].classList.add('active');
    dots[current].classList.add('active');
  }

  prevBtn.addEventListener('click', () => {
    goTo(current === 0 ? images.length - 1 : current - 1);
  });

  nextBtn.addEventListener('click', () => {
    goTo(current === images.length - 1 ? 0 : current + 1);
  });

  expandBtn.addEventListener('click', () => {
    openLightbox(carousel, current);
  });
});

// Section title typing + squiggle animations
const sectionTitles = document.querySelectorAll('.section-title');

// Store original text and clear spans
sectionTitles.forEach(title => {
  const span = title.querySelector('span');
  if (!span) return;
  span.dataset.text = span.textContent;
  span.textContent = '';
});

function typeText(span, callback) {
  const text = span.dataset.text;
  let i = 0;
  span.classList.add('typing-cursor');

  const speed = text.length <= 5 ? 180 : 120;
  const interval = setInterval(() => {
    span.textContent += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(interval);
      span.classList.remove('typing-cursor');
      if (callback) callback();
    }
  }, speed);
  span.dataset.intervalId = interval;
}

const titleObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const span = entry.target.querySelector('span');
    if (!span) return;

    if (entry.isIntersecting) {
      // Clear any in-progress typing
      if (span.dataset.intervalId) clearInterval(Number(span.dataset.intervalId));
      span.textContent = '';
      span.classList.add('typed');
      typeText(span, () => {});
    } else {
      // Reset when scrolled away
      if (span.dataset.intervalId) clearInterval(Number(span.dataset.intervalId));
      span.textContent = '';
      span.classList.remove('typed', 'typing-cursor');
    }
  });
}, { threshold: 0.5 });

sectionTitles.forEach(title => titleObserver.observe(title));

// Writing modals
document.querySelectorAll('.writing-link[data-modal]').forEach(btn => {
  btn.addEventListener('click', () => {
    const modal = document.getElementById(btn.getAttribute('data-modal'));
    if (modal) modal.classList.add('open');
  });
});

document.querySelectorAll('.writing-modal').forEach(modal => {
  modal.querySelector('.writing-modal-close').addEventListener('click', () => {
    modal.classList.remove('open');
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.writing-modal.open').forEach(m => m.classList.remove('open'));
  }
});
