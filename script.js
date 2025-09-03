document.addEventListener("DOMContentLoaded", async () => {
  const aboutContainer = document.querySelector(".about-container");
  const projectsGrid = document.getElementById("projects-grid");
  const yearElement = document.getElementById("year");
  yearElement.textContent = new Date().getFullYear();

  // Load JSON files
  const loadJSON = async (path) => {
    const response = await fetch(path);
    if (!response.ok) {
      console.error(`Failed to load ${path}`);
      return null;
    }
    return await response.json();
  };

  const personalInfo = await loadJSON("contents/personal-info.json");
  const projects = await loadJSON("contents/projects.json");

  console.log('Personal Info:', personalInfo);
  console.log('Projects:', projects);

  // Populate About Section
  if (personalInfo && aboutContainer) {
    const mainAboutContentDiv = document.getElementById('main-about-content'); // This will hold logo, name, and contact links
    const aboutMeTextContent = document.querySelector('#about-content-inner .about-me-text-content'); // This will hold About heading and paragraph
    
    // Contact info HTML with collapsible email and phone, text links for GitHub/LinkedIn/Resume
    const contactInfoHTML = `
      <div class="contact-items">
        <div class="contact-item-text-collapsible" onclick="toggleCollapsible('email-details')">
          <p class="contact-label">Email</p>
          <div class="collapsible-content" id="email-details">
            <p><a href="mailto:${personalInfo.email}">${personalInfo.email}</a></p>
          </div>
        </div>
        <div class="contact-item-text-collapsible" onclick="toggleCollapsible('phone-details')">
          <p class="contact-label">Phone</p>
          <div class="collapsible-content" id="phone-details">
            <p>${personalInfo.phone}</p>
          </div>
        </div>
        <div class="contact-item-text-direct">
          <a href="${personalInfo.linkedin}" target="_blank" class="text-link">LinkedIn</a>
        </div>
        <div class="contact-item-text-direct">
          <a href="${personalInfo.github}" target="_blank" class="text-link">GitHub</a>
        </div>
        <div class="contact-item-text-direct">
          <a href="assets/documents/resume.pdf" target="_blank" download="${personalInfo.name.replace(/\s/g, '_')}_Resume.pdf" class="resume-link">Resume</a>
        </div>
      </div>
    `;

    mainAboutContentDiv.innerHTML = `
      <div class="about-header">
        <img src="assets/icons/logo.png" alt="Logo" class="about-logo-square">
        <h1>${personalInfo.name}</h1>
      </div>
      ${contactInfoHTML}
    `;

    // About paragraphs and heading for the white backdrop section
    if (personalInfo.about_me_paragraphs && Array.isArray(personalInfo.about_me_paragraphs)) {
      aboutMeTextContent.innerHTML = personalInfo.about_me_paragraphs.map(p => `<p class="about-summary-paragraph-black">${p}</p>`).join('');
    } else if (personalInfo.about_me_paragraph) {
      aboutMeTextContent.innerHTML = `
        <p class="about-summary-paragraph-black">${personalInfo.about_me_paragraph}</p>
      `;
    }

    // Generic collapsible logic for Email/Phone
    window.toggleCollapsible = function(id) { // This function should be general for both sections
      const element = document.getElementById(id);
      if (element) {
        element.classList.toggle('active');
      }
    };
  }

  // Functions for Side Navigation
  window.openNav = function() {
    document.getElementById("mySidenav").style.width = "250px";
  }

  window.closeNav = function() {
    document.getElementById("mySidenav").style.width = "0";
  }

  // Scroll-based background animation
  window.addEventListener('scroll', () => {
    const aboutSection = document.getElementById('about');
    const aboutSectionTop = aboutSection.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (aboutSectionTop < windowHeight / 2) { // Adjust threshold as needed
      document.body.classList.add('scrolled');
    } else {
      document.body.classList.remove('scrolled');
    }

    // Logic for menu button color change on scroll
    const menuButton = document.querySelector('.menu-button');
    const mainWhiteBox = document.getElementById('main-white-box');

    if (menuButton && mainWhiteBox) {
      const menuButtonRect = menuButton.getBoundingClientRect();
      const whiteBoxRect = mainWhiteBox.getBoundingClientRect();

      if (menuButtonRect.bottom > whiteBoxRect.top && menuButtonRect.top < whiteBoxRect.bottom &&
          menuButtonRect.right > whiteBoxRect.left && menuButtonRect.left < whiteBoxRect.right) {
        menuButton.classList.add('black');
      } else {
        menuButton.classList.remove('black');
      }
    }
  });

  // Populate Projects Section
  if (projects) {
    const projectsGridContainer = document.querySelector('#projects-content-inner #projects-grid');
    if (projectsGridContainer) {
      projectsGridContainer.innerHTML = projects.map((project, index) => `
      <article class="project-card" id="project-${index}">
        <div class="project-media-container">
          ${project.media.map((mediaItem, mediaIndex) => `
            ${mediaItem.type === 'image' ? 
              `<img src="${mediaItem.src}" alt="${project.title}" class="project-media-item ${mediaIndex === 0 ? 'active' : ''}" data-media-index="${mediaIndex}" loading="lazy">` : 
              `<video src="${mediaItem.src}" class="project-media-item ${mediaIndex === 0 ? 'active' : ''}" data-media-index="${mediaIndex}" controls loading="lazy"></video>`
            }
          `).join('')}
          ${project.media.length > 1 ? `
            <button class="media-nav-button prev" onclick="navigateMedia(${index}, -1)"></button>
            <button class="media-nav-button next" onclick="navigateMedia(${index}, 1)"></button>
          ` : ''}
        </div>
        <div class="project-info">
          <h3 style="display: inline-block;">${project.title}</h3>
          ${project.date ? `<span class="project-date" style="float: right; color: #555;">${project.date}</span>` : ""}
          ${project.skills ? `<p class="project-skills" style="color: #555;">${project.skills.join(", ")}</p>` : ""}
          <div class="project-details-collapsible">
            <div class="project-description-truncated">
              <p>${project.paragraphs && Array.isArray(project.paragraphs) ? project.paragraphs.slice(0, 3).join('<br>') : project.description}</p>
              ${project.paragraphs && project.paragraphs.length > 3 ? 
                `<span class="fade-overlay"></span>` : 
                ''
              }
            </div>
            <div class="project-description-full">
              ${project.paragraphs && Array.isArray(project.paragraphs)
                ? project.paragraphs.map(p => `<p>${p}</p>`).join('')
                : `<p>${project.description}</p>`}
              ${project.link ? `<p class="project-details-link">More details can be found <a href="${project.link}" target="_blank">here</a></p>` : ""}
            </div>
          </div>
          <button class="toggle-details-button" onclick="toggleProjectDetails(${index})">
            <span class="button-text">Read More</span> <span class="arrow-icon">&#9660;</span>
          </button>
        </div>
      </article>
    `).join("");

    // Initial setup for media navigation and collapsibility
    projects.forEach((project, index) => {
      const projectCard = document.getElementById(`project-${index}`);
      const mediaItems = projectCard.querySelectorAll('.project-media-item');
      if (mediaItems.length > 0) {
        mediaItems[0].classList.add('active');
      }
      
      // Add click listener to the project card for redirection if a link exists
      if (project.link) {
        projectCard.addEventListener('click', (event) => {
          // Prevent redirection if click is on an interactive element within the card
          const interactiveElements = ['.toggle-details-button', '.media-nav-button', 'a', 'video'];
          const isInteractiveClick = interactiveElements.some(selector => event.target.closest(selector));
          
          if (!isInteractiveClick) {
            window.open(project.link, '_blank');
          }
        });
      }
    });
    }
  }

  // Media navigation function
  window.navigateMedia = function(projectIndex, direction) {
    const projectCard = document.getElementById(`project-${projectIndex}`);
    const mediaItems = projectCard.querySelectorAll('.project-media-item');
    let currentActive = projectCard.querySelector('.project-media-item.active');
    let currentIndex = parseInt(currentActive.dataset.mediaIndex);

    // If the current active media is a video and it's playing, pause it
    if (currentActive.tagName === 'VIDEO' && !currentActive.paused) {
      currentActive.pause();
    }

    currentActive.classList.remove('active');
    
    let newIndex = currentIndex + direction;
    if (newIndex < 0) {
      newIndex = mediaItems.length - 1;
    } else if (newIndex >= mediaItems.length) {
      newIndex = 0;
    }
    
    mediaItems[newIndex].classList.add('active');
  };

  // Project details collapsibility function
  window.toggleProjectDetails = function(projectIndex) {
    const projectCard = document.getElementById(`project-${projectIndex}`);
    const detailsCollapsible = projectCard.querySelector('.project-details-collapsible');
    const buttonText = projectCard.querySelector('.toggle-details-button .button-text');
    const arrowIcon = projectCard.querySelector('.toggle-details-button .arrow-icon');
    const fullDescription = detailsCollapsible.querySelector('.project-description-full');
    const truncatedDescription = detailsCollapsible.querySelector('.project-description-truncated');
    const fadeOverlay = detailsCollapsible.querySelector('.fade-overlay');

    if (detailsCollapsible.classList.contains('active')) {
      // Collapse section
      detailsCollapsible.style.height = detailsCollapsible.scrollHeight + 'px'; // Set explicit height before collapsing
      detailsCollapsible.classList.remove('active'); // Remove active immediately to trigger CSS transitions
      
      requestAnimationFrame(() => {
        detailsCollapsible.style.height = '4.8em'; // Collapse to 3 lines
      });
      
      buttonText.textContent = 'Read More';
      arrowIcon.innerHTML = '&#9660;'; // Down arrow
    } else {
      // Expand section
      detailsCollapsible.classList.add('active'); // Add active immediately to trigger CSS transitions
      
      // Temporarily set height to auto to measure full content
      detailsCollapsible.style.height = 'auto';
      const scrollHeight = detailsCollapsible.scrollHeight;
      
      // Reset height to initial for smooth transition start, then expand in next frame
      detailsCollapsible.style.height = '4.8em'; 
      requestAnimationFrame(() => {
        detailsCollapsible.style.height = scrollHeight + 'px'; // Expand to full height
      });
      
      buttonText.textContent = 'Read Less';
      arrowIcon.innerHTML = '&#9650;'; // Up arrow
    }
  };

  // Image/Video expansion logic
  document.querySelectorAll('.project-media-item').forEach(media => {
  });

  // Lightbox functions
  window.openLightbox = function(src, type, currentTime = 0) {
    const lightbox = document.getElementById('lightbox');
    const lightboxContent = lightbox.querySelector('.lightbox-content');
    lightboxContent.innerHTML = ''; // Clear previous content

    if (type === 'image') {
      const img = document.createElement('img');
      img.src = src;
      lightboxContent.appendChild(img);
    } else if (type === 'video') {
      const video = document.createElement('video');
      video.src = src;
      video.controls = true;
      video.autoplay = true; // Autoplay video in lightbox
      console.log(`[Lightbox] Attempting to set video currentTime to: ${currentTime}`);
      video.addEventListener('loadedmetadata', () => {
        video.currentTime = currentTime; // Set video to continue from where it left off after metadata is loaded
        console.log(`[Lightbox] Video metadata loaded. Current time set to: ${video.currentTime}`);
        // Attempt to play immediately after setting currentTime, if it was playing before
        if (currentTime > 0) { // Assuming if currentTime > 0, it was playing
          video.play().catch(e => console.error("Error playing lightbox video:", e));
        }
      });
      video.addEventListener('seeked', () => {
        console.log(`[Lightbox] Video seeked to: ${video.currentTime}`);
      });
      lightboxContent.appendChild(video);
    }
    lightbox.classList.add('active');
  };

  window.closeLightbox = function() {
    const lightbox = document.getElementById('lightbox');
    const video = lightbox.querySelector('video');
    if (video) {
      video.pause(); // Pause video when closing lightbox
    }
    lightbox.classList.remove('active');
  };
});
