// lightbox.js
(function () {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');

  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let isDragging = false;
  let startX = 0, startY = 0;
  let startTranslateX = 0, startTranslateY = 0;

  const MIN_SCALE = 1;
  const MAX_SCALE = 5;

  function applyTransform() {
    lightboxImg.style.transform =
      `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }

  function resetState() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    applyTransform();
  }

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    resetState();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightboxImg.src = '';
    resetState();
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.zoomable').forEach(img => {
    img.addEventListener('click', () => openLightbox(img.src, img.alt));
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });

  lightbox.addEventListener('wheel', (e) => {
    if (!lightbox.classList.contains('active')) return;
    e.preventDefault();

    const delta = -e.deltaY * 0.0015;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale + delta * scale));

    const rect = lightboxImg.getBoundingClientRect();
    const cx = e.clientX - (rect.left + rect.width / 2);
    const cy = e.clientY - (rect.top + rect.height / 2);

    const ratio = newScale / scale;
    translateX = cx - (cx - translateX) * ratio;
    translateY = cy - (cy - translateY) * ratio;
    scale = newScale;

    if (scale === MIN_SCALE) { translateX = 0; translateY = 0; }
    applyTransform();
  }, { passive: false });

  lightboxImg.addEventListener('mousedown', (e) => {
    if (scale <= 1) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startTranslateX = translateX;
    startTranslateY = translateY;
    lightboxImg.classList.add('dragging');
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    translateX = startTranslateX + (e.clientX - startX);
    translateY = startTranslateY + (e.clientY - startY);
    applyTransform();
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    lightboxImg.classList.remove('dragging');
  });

  let touchStartDist = 0;
  let touchStartScale = 1;

  lightboxImg.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1 && scale > 1) {
      isDragging = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTranslateX = translateX;
      startTranslateY = translateY;
    } else if (e.touches.length === 2) {
      touchStartDist = getDistance(e.touches[0], e.touches[1]);
      touchStartScale = scale;
    }
  }, { passive: true });

  lightboxImg.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = getDistance(e.touches[0], e.touches[1]);
      scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE,
        touchStartScale * (dist / touchStartDist)));
      if (scale === MIN_SCALE) { translateX = 0; translateY = 0; }
      applyTransform();
    } else if (isDragging && e.touches.length === 1) {
      translateX = startTranslateX + (e.touches[0].clientX - startX);
      translateY = startTranslateY + (e.touches[0].clientY - startY);
      applyTransform();
    }
  }, { passive: false });

  lightboxImg.addEventListener('touchend', () => { isDragging = false; });

  function getDistance(t1, t2) {
    return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
  }
})();