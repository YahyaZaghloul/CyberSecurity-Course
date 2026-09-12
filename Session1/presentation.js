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
        if (overviewModal) overviewModal.classList.add('open');
    }

    function closeOverview() {
        if (overviewModal) overviewModal.classList.remove('open');
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
                console.warn(`Fullscreen error: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    // Event Listeners for Nav Buttons
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (slideSelect) {
        slideSelect.addEventListener('change', (e) => {
            goToSlide(parseInt(e.target.value, 10));
        });
    }
    if (overviewBtn) overviewBtn.addEventListener('click', toggleOverview);
    if (closeOverviewBtn) closeOverviewBtn.addEventListener('click', closeOverview);
    if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Prevent interfering when user is typing in an input
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
            return;
        }

        switch (e.code) {
            case 'ArrowRight':
            case 'Space':
            case 'PageDown':
                e.preventDefault();
                nextSlide();
                break;
            case 'ArrowLeft':
            case 'Backspace':
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
            case 'KeyF':
                e.preventDefault();
                toggleFullscreen();
                break;
            case 'KeyO':
                e.preventDefault();
                toggleOverview();
                break;
            case 'Escape':
                closeOverview();
                break;
        }
    });

    // Copy to Clipboard buttons
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.terminal-card');
            if (!card) return;

            const codeEl = card.querySelector('code');
            const textToCopy = codeEl ? codeEl.innerText.trim() : '';

            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    const origHtml = btn.innerHTML;
                    btn.innerHTML = '<i class="fas fa-check text-green-400"></i> COPIED';
                    btn.classList.add('border-green-500', 'text-green-400');
                    setTimeout(() => {
                        btn.innerHTML = origHtml;
                        btn.classList.remove('border-green-500', 'text-green-400');
                    }, 1800);
                }).catch(err => {
                    console.error('Clipboard copy failed: ', err);
                });
            }
        });
    });

    // Touch Swipe Support
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const threshold = 50;
        if (touchEndX < touchStartX - threshold) {
            nextSlide();
        } else if (touchEndX > touchStartX + threshold) {
            prevSlide();
        }
    }

    // Initialize first view
    updateView();
});
