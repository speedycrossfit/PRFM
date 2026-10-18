function initializeAppDemo(root) {
  const video = root.querySelector('video');
  const status = root.querySelector('.program-demo-status');
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = !('IntersectionObserver' in window);
  let blocked = false;
  let failed = false;
  let pending = false;
  let attempt = 0;

  video.muted = true;
  video.defaultMuted = true;
  video.controls = false;

  const canPlay = () => visible && !document.hidden && !blocked && !failed && !preference.matches;

  const render = () => {
    const playing = !video.paused && !failed;
    root.classList.toggle('is-playing', playing);
    root.classList.toggle('is-static', failed || blocked || preference.matches);
    status.hidden = !failed;
  };

  const update = () => {
    if (!canPlay()) {
      attempt++;
      pending = false;
      video.pause();
      render();
      return;
    }
    if (pending || !video.paused) {
      render();
      return;
    }
    pending = true;
    const currentAttempt = ++attempt;
    render();
    // Browsers that reject autoplay keep the static poster, without adding controls.
    Promise.resolve(video.play()).then(() => {
      if (currentAttempt !== attempt) return;
      pending = false;
      if (!canPlay()) video.pause();
      render();
    }).catch(() => {
      if (currentAttempt !== attempt) return;
      pending = false;
      if (canPlay()) {
        blocked = true;
        video.pause();
      }
      render();
    });
  };

  video.addEventListener('playing', () => {
    root.classList.add('has-played');
    if (!canPlay()) video.pause();
    render();
  });
  video.addEventListener('pause', render);
  video.addEventListener('error', () => {
    failed = true;
    update();
  });
  const source = video.querySelector('source');
  if (source) source.addEventListener('error', () => {
    failed = true;
    update();
  });

  video.addEventListener('volumechange', () => {
    if (!video.muted) video.muted = true;
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      update();
    }, { threshold: 0.2 }).observe(root);
  }
  document.addEventListener('visibilitychange', update);
  preference.addEventListener('change', update);
  update();
}

document.querySelectorAll('[data-app-demo]').forEach(initializeAppDemo);
