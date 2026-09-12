document.addEventListener('DOMContentLoaded', () => {
    const slides = Array.from(document.querySelectorAll('.slide'));
    const totalSlides = slides.length;
    let currentSlide = 0;

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const slideNumberSpan = document.getElementById('slide-number');
    const totalSlidesSpan = document.getElementById('total-slides');
    const progressBar = document.getElementById('progress-bar');
    const slideSelect = document.getElementById('slide-select');
    const overviewModal = document.getElementById('overview-modal');
    const overviewBtn = document.getElementById('overview-btn');
    const closeOverviewBtn = document.getElementById('close-overview-btn');
    const overviewGrid = document.getElementById('overview-grid');
    const fullscreenBtn = document.getElementById('fullscreen-btn');

    if (totalSlidesSpan) {
        totalSlidesSpan.textContent = String(totalSlides).padStart(2, '0');
    }

    // Populate Slide Selector and Overview Grid
    slides.forEach((slide, idx) => {
        const titleEl = slide.querySelector('.slide-title');
        const titleText = titleEl ? titleEl.textContent.trim() : `Slide ${idx + 1}`;
        const numStr = String(idx + 1).padStart(2, '0');

        // Dropdown Option
        if (slideSelect) {
            const opt = document.createElement('option');
            opt.value = idx;
            opt.textContent = `${numStr}. ${titleText}`;
            slideSelect.appendChild(opt);
        }

        // Overview Card
        if (overviewGrid) {
            const card = document.createElement('div');
            card.className = `overview-card ${idx === 0 ? 'active' : ''}`;
            card.dataset.index = idx;
            card.innerHTML = `
                <div class="text-xs text-cyber-red mb-1 font-bold">[0x${numStr}]</div>
                <div class="text-sm text-white font-semibold line-clamp-2">${titleText}</div>
            `;
            card.addEventListener('click', () => {
                goToSlide(idx);
                closeOverview();
            });
            overviewGrid.appendChild(card);
        }
    });

    function updateView() {
        slides.forEach((s, idx) => {
            if (idx === currentSlide) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });

        // Update counter
        if (slideNumberSpan) {
            slideNumberSpan.textContent = String(currentSlide + 1).padStart(2, '0');
        }

        // Update dropdown
        if (slideSelect) {
            slideSelect.value = currentSlide;
        }

        // Update progress bar
        if (progressBar && totalSlides > 1) {
            const progress = (currentSlide / (totalSlides - 1)) * 100;
            progressBar.style.width = `${progress}%`;
        }

        // Button disabled states
        if (prevBtn) prevBtn.disabled = currentSlide === 0;
        if (nextBtn) nextBtn.disabled = currentSlide === totalSlides - 1;

        // Update overview cards
        const cards = document.querySelectorAll('.overview-card');
        cards.forEach((c, idx) => {
            if (idx === currentSlide) {
                c.classList.add('active');
            } else {
                c.classList.remove('active');
            }
        });

        // Reset scroll position on active slide
        if (slides[currentSlide]) {
            slides[currentSlide].scrollTop = 0;
        }
    }

    function goToSlide(index) {
        if (index >= 0 && index < totalSlides) {
            currentSlide = index;
            updateView();
        }
    }

    function nextSlide() {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            updateView();
        }
    }

    function prevSlide() {
        if (currentSlide > 0) {
            currentSlide--;
            updateView();
        }
    }

    function openOverview() {
        if (overviewModal) {
            overviewModal.classList.add('open');
        }
    }

    function closeOverview() {
        if (overviewModal) {
            overviewModal.classList.remove('open');
        }
    }

    function toggleOverview() {
        if (overviewModal) {
            if (overviewModal.classList.contains('open')) {
                closeOverview();
            } else {
                openOverview();
            }
        }
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    // Event Listeners
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    if (slideSelect) {
        slideSelect.addEventListener('change', (e) => {
            goToSlide(parseInt(e.target.value, 10));
        });
    }

    if (overviewBtn) overviewBtn.addEventListener('click', toggleOverview);
    if (closeOverviewBtn) closeOverviewBtn.addEventListener('click', closeOverview);
    if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (overviewModal && overviewModal.classList.contains('open')) {
            if (e.key === 'Escape') {
                closeOverview();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowRight':
            case 'PageDown':
            case ' ':
                e.preventDefault();
                nextSlide();
                break;
            case 'ArrowLeft':
            case 'PageUp':
                e.preventDefault();
                prevSlide();
                break;
            case 'Home':
                e.preventDefault();
                goToSlide(0);
                break;
            case 'End':
                e.preventDefault();
                goToSlide(totalSlides - 1);
                break;
            case 'f':
            case 'F':
                toggleFullscreen();
                break;
            case 'o':
            case 'O':
                toggleOverview();
                break;
            case 'Escape':
                closeOverview();
                break;
        }
    });

    // Interactive 60-Second Arena Game Timer Logic
    let gameTimerInterval = null;
    let gameTimeLeft = 60;
    const gameTimerDisplay = document.getElementById('game-timer-display');
    const gameTimerBtn = document.getElementById('game-timer-btn');
    const gameResetBtn = document.getElementById('game-reset-btn');

    if (gameTimerBtn && gameTimerDisplay) {
        gameTimerBtn.addEventListener('click', () => {
            if (gameTimerInterval) {
                // Pause timer
                clearInterval(gameTimerInterval);
                gameTimerInterval = null;
                gameTimerBtn.innerHTML = '<i class="fas fa-play mr-1"></i> <span>Resume</span>';
                gameTimerBtn.classList.remove('bg-yellow-600', 'hover:bg-yellow-700');
                gameTimerBtn.classList.add('bg-cyber-red', 'hover:bg-red-700');
            } else {
                // Start or resume timer
                if (gameTimeLeft <= 0) {
                    gameTimeLeft = 60;
                    gameTimerDisplay.textContent = '60s';
                    gameTimerDisplay.classList.remove('animate-pulse', 'text-red-500', 'border-red-500');
                }
                gameTimerBtn.innerHTML = '<i class="fas fa-pause mr-1"></i> <span>Pause</span>';
                gameTimerBtn.classList.remove('bg-cyber-red', 'hover:bg-red-700');
                gameTimerBtn.classList.add('bg-yellow-600', 'hover:bg-yellow-700');

                gameTimerInterval = setInterval(() => {
                    gameTimeLeft--;
                    gameTimerDisplay.textContent = `${gameTimeLeft}s`;

                    if (gameTimeLeft <= 10 && gameTimeLeft > 0) {
                        gameTimerDisplay.classList.add('animate-pulse', 'text-red-500');
                    }

                    if (gameTimeLeft <= 0) {
                        clearInterval(gameTimerInterval);
                        gameTimerInterval = null;
                        gameTimerDisplay.textContent = "TIME'S UP!";
                        gameTimerDisplay.classList.add('animate-pulse', 'text-red-500');
                        gameTimerBtn.innerHTML = '<i class="fas fa-rotate-left mr-1"></i> <span>Restart</span>';
                        gameTimerBtn.classList.remove('bg-yellow-600', 'hover:bg-yellow-700');
                        gameTimerBtn.classList.add('bg-cyber-red', 'hover:bg-red-700');
                    }
                }, 1000);
            }
        });

        if (gameResetBtn) {
            gameResetBtn.addEventListener('click', () => {
                if (gameTimerInterval) {
                    clearInterval(gameTimerInterval);
                    gameTimerInterval = null;
                }
                gameTimeLeft = 60;
                gameTimerDisplay.textContent = '60s';
                gameTimerDisplay.classList.remove('animate-pulse', 'text-red-500');
                gameTimerBtn.innerHTML = '<i class="fas fa-play mr-1"></i> <span>Start</span>';
                gameTimerBtn.classList.remove('bg-yellow-600', 'hover:bg-yellow-700');
                gameTimerBtn.classList.add('bg-cyber-red', 'hover:bg-red-700');
            });
        }
    }

    // Initialize View
    updateView();
});
