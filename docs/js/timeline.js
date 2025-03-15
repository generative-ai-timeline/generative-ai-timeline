async function loadTimeline() {
    try {
        console.log('Fetching timeline data...');
        
        // Determine if we're on GitHub Pages
        const isGitHubPages = window.location.hostname.includes('github.io');
        // Use relative path for local, absolute path for GitHub Pages
        const dataPath = isGitHubPages 
            ? '/generative-ai-timeline/data/timeline.json' 
            : 'data/timeline.json';
            
        const response = await fetch(dataPath);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Timeline data loaded:', data);
        
        // Check if data has the expected structure
        if (!data.models || !data.concepts) {
            throw new Error('Invalid data structure in timeline.json');
        }
        
        // Get all items and sort them by date
        const allItems = [
            ...data.models[0].items.map(item => ({...item, type: 'model'})),
            ...data.concepts[0].items.map(item => ({...item, type: 'concept'}))
        ].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Group events by year
        const eventsByYear = {};
        allItems.forEach(item => {
            const year = new Date(item.date).getFullYear();
            if (!eventsByYear[year]) {
                eventsByYear[year] = [];
            }
            eventsByYear[year].push(item);
        });
        
        // Create scroll container and content
        const container = document.querySelector('.timeline-container');
        container.innerHTML = `
            <div class="timeline-scroll-container">
                <div class="timeline-content">
                    <div class="timeline-header">
                        <div class="timeline-years"></div>
                        <div class="timeline-center-line"></div>
                    </div>
                    <div id="models-timeline"></div>
                    <div id="concepts-timeline"></div>
                </div>
            </div>
        `;
        
        // Calculate minimum width needed for cards (300px per card plus spacing)
        const minCardWidth = 300;
        const minSpacing = 40; // Minimum space between cards
        
        // Calculate total width based on number of events and minimum spacing
        let totalWidth = 300; // Initial padding
        Object.values(eventsByYear).forEach(events => {
            // Add width for each year based on number of events
            totalWidth += Math.max(
                events.length * (minCardWidth + minSpacing),
                300 // Minimum year width
            );
        });
        
        // Set the width for both timeline content and center line
        const timelineContent = document.querySelector('.timeline-content');
        timelineContent.style.width = `${totalWidth}px`;
        const timelineCenterLine = document.querySelector('.timeline-center-line');
        timelineCenterLine.style.width = `${totalWidth}px`;
        
        // Calculate year positions based on event density
        const startYear = Math.min(...Object.keys(eventsByYear));
        const endYear = Math.max(...Object.keys(eventsByYear));
        let currentPosition = 150; // Increased from 100 to center first card
        
        // Add year markers
        const yearsContainer = document.querySelector('.timeline-years');
        
        for (let year = startYear; year <= endYear; year++) {
            const events = eventsByYear[year] || [];
            const yearWidth = Math.max(
                events.length * (minCardWidth + minSpacing),
                300 // Keep minimum year width
            );
            
            // Add year marker
            const yearMarker = document.createElement('div');
            yearMarker.className = 'year-marker';
            yearMarker.textContent = year;
            yearMarker.style.left = `${currentPosition}px`;
            yearsContainer.appendChild(yearMarker);
            
            // Position events within the year
            if (events.length > 0) {
                const eventSpacing = yearWidth / events.length;
                events.forEach((item, index) => {
                    const position = currentPosition + (index * eventSpacing);
                    renderTimelineItem(item, position);
                });
            }
            
            currentPosition += yearWidth;
        }
        
        // Get scroll container
        const scrollContainer = document.querySelector('.timeline-scroll-container');
        
        // Wait for next frame to ensure content is rendered
        requestAnimationFrame(() => {
            // Scroll to the right end
            scrollContainer.scrollLeft = scrollContainer.scrollWidth;
            
            // Add scroll event listener
            scrollContainer.addEventListener('scroll', handleScroll);
            // Initial check
            handleScroll({ target: scrollContainer });
        });
        
    } catch (error) {
        console.error('Error loading timeline:', error);
        const container = document.querySelector('.timeline-container');
        if (container) {
            container.innerHTML = `<div class="error-message">Failed to load timeline data: ${error.message}</div>`;
        }
    }
}

function renderTimelineItem(item, position) {
    const container = document.getElementById(
        item.type === 'model' ? 'models-timeline' : 'concepts-timeline'
    );
    
    // Create container for dot, line and card
    const itemContainer = document.createElement('div');
    itemContainer.className = 'timeline-item-container';
    itemContainer.style.left = `${position}px`;
    
    // Create dot
    const dot = document.createElement('div');
    dot.className = 'timeline-dot';
    itemContainer.appendChild(dot);
    
    // Create card
    const card = document.createElement('div');
    card.className = `timeline-item ${item.type === 'model' ? 'models-item' : 'concepts-item'}`;
    card.innerHTML = `
        <div class="date-label">${item.time}</div>
        <div class="event-title">${item.event}</div>
        <div class="description">${item.description}</div>
    `;
    itemContainer.appendChild(card);
    
    // Create vertical line
    const line = document.createElement('div');
    line.className = 'timeline-vertical-line';
    itemContainer.appendChild(line);
    
    container.appendChild(itemContainer);
}

function handleScroll(event) {
    const container = event.target;
    const isAtStart = container.scrollLeft <= 0;
    const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth;
    
    container.classList.toggle('at-start', isAtStart);
    container.classList.toggle('at-end', isAtEnd);
}

document.addEventListener('DOMContentLoaded', loadTimeline);

// Modal functionality
document.addEventListener('DOMContentLoaded', function() {
    const infoButton = document.getElementById('infoButton');
    const modal = document.getElementById('infoModal');
    const closeButton = document.getElementById('closeModal');

    infoButton.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    closeButton.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
});