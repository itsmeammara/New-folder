/**
 * STRATAFORM — Architectural Engineering & Development
 * Ultra-Modern Multi-Page 3D Architectural Web Application
 * 
 * 1. 0% Scroll Restoration & Immediate Viewport Reset
 * 2. In-Memory 225-Frame Preloader & Canvas Cover Renderer (Instant Frame 1 Paint)
 * 3. 800vh Hero Construction Canvas Scrubbing with GSAP ScrollTrigger + Rect Fallback + Video Fallback
 * 4. Lenis Smooth Inertial Scroll & GSAP ScrollTrigger Integration
 * 5. 3D Structural Engineering Rig (Standard Non-Pinned Interactive Three.js Lab)
 * 6. Kinetic Velocity Marquee (Scroll-Accelerated Ticker)
 * 7. Portfolio Filters, 3D Perspective Tilt & Curtain Image Reveals
 * 8. Rolling Slot-Machine Odometer Metrics (Work Page)
 * 9. Before / After Spatial Transformation Split Slider (Blueprint Page)
 * 10. Multi-Step Interactive Project Scale & Tonnage Estimator (Inquire Page)
 * 11. Global UI: Navigation, Full-Screen Glass Mobile Drawer, Precision Cursor, Clocks & Magnetic Buttons
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. Force Clean 0% Scroll Restoration on Load & Refresh
  // ==========================================================================
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  // Identify current page context
  const currentPage = (document.body && document.body.dataset && document.body.dataset.page) || (function () {
    const p = window.location.pathname.toLowerCase();
    if (p.includes('work')) return 'work';
    if (p.includes('blueprint')) return 'blueprint';
    if (p.includes('process')) return 'process';
    if (p.includes('studio')) return 'studio';
    if (p.includes('inquire')) return 'inquire';
    return 'home';
  })();

  // ==========================================================================
  // 2. In-Memory 225-Frame Preloader & Canvas Cover Renderer
  // ==========================================================================
  const TOTAL_FRAMES = 225;
  const frameImages = new Array(TOTAL_FRAMES);
  let loadedFramesCount = 0;
  let lastDrawnIndex = -1;
  let currentFrameIndex = 0;
  let isPreloaderDismissed = false;

  const preloader = document.getElementById('preloader');
  const preloaderPercentage = document.getElementById('preloader-percentage');
  const heroCanvas = document.getElementById('hero-canvas');
  const heroVideo = document.getElementById('hero-video');
  let heroCtx = null;
  if (heroCanvas) {
    heroCtx = heroCanvas.getContext('2d', { alpha: false });
  }

  function resizeCanvas() {
    if (!heroCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth || document.documentElement.clientWidth || 1920;
    const h = window.innerHeight || document.documentElement.clientHeight || 1080;
    heroCanvas.width = w * dpr;
    heroCanvas.height = h * dpr;
    heroCanvas.style.width = `${w}px`;
    heroCanvas.style.height = `${h}px`;
    if (heroCtx) {
      heroCtx.imageSmoothingEnabled = true;
      heroCtx.imageSmoothingQuality = 'high';
    }
    renderCurrentFrame(true);
    if (window.ScrollTrigger) {
      try { window.ScrollTrigger.refresh(); } catch (e) {}
    }
  }
  window.addEventListener('resize', resizeCanvas);

  function drawImageCover(ctx, source, canvasWidth, canvasHeight) {
    if (!ctx || !source) return;
    const sW = source.naturalWidth || source.videoWidth || source.width;
    const sH = source.naturalHeight || source.videoHeight || source.height;
    if (!sW || !sH || !canvasWidth || !canvasHeight) return;

    const hRatio = canvasWidth / sW;
    const vRatio = canvasHeight / sH;
    const ratio = Math.max(hRatio, vRatio);

    const centerShiftX = (canvasWidth - sW * ratio) / 2;
    const centerShiftY = (canvasHeight - sH * ratio) / 2;

    ctx.drawImage(source, 0, 0, sW, sH, centerShiftX, centerShiftY, sW * ratio, sH * ratio);
  }

  function getNearestLoadedFrame(targetIdx) {
    const clampedIdx = Math.min(TOTAL_FRAMES - 1, Math.max(0, targetIdx));
    // 1. Check exact target frame
    if (frameImages[clampedIdx] && frameImages[clampedIdx].complete && frameImages[clampedIdx].naturalWidth > 0) {
      return frameImages[clampedIdx];
    }
    // 2. Search backward for closest decoded frame
    for (let i = clampedIdx - 1; i >= 0; i--) {
      if (frameImages[i] && frameImages[i].complete && frameImages[i].naturalWidth > 0) {
        return frameImages[i];
      }
    }
    // 3. Search forward for closest decoded frame
    for (let i = clampedIdx + 1; i < TOTAL_FRAMES; i++) {
      if (frameImages[i] && frameImages[i].complete && frameImages[i].naturalWidth > 0) {
        return frameImages[i];
      }
    }
    // 4. Guaranteed fallback to frame 1
    return (frameImages[0] && frameImages[0].naturalWidth > 0) ? frameImages[0] : null;
  }

  function renderCurrentFrame(force = false) {
    if (!heroCtx || !heroCanvas) return;
    if (!force && lastDrawnIndex === currentFrameIndex) return;

    const img = getNearestLoadedFrame(currentFrameIndex);
    if (img && img.complete && img.naturalWidth > 0) {
      drawImageCover(heroCtx, img, heroCanvas.width, heroCanvas.height);
      lastDrawnIndex = currentFrameIndex;
    } else if (heroVideo) {
      // Fallback video scrubbing if image frames are decoding/missing
      if (heroVideo.duration) {
        const targetTime = currentLerpProgress * heroVideo.duration;
        if (Math.abs(heroVideo.currentTime - targetTime) > 0.04) {
          heroVideo.currentTime = targetTime;
        }
      }
      if (heroVideo.readyState >= 2) {
        drawImageCover(heroCtx, heroVideo, heroCanvas.width, heroCanvas.height);
        lastDrawnIndex = currentFrameIndex;
      }
    }
  }

  function dismissPreloader() {
    if (isPreloaderDismissed) return;
    isPreloaderDismissed = true;

    // Remove any accidental overflow lock on body or html
    if (document.body) document.body.style.overflow = '';
    if (document.documentElement) document.documentElement.style.overflow = '';

    if (preloaderPercentage) {
      preloaderPercentage.textContent = '100%';
    }

    if (preloader) {
      preloader.classList.add('loaded');
      preloader.style.opacity = '0';
      preloader.style.visibility = 'hidden';
      preloader.style.pointerEvents = 'none';
    }

    if (lenis && typeof lenis.start === 'function') {
      lenis.start();
    }

    initSelfDrawingBlueprint();

    if (typeof window.ScrollTrigger !== 'undefined') {
      window.ScrollTrigger.refresh();
    }
  }

  // Prioritize loading frame_0001.jpg first for instant paint
  if (heroCanvas) {
    const frame1 = new Image();
    frame1.src = './frames/frame_0001.jpg';
    frameImages[0] = frame1;

    function onFrame1Ready() {
      loadedFramesCount++;
      if (preloaderPercentage) preloaderPercentage.textContent = '100%';
      resizeCanvas();
      if (heroCtx && heroCanvas) {
        drawImageCover(heroCtx, frame1, heroCanvas.width, heroCanvas.height);
        lastDrawnIndex = 0;
      }
      requestAnimationFrame(() => {
        setTimeout(dismissPreloader, 100);
      });
      loadRemainingFrames();
    }

    if (frame1.complete && frame1.naturalWidth > 0) {
      onFrame1Ready();
    } else {
      frame1.onload = onFrame1Ready;
      frame1.onerror = () => {
        console.warn('frame_0001.jpg error, attempting background loader & video fallback.');
        loadRemainingFrames();
        setTimeout(dismissPreloader, 400);
      };
    }

    // Safety fallback: guaranteed preloader dismissal within 1.5s
    setTimeout(dismissPreloader, 1500);

    function loadRemainingFrames() {
      for (let i = 2; i <= TOTAL_FRAMES; i++) {
        const idx = i - 1; // Index 1 to 224
        if (frameImages[idx]) continue;

        const img = new Image();
        const frameNum = String(i).padStart(4, '0');
        img.src = `./frames/frame_${frameNum}.jpg`;

        img.onload = () => {
          loadedFramesCount++;
          if (Math.abs(currentFrameIndex - idx) <= 1) {
            renderCurrentFrame(true);
          }
        };

        img.onerror = () => {
          loadedFramesCount++;
        };

        frameImages[idx] = img;
      }
    }

    resizeCanvas();
  } else {
    // Instant dismissal on pages without hero canvas
    if (document.readyState === 'complete') {
      setTimeout(dismissPreloader, 30);
    } else {
      window.addEventListener('load', () => setTimeout(dismissPreloader, 50));
    }
    setTimeout(dismissPreloader, 400);
  }

  // ==========================================================================
  // 3. Hero 800vh Canvas Scrubbing & Floating Corner Typography
  // ==========================================================================
  const heroScrollTrack = document.getElementById('hero-scroll-track');
  const hudPercent = document.getElementById('hud-percent');
  const heroProgressBar = document.getElementById('hero-progress-bar');

  const phase0 = document.getElementById('phase-0');
  const phase1 = document.getElementById('phase-1');
  const phase2 = document.getElementById('phase-2');
  const phase3 = document.getElementById('phase-3');

  let targetScrollProgress = 0;
  let currentLerpProgress = 0;

  // Set initial 0% state explicitly on load (Phase 0 active, others strictly inactive)
  if (hudPercent) hudPercent.textContent = '00%';
  if (heroProgressBar) heroProgressBar.style.width = '0%';

  if (phase0) phase0.classList.add('active');
  if (phase1) phase1.classList.remove('active');
  if (phase2) phase2.classList.remove('active');
  if (phase3) phase3.classList.remove('active');

  function calculateHeroScroll() {
    if (!heroScrollTrack) return 0;
    const rect = heroScrollTrack.getBoundingClientRect();
    const scrollableDist = heroScrollTrack.offsetHeight - window.innerHeight;
    if (scrollableDist <= 0) return 0;
    const progress = -rect.top / scrollableDist;
    return Math.max(0, Math.min(1, progress));
  }

  // Hook ScrollTrigger directly to #hero-scroll-track
  function initHeroScrollTrigger() {
    if (typeof window.ScrollTrigger !== 'undefined' && heroScrollTrack) {
      ScrollTrigger.create({
        trigger: '#hero-scroll-track',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          targetScrollProgress = self.progress;
        }
      });
    }
  }

  function heroRenderLoop() {
    try {
      if (heroScrollTrack) {
        // Dual calculation: computed rect as continuous backup to ScrollTrigger
        const computedRectProgress = calculateHeroScroll();
        if (typeof targetScrollProgress !== 'number' || isNaN(targetScrollProgress) || (computedRectProgress > 0 && Math.abs(targetScrollProgress - computedRectProgress) > 0.05)) {
          targetScrollProgress = computedRectProgress;
        }

        currentLerpProgress += (targetScrollProgress - currentLerpProgress) * 0.14;

        const targetIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(currentLerpProgress * (TOTAL_FRAMES - 1))));
        if (targetIndex !== currentFrameIndex || lastDrawnIndex !== targetIndex) {
          currentFrameIndex = targetIndex;
          renderCurrentFrame();
        }

        const pct = Math.round(currentLerpProgress * 100);

        if (hudPercent) hudPercent.textContent = `${String(pct).padStart(2, '0')}%`;
        if (heroProgressBar) heroProgressBar.style.width = `${pct}%`;

        // Strict mutual exclusivity: exactly one phase title active at any moment
        const activePhaseIndex = currentLerpProgress <= 0.23 ? 0 :
                                 (currentLerpProgress <= 0.51 ? 1 :
                                 (currentLerpProgress <= 0.78 ? 2 : 3));

        if (phase0) phase0.classList.toggle('active', activePhaseIndex === 0);
        if (phase1) phase1.classList.toggle('active', activePhaseIndex === 1);
        if (phase2) phase2.classList.toggle('active', activePhaseIndex === 2);
        if (phase3) phase3.classList.toggle('active', activePhaseIndex === 3);
      }
    } catch (err) {
      console.error('Error in heroRenderLoop:', err);
    }

    requestAnimationFrame(heroRenderLoop);
  }
  requestAnimationFrame(heroRenderLoop);

  // ==========================================================================
  // 4. Lenis Smooth Inertial Scrolling & GSAP Integration
  // ==========================================================================
  let lenis = null;
  if (typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false
    });

    if (typeof lenis.start === 'function') {
      lenis.start();
    }

    try {
      lenis.scrollTo(0, { immediate: true });
    } catch (e) {}

    // Dedicated requestAnimationFrame loop for Lenis
    function lenisRaf(time) {
      lenis.raf(time);
      requestAnimationFrame(lenisRaf);
    }
    requestAnimationFrame(lenisRaf);

    // Sync Lenis scroll with GSAP ScrollTrigger
    lenis.on('scroll', () => {
      if (typeof window.ScrollTrigger !== 'undefined') {
        ScrollTrigger.update();
      }
    });
  }

  // Ensure native window scroll also updates ScrollTrigger
  window.addEventListener('scroll', () => {
    if (typeof window.ScrollTrigger !== 'undefined') {
      window.ScrollTrigger.update();
    }
  }, { passive: true });

  // Force clean 0% scroll on DOMContentLoaded and Window Load
  document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);
    resizeCanvas();
    initHeroScrollTrigger();
    if (lenis) {
      if (typeof lenis.start === 'function') lenis.start();
      try { lenis.scrollTo(0, { immediate: true }); } catch (e) {}
    }
  });

  window.addEventListener('load', () => {
    window.scrollTo(0, 0);
    resizeCanvas();
    initHeroScrollTrigger();
    if (lenis) {
      if (typeof lenis.start === 'function') lenis.start();
      try { lenis.scrollTo(0, { immediate: true }); } catch (e) {}
    }
    setTimeout(() => {
      if (typeof window.ScrollTrigger !== 'undefined') {
        window.ScrollTrigger.refresh();
      }
    }, 120);
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      resizeCanvas();
      if (typeof window.ScrollTrigger !== 'undefined') {
        window.ScrollTrigger.refresh();
      }
    });
  }

  // Anchor smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          if (lenis) {
            lenis.scrollTo(targetElement, { offset: -60, duration: 1.3 });
          } else {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  });

  // ==========================================================================
  // 5. Self-Drawing Architectural Blueprint Lines & SVG Monogram Reveal
  // ==========================================================================
  function initSelfDrawingBlueprint() {
    if (!window.gsap) return;

    // Logo drafting pen reveal
    gsap.to('.logo-draw-path', {
      strokeDashoffset: 0,
      duration: 1.6,
      stagger: 0.18,
      ease: 'power3.out'
    });

    // Section headers drafting lines
    document.querySelectorAll('.section-header').forEach((header) => {
      const line = header.querySelector('.blueprint-drafting-line');
      if (window.ScrollTrigger) {
        ScrollTrigger.create({
          trigger: header,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            header.classList.add('revealed');
            if (line) {
              gsap.to(line, {
                strokeDashoffset: 0,
                duration: 1.4,
                ease: 'power2.inOut'
              });
            }
          }
        });
      }
    });
  }

  // ==========================================================================
  // 6. Kinetic Velocity Marquee (Smooth Scroll-Accelerated Ticker)
  // ==========================================================================
  function initVelocityMarquee() {
    const marqueeTrack = document.getElementById('marquee-track');
    if (!marqueeTrack) return;

    let marqueeX = 0;
    let marqueeSpeed = 1.0;

    function renderMarquee() {
      let scrollVel = 0;
      if (lenis && typeof lenis.velocity !== 'undefined') {
        scrollVel = lenis.velocity;
      }

      const targetSpeed = 1.0 + Math.min(Math.abs(scrollVel) * 0.22, 8.0);
      marqueeSpeed += (targetSpeed - marqueeSpeed) * 0.08;

      const direction = scrollVel < -0.5 ? -1 : 1;
      marqueeX += direction * marqueeSpeed;

      const singleWidth = marqueeTrack.scrollWidth / 2;
      if (singleWidth > 0) {
        if (marqueeX >= singleWidth) marqueeX -= singleWidth;
        if (marqueeX < 0) marqueeX += singleWidth;
        marqueeTrack.style.transform = `translate3d(-${marqueeX.toFixed(2)}px, 0, 0)`;
      }

      requestAnimationFrame(renderMarquee);
    }
    renderMarquee();
  }
  initVelocityMarquee();

  // ==========================================================================
  // 7. 3D Blueprint Rig: Standard Interactive Three.js Lab (No Scroll Locking)
  // ==========================================================================
  function initThreeBlueprintSystem() {
    const canvasContainer = document.getElementById('blueprint-canvas-container');
    if (!canvasContainer || typeof THREE === 'undefined') return;

    const width = canvasContainer.clientWidth || window.innerWidth;
    const height = canvasContainer.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08090C, 0.012);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
    camera.position.set(24, 18, 24);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    canvasContainer.innerHTML = '';
    canvasContainer.appendChild(renderer.domElement);

    let controls = null;
    let autoRotate = true;

    if (THREE.OrbitControls) {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxPolarAngle = Math.PI / 2 + 0.05;
      controls.minDistance = 8;
      controls.maxDistance = 80;
      controls.target.set(0, 8, 0);

      controls.addEventListener('start', () => {
        autoRotate = false;
        const btn = document.getElementById('toggle-autorotate');
        if (btn) btn.textContent = 'Orbit: OFF';
      });
    }

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight1 = new THREE.DirectionalLight(0xFFB84D, 2.0);
    dirLight1.position.set(20, 40, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00E5FF, 1.0);
    dirLight2.position.set(-20, 20, -20);
    scene.add(dirLight2);

    // Structural Groups
    const skeletonGroup = new THREE.Group();
    const mepGroup = new THREE.Group();
    const massingGroup = new THREE.Group();
    const tmdGroup = new THREE.Group();

    scene.add(skeletonGroup);
    scene.add(mepGroup);
    scene.add(massingGroup);
    scene.add(tmdGroup);

    // Bedrock Grid (-2 to -8m)
    const bedrockGrid = new THREE.GridHelper(32, 28, 0xFFB84D, 0x1E222D);
    bedrockGrid.position.y = -2;
    skeletonGroup.add(bedrockGrid);

    // Foundation Piles (-32M Depth)
    const pileGeo = new THREE.CylinderGeometry(0.28, 0.28, 10, 8);
    const bronzeWireMat = new THREE.MeshBasicMaterial({ color: 0xFFB84D, wireframe: true });
    [-5, -2.5, 2.5, 5].forEach((x) => {
      [-5, -2.5, 2.5, 5].forEach((z) => {
        const pile = new THREE.Mesh(pileGeo, bronzeWireMat);
        pile.position.set(x, -7, z);
        skeletonGroup.add(pile);
      });
    });

    // Central C90 Post-Tensioned Shear Core
    const coreGeo = new THREE.BoxGeometry(3.8, 27, 3.8);
    const coreEdges = new THREE.EdgesGeometry(coreGeo);
    const coreLine = new THREE.LineSegments(coreEdges, new THREE.LineBasicMaterial({ color: 0xFFB84D, linewidth: 2 }));
    coreLine.position.y = 11.5;
    skeletonGroup.add(coreLine);

    // Perimeter Structural Columns
    const colGeo = new THREE.CylinderGeometry(0.32, 0.45, 27, 6);
    [
      [-5, -5], [5, -5], [5, 5], [-5, 5],
      [0, -5.2], [0, 5.2], [-5.2, 0], [5.2, 0]
    ].forEach(([cx, cz]) => {
      const col = new THREE.Mesh(colGeo, bronzeWireMat);
      col.position.set(cx, 11.5, cz);
      skeletonGroup.add(col);
    });

    // Floor Plates (26 Levels with cantilever overhang at L12)
    const floorLevels = 26;
    for (let i = 0; i < floorLevels; i++) {
      const y = i * 0.98;
      const taper = 1 - (i / floorLevels) * 0.26;
      const slabW = 10.2 * taper;
      const slabMesh = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(slabW, 0.1, slabW)),
        new THREE.LineBasicMaterial({
          color: i % 4 === 0 ? 0xFFB84D : 0x7E8793,
          transparent: true,
          opacity: 0.8
        })
      );
      slabMesh.position.y = y;
      skeletonGroup.add(slabMesh);
    }

    // Cantilever Truss at Level 12 (+120M)
    const cantLine = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(5.4, 2.8, 4.2)),
      new THREE.LineBasicMaterial({ color: 0xFFB84D, linewidth: 2 })
    );
    cantLine.position.set(5.8, 11.7, 0);
    skeletonGroup.add(cantLine);

    // Mechanical & Electrical Risers (MEP)
    [-1.2, 0, 1.2].forEach((offset) => {
      const pts = [new THREE.Vector3(offset, -2, offset), new THREE.Vector3(offset, 26, offset)];
      const mepLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0xFF5A36, linewidth: 2 })
      );
      mepGroup.add(mepLine);
    });

    // Parametric Facade Massing Envelope
    const massingMat = new THREE.MeshPhysicalMaterial({
      color: 0x16181D,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.85,
      side: THREE.DoubleSide
    });
    const massingMesh = new THREE.Mesh(new THREE.CylinderGeometry(6.2, 8.5, 26, 4, 1, false, Math.PI / 4), massingMat);
    massingMesh.position.y = 11.5;
    massingGroup.add(massingMesh);

    // Summit 450T Tuned Mass Damper Sphere (Level 54 / +310M)
    const tmdGeo = new THREE.SphereGeometry(1.3, 32, 32);
    const tmdMat = new THREE.MeshStandardMaterial({
      color: 0xFFB84D,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0x332200,
      emissiveIntensity: 0.3
    });
    const tmdSphere = new THREE.Mesh(tmdGeo, tmdMat);
    tmdSphere.position.set(0, 24.8, 0);
    tmdGroup.add(tmdSphere);

    // Responsive Canvas Resize
    function resizeBlueprint() {
      if (!canvasContainer || !renderer || !camera) return;
      const w = canvasContainer.clientWidth;
      const h = canvasContainer.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      if (window.ScrollTrigger) {
        try { window.ScrollTrigger.refresh(); } catch (e) {}
      }
    }
    window.addEventListener('resize', resizeBlueprint);

    // Telemetry Coordinates for Hotspots
    const hotspotCoords = [
      new THREE.Vector3(0, -2, 4.8),    // 01 Bedrock Piles
      new THREE.Vector3(6.2, 11.7, 0),   // 02 Cantilever Truss
      new THREE.Vector3(-4.8, 17, 3.8),  // 03 Diagrid Nodes
      new THREE.Vector3(0, 24.8, 0)      // 04 450T Summit TMD
    ];

    function updateHotspots() {
      if (!canvasContainer || !camera) return;
      const w = canvasContainer.clientWidth;
      const h = canvasContainer.clientHeight;

      hotspotCoords.forEach((coord, i) => {
        const pin = document.getElementById(`hotspot-pin-${i}`);
        if (!pin) return;
        const v = coord.clone().project(camera);

        if (v.z > 1) {
          pin.style.display = 'none';
          return;
        }
        pin.style.display = 'flex';
        pin.style.left = `${(v.x * 0.5 + 0.5) * w}px`;
        pin.style.top = `${(-(v.y * 0.5) + 0.5) * h}px`;
      });
    }

    // Continuous Animation Loop for Interactive Rig
    const clock = new THREE.Clock();

    function interactiveLabLoop() {
      requestAnimationFrame(interactiveLabLoop);
      const elapsedTime = clock.getElapsedTime();

      if (autoRotate && controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.8;
      } else if (controls) {
        controls.autoRotate = false;
      }
      if (controls) controls.update();

      // Harmonic TMD oscillation
      if (tmdSphere) {
        tmdSphere.position.x = Math.sin(elapsedTime * 1.6) * 0.42;
        tmdSphere.position.z = Math.cos(elapsedTime * 1.2) * 0.35;
      }

      updateHotspots();
      renderer.render(scene, camera);
    }
    interactiveLabLoop();

    // Layer Toggles
    document.querySelectorAll('.layer-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.layer-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const layer = btn.getAttribute('data-layer');
        if (!skeletonGroup || !mepGroup || !massingGroup || !tmdGroup) return;

        if (layer === 'all') {
          skeletonGroup.visible = true; mepGroup.visible = true; massingGroup.visible = true; tmdGroup.visible = true;
        } else if (layer === 'skeleton') {
          skeletonGroup.visible = true; mepGroup.visible = false; massingGroup.visible = false; tmdGroup.visible = true;
        } else if (layer === 'mep') {
          skeletonGroup.visible = false; mepGroup.visible = true; massingGroup.visible = false; tmdGroup.visible = false;
        } else if (layer === 'massing') {
          skeletonGroup.visible = false; mepGroup.visible = false; massingGroup.visible = true; tmdGroup.visible = true;
        }
      });
    });

    // Camera Presets
    document.querySelectorAll('.preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.id === 'toggle-autorotate') return;
        document.querySelectorAll('.preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const preset = btn.getAttribute('data-preset');
        if (!camera || !controls || !window.gsap) return;

        autoRotate = false;
        const autoRotateBtn = document.getElementById('toggle-autorotate');
        if (autoRotateBtn) autoRotateBtn.textContent = 'Orbit: OFF';

        let targetPos = { x: 24, y: 18, z: 24 };
        let targetLook = { x: 0, y: 8, z: 0 };

        if (preset === 'perspective') { targetPos = { x: 24, y: 18, z: 24 }; targetLook = { x: 0, y: 8, z: 0 }; }
        else if (preset === 'foundation') { targetPos = { x: 14, y: -1, z: 14 }; targetLook = { x: 0, y: -2, z: 0 }; }
        else if (preset === 'cantilever') { targetPos = { x: 16, y: 12, z: 10 }; targetLook = { x: 5.5, y: 11.4, z: 0 }; }
        else if (preset === 'tmd') { targetPos = { x: 8, y: 26, z: 8 }; targetLook = { x: 0, y: 24.8, z: 0 }; }

        gsap.to(camera.position, { x: targetPos.x, y: targetPos.y, z: targetPos.z, duration: 1.2, ease: 'power2.inOut' });
        gsap.to(controls.target, { x: targetLook.x, y: targetLook.y, z: targetLook.z, duration: 1.2, ease: 'power2.inOut' });
      });
    });

    // Orbit Toggle
    const autoRotateBtn = document.getElementById('toggle-autorotate');
    if (autoRotateBtn) {
      autoRotateBtn.addEventListener('click', () => {
        autoRotate = !autoRotate;
        autoRotateBtn.textContent = autoRotate ? 'Orbit: ON' : 'Orbit: OFF';
      });
    }

    // Hotspot Pins & Telemetry Drawer
    const hotspotDrawer = document.getElementById('hotspot-drawer') || document.getElementById('hotspot-spec-drawer');
    const closeHsBtn = document.getElementById('close-hotspot-drawer');

    document.querySelectorAll('.blueprint-hotspot').forEach((pin, idx) => {
      pin.addEventListener('click', () => {
        if (hotspotDrawer) {
          hotspotDrawer.classList.add('open');
          if (window.innerWidth <= 768 && lenis && typeof lenis.stop === 'function') {
            lenis.stop();
          }
        }
        if (camera && controls && window.gsap && hotspotCoords[idx]) {
          gsap.to(controls.target, {
            x: hotspotCoords[idx].x,
            y: hotspotCoords[idx].y,
            z: hotspotCoords[idx].z,
            duration: 1
          });
          autoRotate = false;
          if (autoRotateBtn) autoRotateBtn.textContent = 'Orbit: OFF';
        }
      });
    });

    if (closeHsBtn && hotspotDrawer) {
      closeHsBtn.addEventListener('click', () => {
        hotspotDrawer.classList.remove('open');
        if (lenis && typeof lenis.start === 'function') {
          lenis.start();
        }
      });
    }
  }

  window.addEventListener('load', () => setTimeout(initThreeBlueprintSystem, 180));

  // ==========================================================================
  // 8. Portfolio Filters, 3D Tilt & Curtain Image Reveals
  // ==========================================================================
  function initPortfolio() {
    const cards = document.querySelectorAll('.project-card');
    if (cards.length === 0) return;

    // Curtain Image Reveal via GSAP ScrollTrigger
    if (window.gsap && window.ScrollTrigger) {
      cards.forEach((card) => {
        const curtain = card.querySelector('.card-curtain-reveal');
        const img = card.querySelector('.project-card-media img');

        if (curtain && img) {
          ScrollTrigger.create({
            trigger: card,
            start: 'top 85%',
            once: true,
            onEnter: () => {
              gsap.to(curtain, {
                clipPath: 'inset(0% 0 0 0)',
                duration: 1.2,
                ease: 'power3.inOut'
              });
              gsap.to(img, {
                scale: 1,
                duration: 1.4,
                ease: 'power3.out'
              });
            }
          });
        }
      });
    }

    // Mouse-Driven 3D Tilt with Specular Glare
    cards.forEach((card) => {
      const glare = card.querySelector('.project-card-glare');
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1000px) rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg) translateY(-6px) scale3d(1.02, 1.02, 1.02)`;
        if (glare) {
          glare.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255, 184, 77, 0.28) 0%, transparent 65%)`;
        }
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)';
      });
    });

    // Category Filter Buttons (work.html)
    document.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.getAttribute('data-filter');
        cards.forEach((card) => {
          const cat = card.getAttribute('data-category');
          card.style.display = (f === 'all' || cat === f) ? 'block' : 'none';
        });
        if (typeof window.ScrollTrigger !== 'undefined') window.ScrollTrigger.refresh();
      });
    });

    // ========================================================================
    // Complete PROJECTS_DATA Architectural Dossier Dictionary
    // ========================================================================
    const PROJECTS_DATA = {
      obsidian: {
        id: 'obsidian',
        code: 'STF-LDN // 01',
        title: 'The Obsidian Monolith',
        category: 'Commercial HQ',
        location: 'London, UK',
        year: '2025',
        storeys: '68 Storeys',
        height: '312 Meters',
        structuralSystem: 'External Steel Diagrid + Post-Tensioned C90 Shear Core',
        foundation: '38m Bored Bedrock Piles in London Clay',
        damping: 'Tuned Liquid Column Damper (TLCD)',
        glazing: 'Acoustic Triple-Glazed Low-E Cavity Curtain Wall',
        rating: 'LEED Platinum Certified',
        description: 'A 68-storey commercial landmark featuring an external diagrid that eliminates internal perimeter columns, affording uninterrupted 360-degree metropolitan panoramas over the City of London.',
        image: './assets/project-obsidian.jpg'
      },
      aura: {
        id: 'aura',
        code: 'STF-SIN // 02',
        title: 'Aura Sky Residence',
        category: 'Supertall Residential',
        location: 'Singapore',
        year: '2024',
        storeys: '74 Storeys',
        height: '280 Meters',
        structuralSystem: 'Aerodynamic Outrigger Frame + Central Slip-Form Core',
        foundation: '42m Barrette Piles Socketed into Bukit Timah Granite',
        damping: 'Biaxial Pendular Tuned Mass Damper (350T)',
        glazing: 'Solar-Responsive Ceramic Fritted Double Skin',
        rating: 'BCA Green Mark Platinum',
        description: 'Cascading biophilic sky-gardens anchored by a central post-tensioned shear core, engineered for equatorial seismic resilience and natural convective ventilation.',
        image: './assets/project-aura.jpg'
      },
      travertine: {
        id: 'travertine',
        code: 'STF-ZRH // 03',
        title: 'The Travertine Pavilion',
        category: 'Cultural Pavilion',
        location: 'Zurich, Switzerland',
        year: '2024',
        storeys: '12 Storeys',
        height: '52 Meters',
        structuralSystem: 'Monolithic Load-Bearing Travertine + Post-Tensioned Slabs',
        foundation: '24m Micropile Array with Geothermal Heat Exchangers',
        damping: 'Elastomeric Base-Isolation Bearing System',
        glazing: 'Museum-Spec Anti-Reflective Low-Iron Glazing',
        rating: 'Minergie-P Eco Certified',
        description: 'Monolithic blocks of Roman vein-cut travertine paired with knife-edge brushed bronze louvers overlooking Lake Zurich, achieving carbon-negative lifecycle performance.',
        image: './assets/project-travertine.jpg'
      },
      helix: {
        id: 'helix',
        code: 'STF-TYO // 04',
        title: 'Helix Cantilever Tower',
        category: 'Mixed-Use Cantilever',
        location: 'Tokyo, Japan',
        year: '2025',
        storeys: '54 Storeys',
        height: '245 Meters',
        structuralSystem: 'Megatruss Core + 24m Suspended Cantilever Ring',
        foundation: '48m Continuous Flight Auger Piles in Hard Diluvium',
        damping: 'Dual Semi-Active Magnetorheological Fluid Dampers',
        glazing: 'Dynamic Interlayer Acoustic Laminate Façade',
        rating: 'CASBEE S-Class // Level 4 Seismic Rated',
        description: 'A dramatic 24-meter suspended cantilever volume hovering over Roppongi, balanced by dual tuned liquid mass dampers and a redundant seismic megatruss.',
        image: './assets/project-helix.jpg'
      },
      solaris: {
        id: 'solaris',
        code: 'STF-DXB // 05',
        title: 'Solaris Financial Spire',
        category: 'Commercial Spire',
        location: 'Dubai, UAE',
        year: '2026',
        storeys: '92 Storeys',
        height: '420 Meters',
        structuralSystem: 'Vortex-Shedding Aerodynamic Concrete Shear Wall + Steel Crown',
        foundation: '65m Deep Friction Piles into Sandstone Bedrock',
        damping: 'Summit 450T Viscous Tuned Mass Damper Sphere',
        glazing: 'Triple Silver Low-E Thermal Solar Reflective Envelope',
        rating: 'LEED Zero Energy // Estidama 5 Pearl',
        description: 'Vortex-shedding aerodynamic tapering envelope reducing crosswind drag by 38% in the extreme Arabian Gulf thermal climate.',
        image: './assets/project-solaris.jpg'
      },
      zenith: {
        id: 'zenith',
        code: 'STF-NYC // 06',
        title: 'Zenith Supertall',
        category: 'Supertall Residential',
        location: 'New York, USA',
        year: '2026',
        storeys: '104 Storeys',
        height: '468 Meters',
        structuralSystem: 'High-Aspect-Ratio (1:18) C100 High-Strength Concrete Core',
        foundation: '40m High-Capacity Rock Sockets in Manhattan Mica Schist',
        damping: '600T Opposed Pendulum Tuned Mass Damper in Apex Crown',
        glazing: 'Floor-to-Ceiling Ultra-Clear Acoustic Glazing (STC 48)',
        rating: 'LEED Platinum // WELL Building Platinum',
        description: 'A slender 1:18 aspect-ratio pencil tower anchored by 40-meter bored bedrock sockets in Manhattan mica schist, capped by private full-floor sky residences.',
        image: './assets/project-zenith.jpg'
      }
    };

    // Project Dossier Modal Population & Display
    const projectModal = document.getElementById('project-modal');
    const closeM1 = document.getElementById('close-modal-btn');
    const closeM2 = document.getElementById('close-modal-btn-2');

    function populateAndOpenModal(projectId) {
      if (!projectModal) return;
      const data = PROJECTS_DATA[projectId] || PROJECTS_DATA['obsidian'];

      const modalCode = document.getElementById('modal-project-code');
      const modalTitle = document.getElementById('modal-project-title');
      const modalLocation = document.getElementById('modal-project-location');
      const modalImg = document.getElementById('modal-project-img');
      const modalDesc = document.getElementById('modal-project-desc');
      const modalSystem = document.getElementById('modal-spec-system');
      const modalFoundation = document.getElementById('modal-spec-foundation');
      const modalDamping = document.getElementById('modal-spec-damping');
      const modalGlazing = document.getElementById('modal-spec-glazing');
      const modalHeight = document.getElementById('modal-spec-height');
      const modalLeed = document.getElementById('modal-spec-leed');

      if (modalCode) modalCode.textContent = `${data.code} // ${data.category.toUpperCase()}`;
      if (modalTitle) modalTitle.textContent = data.title;
      if (modalLocation) modalLocation.textContent = `${data.location.toUpperCase()} • ${data.storeys.toUpperCase()} • COMMISSIONED ${data.year}`;
      if (modalImg) {
        modalImg.src = data.image;
        modalImg.alt = data.title;
      }
      if (modalDesc) modalDesc.textContent = data.description;
      if (modalSystem) modalSystem.textContent = data.structuralSystem;
      if (modalFoundation) modalFoundation.textContent = data.foundation;
      if (modalDamping) modalDamping.textContent = data.damping;
      if (modalGlazing) modalGlazing.textContent = data.glazing;
      if (modalHeight) modalHeight.textContent = `${data.storeys} // ${data.height}`;
      if (modalLeed) modalLeed.textContent = data.rating;

      projectModal.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (lenis && typeof lenis.stop === 'function') {
        lenis.stop();
      }

      // Tactile GSAP Card Pop
      const modalCard = projectModal.querySelector('.project-modal-card');
      if (window.gsap && modalCard) {
        gsap.fromTo(modalCard,
          { opacity: 0, scale: 0.94, y: 24 },
          { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'power3.out' }
        );
      }
    }

    // Event Delegation: reads dataset.projectId from either card or inner button
    cards.forEach((card) => {
      card.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-project-id]') || card;
        const projectId = trigger.getAttribute('data-project-id') || card.getAttribute('data-project-id');
        if (projectId && PROJECTS_DATA[projectId]) {
          populateAndOpenModal(projectId);
        }
      });
    });

    function closeModal() {
      if (projectModal) {
        projectModal.classList.remove('open');
        document.body.style.overflow = '';
        if (lenis && typeof lenis.start === 'function') {
          lenis.start();
        }
      }
    }

    if (closeM1) closeM1.addEventListener('click', closeModal);
    if (closeM2) closeM2.addEventListener('click', closeModal);
    if (projectModal) {
      projectModal.addEventListener('click', (e) => {
        if (e.target === projectModal) closeModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && projectModal && projectModal.classList.contains('open')) {
        closeModal();
      }
    });
  }
  initPortfolio();

  // ==========================================================================
  // 9. Rolling Slot-Machine Odometer Metrics (work.html)
  // ==========================================================================
  function initSlotMachineOdometers() {
    const metricsSection = document.getElementById('metrics-section');
    if (!metricsSection || !window.ScrollTrigger || !window.gsap) return;

    ScrollTrigger.create({
      trigger: metricsSection,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        document.querySelectorAll('.odometer-digit-strip').forEach((strip, index) => {
          const totalDigits = strip.children.length;
          const targetIndex = totalDigits - 1;
          const targetShift = (targetIndex / totalDigits) * 100;

          gsap.to(strip, {
            y: `-${targetShift}%`,
            duration: 1.8 + index * 0.15,
            ease: 'power3.out',
            delay: index * 0.08
          });
        });
      }
    });
  }
  initSlotMachineOdometers();

  // ==========================================================================
  // 10. Before / After Spatial Transformation Split Slider (blueprint.html)
  // ==========================================================================
  function initComparisonSlider() {
    const comparisonSlider = document.getElementById('comparison-slider');
    const sliderBeforeLayer = document.getElementById('slider-before-layer');
    const sliderHandle = document.getElementById('slider-handle');
    const presetBtns = document.querySelectorAll('.slider-preset-btn');
    if (!comparisonSlider) return;

    let isDraggingSlider = false;

    const beforeImg = sliderBeforeLayer ? sliderBeforeLayer.querySelector('img') : null;

    function syncSliderWidth() {
      if (comparisonSlider && beforeImg) {
        beforeImg.style.width = `${comparisonSlider.clientWidth}px`;
      }
    }
    syncSliderWidth();
    window.addEventListener('resize', syncSliderWidth);

    function updateSlider(percent) {
      const clamped = Math.max(0, Math.min(100, percent));
      if (sliderBeforeLayer) sliderBeforeLayer.style.width = `${clamped}%`;
      if (sliderHandle) sliderHandle.style.left = `${clamped}%`;
    }

    function handleSlider(e) {
      const rect = comparisonSlider.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const percent = ((clientX - rect.left) / rect.width) * 100;
      updateSlider(percent);
    }

    comparisonSlider.addEventListener('mousedown', (e) => {
      isDraggingSlider = true;
      handleSlider(e);
    });
    window.addEventListener('mousemove', (e) => {
      if (isDraggingSlider) handleSlider(e);
    });
    window.addEventListener('mouseup', () => { isDraggingSlider = false; });

    comparisonSlider.addEventListener('touchstart', (e) => {
      isDraggingSlider = true;
      handleSlider(e);
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (isDraggingSlider) handleSlider(e);
    }, { passive: true });
    window.addEventListener('touchend', () => { isDraggingSlider = false; });

    presetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        presetBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const target = parseFloat(btn.getAttribute('data-pos') || btn.getAttribute('data-split') || '50');
        updateSlider(target);
      });
    });
  }
  initComparisonSlider();

  // ==========================================================================
  // 11. Multi-Step Interactive Project Scale & Tonnage Estimator (inquire.html)
  // ==========================================================================
  function initProjectEstimatorPage() {
    const formContainer = document.getElementById('estimator-page-form');
    if (!formContainer) return;

    let curStep = 1;
    let selectedFactor = 1.2;
    let isTransitioning = false;

    const sInd1 = document.getElementById('step-ind-1');
    const sInd2 = document.getElementById('step-ind-2');
    const sInd3 = document.getElementById('step-ind-3');

    const sCnt1 = document.getElementById('step-content-1');
    const sCnt2 = document.getElementById('step-content-2');
    const sCnt3 = document.getElementById('step-content-3');

    const bPrev = document.getElementById('btn-step-prev');
    const bNext = document.getElementById('btn-step-next');
    const nextLbl = document.getElementById('next-label');

    const inSqft = document.getElementById('input-sqft');
    const valSqft = document.getElementById('val-sqft');
    const inStoreys = document.getElementById('input-storeys');
    const valStoreys = document.getElementById('val-storeys');

    const calcSteel = document.getElementById('calc-steel');
    const calcConcrete = document.getElementById('calc-concrete');
    const calcTimeline = document.getElementById('calc-timeline');
    const calcTier = document.getElementById('calc-tier');

    const successBox = document.getElementById('inquiry-success-box');
    const navActions = document.getElementById('estimator-nav-actions');
    const progressFill = document.getElementById('steps-progress-fill');
    const breadcrumbs = document.querySelector('.estimator-steps-breadcrumb');

    // Metric Bars
    const barSteel = document.getElementById('bar-steel');
    const barConcrete = document.getElementById('bar-concrete');
    const barTimeline = document.getElementById('bar-timeline');
    const barTier = document.getElementById('bar-tier');

    // Number tweening state for smooth GSAP countup
    const currentMetrics = {
      steel: 8400,
      concrete: 22500
    };

    // ------------------------------------------------------------------------
    // 1. Staggered GSAP Entrance Choreography (On Load)
    // ------------------------------------------------------------------------
    if (window.gsap) {
      const heroTitle = document.querySelector('.page-hero-title');
      const heroBadges = document.querySelectorAll('.page-hero-stats .hero-stat-badge');
      const cards = formContainer.querySelectorAll('.typology-card');

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (heroTitle) {
        tl.fromTo(
          heroTitle,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.65 }
        );
      }

      if (heroBadges && heroBadges.length) {
        tl.fromTo(
          heroBadges,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.65, stagger: 0.08 },
          '-=0.45'
        );
      }

      tl.fromTo(
        formContainer,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.65 },
        '-=0.45'
      );

      if (cards && cards.length) {
        tl.fromTo(
          cards,
          { opacity: 0, y: 24, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.65, stagger: 0.08 },
          '-=0.45'
        );
      }
    }

    // ------------------------------------------------------------------------
    // 2. Interactive Typology Card Hover (3D Tilt & Spotlight) & Selection Physics
    // ------------------------------------------------------------------------
    let selectedTypologyName = 'Supertall Residential';
    const typoCards = document.querySelectorAll('.typology-card');

    typoCards.forEach((card) => {
      // 3D Perspective Tilt & Cursor Spotlight Tracking (Desktop Hover Only)
      card.addEventListener('mousemove', (e) => {
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        // Limit tilt to max 4 degrees
        const rotX = ((y - centerY) / centerY) * -4;
        const rotY = ((x - centerX) / centerX) * 4;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        if (window.gsap) {
          gsap.to(card, {
            rotateX: rotX,
            rotateY: rotY,
            transformPerspective: 1000,
            duration: 0.25,
            ease: 'power1.out',
            overwrite: 'auto'
          });
        }
      });

      card.addEventListener('mouseleave', () => {
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        if (window.gsap) {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.45,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
      });

      // Active Selection Pulse (Spring Scale Pop & Border Glow Sweep)
      card.addEventListener('click', () => {
        typoCards.forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedFactor = parseFloat(card.getAttribute('data-factor') || '1.2');
        selectedTypologyName = card.querySelector('.typology-title')
          ? card.querySelector('.typology-title').textContent
          : (card.getAttribute('data-type') || 'Residential');

        // Spring scale pop: scale 0.98 -> 1.015 -> 1.0
        if (window.gsap) {
          const tl = gsap.timeline();
          tl.to(card, { scale: 0.98, duration: 0.1, ease: 'power2.out' })
            .to(card, { scale: 1.015, duration: 0.22, ease: 'back.out(2.5)' })
            .to(card, { scale: 1.0, duration: 0.18, ease: 'power2.out' });
        }

        updateCalculations();
      });
    });

    // ------------------------------------------------------------------------
    // 3. Live Slider & Tonnage Gauge Animations (Step 02 Rolling Numbers & Bars)
    // ------------------------------------------------------------------------
    function updateCalculations(immediate = false) {
      const sq = parseInt(inSqft ? inSqft.value : 250000, 10);
      const st = parseInt(inStoreys ? inStoreys.value : 48, 10);

      if (valSqft) valSqft.textContent = `${sq.toLocaleString()} SQ. FT.`;
      if (valStoreys) valStoreys.textContent = `${st} STOREYS`;

      // Structural Steel Tonnage Target
      const targetSteel = Math.round((sq / 1000) * 28 * selectedFactor);
      // High-Strength Concrete Target
      const targetConcrete = Math.round((sq / 1000) * 75);

      // Gauge Bar Widths
      const steelPct = Math.min(100, Math.max(12, Math.round((targetSteel / 42000) * 100)));
      const concretePct = Math.min(100, Math.max(12, Math.round((targetConcrete / 112500) * 100)));

      // Timeline Calculation
      let timelineText = '26 - 32 Months';
      let timelinePct = 50;
      if (st <= 24) {
        timelineText = '16 - 22 Months';
        timelinePct = 30;
      } else if (st <= 55) {
        timelineText = '26 - 32 Months';
        timelinePct = 60;
      } else {
        timelineText = '36 - 44 Months';
        timelinePct = 90;
      }
      if (calcTimeline) calcTimeline.textContent = timelineText;

      // Feasibility Tier
      let tierText = 'Tier 1 Landmark';
      let tierPct = 70;
      if (st >= 70) {
        tierText = 'Tier 1 Supertall Spire';
        tierPct = 95;
      } else if (st >= 40) {
        tierText = 'Tier 1 Landmark';
        tierPct = 70;
      } else {
        tierText = 'Class AAA Structure';
        tierPct = 45;
      }
      if (calcTier) calcTier.textContent = tierText;

      if (immediate || !window.gsap) {
        currentMetrics.steel = targetSteel;
        currentMetrics.concrete = targetConcrete;
        if (calcSteel) calcSteel.textContent = `${targetSteel.toLocaleString()} Tonnes`;
        if (calcConcrete) calcConcrete.textContent = `${targetConcrete.toLocaleString()} m³`;
        if (barSteel) barSteel.style.width = `${steelPct}%`;
        if (barConcrete) barConcrete.style.width = `${concretePct}%`;
        if (barTimeline) barTimeline.style.width = `${timelinePct}%`;
        if (barTier) barTier.style.width = `${tierPct}%`;
      } else {
        // Smooth rolling/tweening numbers (GSAP countup lerp)
        gsap.to(currentMetrics, {
          steel: targetSteel,
          concrete: targetConcrete,
          duration: 0.45,
          ease: 'power2.out',
          overwrite: 'auto',
          onUpdate: () => {
            if (calcSteel) calcSteel.textContent = `${Math.round(currentMetrics.steel).toLocaleString()} Tonnes`;
            if (calcConcrete) calcConcrete.textContent = `${Math.round(currentMetrics.concrete).toLocaleString()} m³`;
          }
        });

        // Dynamic horizontal gauge bars with smooth spring easing
        if (barSteel) gsap.to(barSteel, { width: `${steelPct}%`, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
        if (barConcrete) gsap.to(barConcrete, { width: `${concretePct}%`, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
        if (barTimeline) gsap.to(barTimeline, { width: `${timelinePct}%`, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
        if (barTier) gsap.to(barTier, { width: `${tierPct}%`, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
      }
    }

    if (inSqft) inSqft.addEventListener('input', () => updateCalculations(false));
    if (inStoreys) inStoreys.addEventListener('input', () => updateCalculations(false));
    updateCalculations(true);

    // ------------------------------------------------------------------------
    // 4. Animated Step Progress Bar & Directional Step Transitions (NEXT / BACK)
    // ------------------------------------------------------------------------
    function updateProgressLine(step) {
      if (!progressFill) return;
      let pct = '0%';
      if (step === 2) pct = '50%';
      if (step === 3) pct = '100%';
      if (window.gsap) {
        gsap.to(progressFill, { width: pct, duration: 0.55, ease: 'power3.out' });
      } else {
        progressFill.style.width = pct;
      }
    }

    function setStep(newStep, direction = 'next') {
      if (newStep === curStep || isTransitioning) return;
      isTransitioning = true;

      const stepElements = [sCnt1, sCnt2, sCnt3];
      const oldElement = stepElements[curStep - 1];
      const newElement = stepElements[newStep - 1];

      // Update indicator badges
      [sInd1, sInd2, sInd3].forEach((ind, idx) => {
        if (!ind) return;
        const stepNum = idx + 1;
        ind.classList.remove('active', 'completed');
        if (stepNum === newStep) {
          ind.classList.add('active');
        } else if (stepNum < newStep) {
          ind.classList.add('completed');
        }
      });

      // Update button text & visibility
      if (newStep === 1) {
        if (bPrev) bPrev.style.visibility = 'hidden';
        if (nextLbl) nextLbl.innerHTML = 'Next &rarr;';
      } else if (newStep === 2) {
        if (bPrev) bPrev.style.visibility = 'visible';
        if (nextLbl) nextLbl.innerHTML = 'Next &rarr;';
      } else if (newStep === 3) {
        if (bPrev) bPrev.style.visibility = 'visible';
        if (nextLbl) nextLbl.innerHTML = 'Transmit Inquiry &rarr;';
      }

      // Update animated progress fill
      updateProgressLine(newStep);

      // Directional slide & fade
      // 'next': old slides out to -40px (left), new slides in from +40px (right)
      // 'back': old slides out to +40px (right), new slides in from -40px (left)
      const exitX = direction === 'next' ? -40 : 40;
      const enterX = direction === 'next' ? 40 : -40;

      if (window.gsap && oldElement && newElement) {
        gsap.to(oldElement, {
          x: exitX,
          opacity: 0,
          duration: 0.28,
          ease: 'power2.in',
          onComplete: () => {
            oldElement.style.display = 'none';
            oldElement.classList.remove('active');

            newElement.style.display = 'block';
            newElement.classList.add('active');
            gsap.fromTo(
              newElement,
              { x: enterX, opacity: 0 },
              {
                x: 0,
                opacity: 1,
                duration: 0.45,
                ease: 'power3.out',
                onComplete: () => {
                  curStep = newStep;
                  isTransitioning = false;
                }
              }
            );
          }
        });
      } else {
        stepElements.forEach((el) => {
          if (el) {
            el.style.display = 'none';
            el.classList.remove('active');
          }
        });
        if (newElement) {
          newElement.style.display = 'block';
          newElement.classList.add('active');
        }
        curStep = newStep;
        isTransitioning = false;
      }
    }

    // Interactive Step Breadcrumbs Click
    if (sInd1) sInd1.addEventListener('click', () => { if (curStep > 1) setStep(1, 'back'); });
    if (sInd2) sInd2.addEventListener('click', () => {
      if (curStep < 2) setStep(2, 'next');
      else if (curStep > 2) setStep(2, 'back');
    });
    if (sInd3) sInd3.addEventListener('click', () => { if (curStep < 3) setStep(3, 'next'); });

    if (bPrev) {
      bPrev.addEventListener('click', () => {
        if (curStep > 1) setStep(curStep - 1, 'back');
      });
    }

    // ------------------------------------------------------------------------
    // 5. Submission & Animated Inquiry Dossier Card Reveal
    // ------------------------------------------------------------------------
    if (bNext) {
      bNext.addEventListener('click', () => {
        if (curStep < 3) {
          setStep(curStep + 1, 'next');
        } else {
          const nameInput = document.getElementById('client-name');
          const emailInput = document.getElementById('client-email');
          const orgInput = document.getElementById('client-org');
          const locationInput = document.getElementById('client-location');
          const notesInput = document.getElementById('client-notes');

          const name = nameInput ? nameInput.value.trim() : '';
          const email = emailInput ? emailInput.value.trim() : '';
          const org = orgInput ? orgInput.value.trim() : '';
          const loc = locationInput ? locationInput.value : 'Zurich HQ';
          const notes = notesInput ? notesInput.value.trim() : 'None provided';

          if (!name || !email || !org) {
            alert('Please complete your Principal Full Name, Organization, and Confidential Email before transmission.');
            return;
          }

          const refCode = `STF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
          const submissionRef = document.getElementById('submission-ref');
          if (submissionRef) submissionRef.textContent = refCode;

          const dossierLoc = document.getElementById('dossier-location');
          if (dossierLoc) dossierLoc.textContent = loc;

          const dossierTypo = document.getElementById('dossier-typology');
          if (dossierTypo) dossierTypo.textContent = selectedTypologyName;

          const sq = inSqft ? parseInt(inSqft.value, 10).toLocaleString() : '250,000';
          const st = inStoreys ? inStoreys.value : '48';
          const dossierScope = document.getElementById('dossier-scope');
          if (dossierScope) dossierScope.textContent = `${sq} SQ. FT. // ${st} STOREYS`;

          // Smooth morph & fade out of form inputs & navigation actions
          if (window.gsap) {
            gsap.to([sCnt1, sCnt2, sCnt3, navActions, breadcrumbs], {
              opacity: 0,
              y: -18,
              scale: 0.97,
              duration: 0.4,
              ease: 'power2.in',
              onComplete: () => {
                [sCnt1, sCnt2, sCnt3].forEach((c) => c && (c.style.display = 'none'));
                if (navActions) navActions.style.display = 'none';
                if (breadcrumbs) breadcrumbs.style.display = 'none';

                if (successBox) {
                  successBox.classList.add('active');
                  successBox.style.display = 'flex';
                  gsap.fromTo(
                    successBox,
                    { opacity: 0, y: 28, scale: 0.96 },
                    { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: 'power3.out' }
                  );

                  // Animated self-drawing SVG checkmark and compass seal
                  const circle = successBox.querySelector('.seal-draw-circle');
                  const check = successBox.querySelector('.seal-draw-check');
                  if (circle) gsap.to(circle, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.out' });
                  if (check) gsap.to(check, { strokeDashoffset: 0, duration: 0.8, delay: 0.45, ease: 'power2.out' });

                  // Staggered reveal of dossier metrics & ref code
                  const dossierCard = successBox.querySelector('.dossier-summary-card');
                  const dossierMetrics = successBox.querySelectorAll('.dossier-metric');
                  if (dossierCard) {
                    gsap.fromTo(
                      dossierCard,
                      { opacity: 0, y: 16 },
                      { opacity: 1, y: 0, duration: 0.5, delay: 0.3, ease: 'power2.out' }
                    );
                  }
                  if (submissionRef) {
                    gsap.fromTo(
                      submissionRef,
                      { opacity: 0, scale: 0.9 },
                      { opacity: 1, scale: 1, duration: 0.45, delay: 0.5, ease: 'back.out(2)' }
                    );
                  }
                  if (dossierMetrics.length) {
                    gsap.fromTo(
                      dossierMetrics,
                      { opacity: 0, y: 14 },
                      { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, delay: 0.6, ease: 'power2.out' }
                    );
                  }
                }
              }
            });
          } else {
            [sCnt1, sCnt2, sCnt3].forEach((c) => c && (c.style.display = 'none'));
            if (navActions) navActions.style.display = 'none';
            if (breadcrumbs) breadcrumbs.style.display = 'none';
            if (successBox) successBox.classList.add('active');
          }

          // Wire up copy ref code
          const copyRefBtn = document.getElementById('btn-copy-ref');
          const copyRefText = document.getElementById('copy-ref-text');
          if (copyRefBtn) {
            copyRefBtn.addEventListener('click', () => {
              navigator.clipboard.writeText(refCode).then(() => {
                if (copyRefText) copyRefText.textContent = 'COPIED ✓';
                setTimeout(() => { if (copyRefText) copyRefText.textContent = 'Copy Ref Code'; }, 2200);
              }).catch(() => {});
            });
          }

          // Wire up copy full technical dossier brief
          const copyBriefBtn = document.getElementById('btn-copy-brief');
          const copyBriefLbl = document.getElementById('btn-copy-brief-label');
          const briefText = `=====================================================
STRATAFORM ARCHITECTURAL COMMISSION DOSSIER
=====================================================
REFERENCE: ${refCode}
TIMESTAMP: ${new Date().toISOString()}
CLIENT: ${name} (${org})
EMAIL: ${email}
CONSULTATION SUITE: ${loc}
PRIMARY TYPOLOGY: ${selectedTypologyName}
PROJECT GFA: ${sq} SQ. FT.
TOTAL STOREYS: ${st}
STRUCTURAL STEEL: ${calcSteel ? calcSteel.textContent : '8,400 Tonnes'}
CONCRETE VOLUME: ${calcConcrete ? calcConcrete.textContent : '22,500 m³'}
TIMELINE HORIZON: ${calcTimeline ? calcTimeline.textContent : '26 - 32 Months'}
FEASIBILITY TIER: ${calcTier ? calcTier.textContent : 'Tier 1 Landmark'}
SPECIAL NOTES: ${notes}
ASSIGNED LEAD: Dr. Elena Vance, Partner in Charge
STATUS: REGISTERED // CONFIDENTIAL PARTNER OUTREACH < 4 HRS
=====================================================`;

          if (copyBriefBtn) {
            copyBriefBtn.addEventListener('click', () => {
              navigator.clipboard.writeText(briefText).then(() => {
                if (copyBriefLbl) copyBriefLbl.textContent = 'COPIED TO CLIPBOARD ✓';
                setTimeout(() => { if (copyBriefLbl) copyBriefLbl.textContent = 'Copy Technical Dossier Brief →'; }, 2400);
              }).catch(() => {});
            });
          }

          // Wire up download brief file
          const downloadBtn = document.getElementById('btn-download-brief');
          if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
              const blob = new Blob([briefText], { type: 'text/plain;charset=utf-8' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `${refCode}-STRATAFORM-DOSSIER.txt`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            });
          }
        }
      });
    }
  }
  initProjectEstimatorPage();

  // ==========================================================================
  // 12. Global UI: Navigation, Mobile Drawer, Precision Cursor, Clocks & Buttons
  // ==========================================================================
  function initGlobalNavigation() {
    // Active navigation highlight
    document.querySelectorAll('.nav-item').forEach((item) => {
      const navTarget = item.getAttribute('data-nav');
      if (navTarget === currentPage) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    document.querySelectorAll('.mobile-nav-link').forEach((link) => {
      const navTarget = link.getAttribute('data-nav');
      if (navTarget === currentPage) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Mobile Navigation Drawer Toggle
    const mobileToggle = document.getElementById('mobile-nav-toggle') || document.getElementById('mobile-toggle');
    const mobileDrawer = document.getElementById('mobile-nav-drawer');

    if (mobileToggle && mobileDrawer) {
      function toggleDrawer() {
        const isOpen = mobileDrawer.classList.contains('open');
        if (isOpen) {
          mobileDrawer.classList.remove('open');
          mobileToggle.classList.remove('open');
          mobileDrawer.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
          if (lenis && typeof lenis.start === 'function') lenis.start();
        } else {
          mobileDrawer.classList.add('open');
          mobileToggle.classList.add('open');
          mobileDrawer.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
          if (lenis && typeof lenis.stop === 'function') lenis.stop();
        }
      }

      mobileToggle.addEventListener('click', toggleDrawer);

      mobileDrawer.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          mobileDrawer.classList.remove('open');
          mobileToggle.classList.remove('open');
          mobileDrawer.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
          if (lenis && typeof lenis.start === 'function') lenis.start();
        });
      });

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
          mobileDrawer.classList.remove('open');
          mobileToggle.classList.remove('open');
          mobileDrawer.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
          if (lenis && typeof lenis.start === 'function') lenis.start();
        }
      });
    }

    // Navbar Scroll Progress & Styling
    const navbar = document.getElementById('main-navbar');
    const navScrollIndicator = document.getElementById('nav-scroll-indicator');

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;

      if (navScrollIndicator) navScrollIndicator.style.width = `${progress}%`;
      if (navbar) {
        if (scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
      }
    }, { passive: true });

    // Back to top button
    const backToTopBtn = document.getElementById('back-to-top-btn');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        if (lenis) lenis.scrollTo(0, { duration: 1.5 });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }
  initGlobalNavigation();

  // Precision Custom Cursor
  function initCustomCursor() {
    const cursorDot = document.getElementById('custom-cursor');
    const cursorFollower = document.getElementById('custom-cursor-follower');

    if (cursorDot && cursorFollower && window.matchMedia('(pointer: fine)').matches) {
      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      let followerX = mouseX;
      let followerY = mouseY;

      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      });

      function updateCursor() {
        followerX += (mouseX - followerX) * 0.18;
        followerY += (mouseY - followerY) * 0.18;
        cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
        requestAnimationFrame(updateCursor);
      }
      updateCursor();

      document.querySelectorAll('a, button, input, select, .project-card, .material-card, .blueprint-hotspot, .slider-handle, .typology-card').forEach((el) => {
        el.addEventListener('mouseenter', () => {
          cursorDot.classList.add('hovering');
          cursorFollower.classList.add('hovering');
        });
        el.addEventListener('mouseleave', () => {
          cursorDot.classList.remove('hovering');
          cursorFollower.classList.remove('hovering');
        });
      });
    }
  }
  initCustomCursor();

  // Live Global Office Clocks
  function initOfficeClocks() {
    const fmt = (tz) => new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
    function update() {
      try {
        const cz = document.getElementById('clock-zurich');
        const cl = document.getElementById('clock-london');
        const cn = document.getElementById('clock-newyork');
        const ct = document.getElementById('clock-tokyo');
        const cd = document.getElementById('clock-dubai');
        if (cz) cz.textContent = `${fmt('Europe/Zurich')} CET`;
        if (cl) cl.textContent = `${fmt('Europe/London')} GMT`;
        if (cn) cn.textContent = `${fmt('America/New_York')} EST`;
        if (ct) ct.textContent = `${fmt('Asia/Tokyo')} JST`;
        if (cd) cd.textContent = `${fmt('Asia/Dubai')} GST`;
      } catch (e) {}
    }
    update();
    setInterval(update, 1000);
  }
  initOfficeClocks();

  // Magnetic Buttons
  function initMagneticButtons() {
    if (!window.gsap || window.matchMedia('(pointer: coarse)').matches) return;

    const magneticElements = document.querySelectorAll('.magnetic-btn, .btn-primary, .btn-secondary, .btn-inquire, .btn-cyan, .corner-cta-link');

    magneticElements.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);

        gsap.to(btn, {
          x: x * 0.35,
          y: y * 0.35,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: 'elastic.out(1.1, 0.4)',
          overwrite: 'auto'
        });
      });
    });
  }
  initMagneticButtons();

  // ==========================================================================
  // 12. Universal Dynamic Resize Sync across all pages
  // ==========================================================================
  let globalResizeSyncTimer = null;
  function syncDynamicViewport() {
    // 1. Trigger hero canvas resize if present
    if (typeof resizeCanvas === 'function') {
      try { resizeCanvas(); } catch (e) {}
    }
    // 2. Trigger lenis resize
    if (window.lenis && typeof window.lenis.resize === 'function') {
      try { window.lenis.resize(); } catch (e) {}
    }
    // 3. Debounced ScrollTrigger refresh to settle DOM layouts
    clearTimeout(globalResizeSyncTimer);
    globalResizeSyncTimer = setTimeout(() => {
      if (window.ScrollTrigger) {
        try { window.ScrollTrigger.refresh(); } catch (e) {}
      }
    }, 120);
  }

  window.addEventListener('resize', syncDynamicViewport);
  window.addEventListener('orientationchange', () => {
    setTimeout(syncDynamicViewport, 200);
  });

})();
