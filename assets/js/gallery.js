document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.getElementById('gallery-container');
    const yearFilter = document.getElementById('year-filter');
    const tagsFilter = document.getElementById('tags-filter');
    const galleryItems = Array.from(galleryContainer.querySelectorAll('.gallery-item'));
    let lightbox;

    // 1. Populate filters from existing gallery items
    function populateFilters() {
        const years = [...new Set(galleryItems.map(item => item.dataset.year))].sort((a, b) => b - a);
        const tags = [...new Set(galleryItems.flatMap(item => item.dataset.tags.split(',')))].sort();

        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });

        tags.forEach(tag => {
            if (tag) { // Ensure tag is not an empty string
                const button = document.createElement('button');
                button.className = 'tag-btn';
                button.dataset.tag = tag;
                button.textContent = tag;
                tagsFilter.appendChild(button);
            }
        });
    }

    // 2. Initialize Lightbox
    function initializeLightbox() {
        if (typeof SimpleLightbox !== 'undefined') {
            lightbox = new SimpleLightbox('.gallery-container a', {
                captionsData: 'title',
                captionDelay: 250,
                close: true,
                docClose: true,
                swipeTolerance: 50,
                scrollZoom: false
            });
            console.log('Lightbox initialized successfully');
        } else {
            console.error('SimpleLightbox is not defined!');
        }
    }

    // 3. Filtering logic
    function filterGallery() {
        const selectedYear = yearFilter.value;
        const selectedTag = document.querySelector('.tag-btn.active').dataset.tag;

        galleryItems.forEach(item => {
            const yearMatch = selectedYear === 'all' || item.dataset.year === selectedYear;
            const tagMatch = selectedTag === 'all' || item.dataset.tags.split(',').includes(selectedTag);

            if (yearMatch && tagMatch) {
                item.style.display = ''; // Show item
            } else {
                item.style.display = 'none'; // Hide item
            }
        });
    }

    // 4. Event Listeners
    yearFilter.addEventListener('change', filterGallery);
    tagsFilter.addEventListener('click', (e) => {
        if (e.target.classList.contains('tag-btn')) {
            document.querySelector('.tag-btn.active').classList.remove('active');
            e.target.classList.add('active');
            filterGallery();
        }
    });

    // Initial setup
    populateFilters();
    initializeLightbox();
});