// --- DATA MANAGEMENT ---
const DEFAULT_PROJECTS = [
    { id: 1, title: "AI Ad Campaign", cat: "AI", img: "https://images.unsplash.com/photo-1611162625600-5f97f93f28a7?w=400", url: "#", video: "", desc: "High conversion AI campaign.", status: "Publish" },
    { id: 2, title: "E-Commerce App", cat: "Web", img: "https://images.unsplash.com/photo-1512428559087-5656177ca19e?w=400", url: "#", video: "", desc: "Modern shopping experience.", status: "Publish" },
];

if (!localStorage.getItem('webro_projects')) {
    localStorage.setItem('webro_projects', JSON.stringify(DEFAULT_PROJECTS));
}

// --- ONBOARDING LOGIC ---
let currentSlide = 1;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');

document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentSlide < 3) {
        currentSlide++;
        updateOnboarding();
    } else {
        closeOnboarding();
    }
});

document.getElementById('skipBtn').addEventListener('click', closeOnboarding);

function updateOnboarding() {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    
    document.querySelector(`.slide[data-slide="${currentSlide}"]`).classList.add('active');
    dots[currentSlide - 1].classList.add('active');

    if (currentSlide === 3) {
        document.getElementById('nextBtn').innerText = "Get Started";
    }
}

function closeOnboarding() {
    document.getElementById('onboarding').style.transform = 'translateY(-100%)';
}

// --- NAVIGATION LOGIC ---
function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick').includes(pageId)) item.classList.add('active');
    });
    window.scrollTo(0,0);
}

// --- PROJECTS RENDERING ---
function renderProjects(filter = 'all') {
    const container = document.getElementById('projects-display');
    const projects = JSON.parse(localStorage.getItem('webro_projects'));
    
    container.innerHTML = '';
    
    const filtered = filter === 'all' ? projects : projects.filter(p => p.cat === filter && p.status === 'Publish');

    filtered.forEach(p => {
        container.innerHTML += `
            <div class="project-card">
                <img src="${p.img}" class="project-thumb">
                <div class="project-info">
                    <span class="project-cat">${p.cat}</span>
                    <h3>${p.title}</h3>
                    <p>${p.desc.substring(0, 60)}...</p>
                    <div style="margin-top:15px; display:flex; gap:10px;">
                        <a href="${p.url}" target="_blank" class="btn-main" style="padding:5px 15px; font-size:0.8rem">Visit</a>
                        <button class="btn-outline" style="padding:5px 15px; font-size:0.8rem">Read More</button>
                    </div>
                </div>
            </div>
        `;
    });
}

// Category Filter Logic
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        renderProjects(e.target.dataset.cat);
    });
});

// --- ADMIN LOGIC ---
function toggleAdminView() {
    const panel = document.getElementById('admin-panel');
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

function handleLogin() {
    const user = document.getElementById('adminUser').value;
    const pass = document.getElementById('adminPass').value;
    
    if (user === 'admin' && pass === 'sureshwebro') {
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'flex';
        updateAdminStats();
        renderAdminPosts();
    } else {
        document.getElementById('loginError').innerText = "Invalid credentials!";
    }
}

function logout() {
    location.reload(); // Simplest way to reset admin state
}

function showAdminTab(tabId) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('.side-nav a').forEach(a => a.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

// --- CRUD SYSTEM ---
let editId = null;

function openModal(id = null) {
    editId = id;
    const modal = document.getElementById('postModal');
    modal.style.display = 'flex';
    
    if (id) {
        const p = JSON.parse(localStorage.getItem('webro_projects')).find(x => x.id === id);
        document.getElementById('p-title').value = p.title;
        document.getElementById('p-cat').value = p.cat;
        document.getElementById('p-img').value = p.img;
        document.getElementById('p-url').value = p.url;
        document.getElementById('p-video').value = p.video;
        document.getElementById('p-status').value = p.status;
        document.getElementById('p-desc').value = p.desc;
        document.getElementById('modalTitle').innerText = "Edit Project";
    } else {
        document.getElementById('modalTitle').innerText = "Add Project";
        document.querySelector('.modal-content').querySelectorAll('input, select, textarea').forEach(i => i.value = '');
    }
}

function closeModal() {
    document.getElementById('postModal').style.display = 'none';
}

function savePost() {
    const projects = JSON.parse(localStorage.getItem('webro_projects'));
    const newPost = {
        id: editId ? editId : Date.now(),
        title: document.getElementById('p-title').value,
        cat: document.getElementById('p-cat').value,
        img: document.getElementById('p-img').value || 'https://via.placeholder.com/400',
        url: document.getElementById('p-url').value,
        video: document.getElementById('p-video').value,
        status: document.getElementById('p-status').value,
        desc: document.getElementById('p-desc').value
    };

    if (editId) {
        const index = projects.findIndex(p => p.id === editId);
        projects[index] = newPost;
    } else {
        projects.push(newPost);
    }

    localStorage.setItem('webro_projects', JSON.stringify(projects));
    closeModal();
    renderAdminPosts();
    renderProjects();
    updateAdminStats();
}

function deletePost(id) {
    if (confirm("Are you sure you want to delete this project?")) {
        const projects = JSON.parse(localStorage.getItem('webro_projects'));
        const filtered = projects.filter(p => p.id !== id);
        localStorage.setItem('webro_projects', JSON.stringify(filtered));
        renderAdminPosts();
        renderProjects();
        updateAdminStats();
    }
}

function renderAdminPosts() {
    const list = document.getElementById('admin-posts-list');
    const projects = JSON.parse(localStorage.getItem('webro_projects'));
    list.innerHTML = '';

    projects.forEach(p => {
        list.innerHTML += `
            <tr>
                <td><img src="${p.img}" width="50" style="border-radius:5px"></td>
                <td>${p.title}</td>
                <td>${p.cat}</td>
                <td>${p.status}</td>
                <td>
                    <button onclick="openModal(${p.id})" class="btn-outline" style="padding:2px 8px">Edit</button>
                    <button onclick="deletePost(${p.id})" class="btn-main" style="padding:2px 8px; background:red">Del</button>
                </td>
            </tr>
        `;
    });
}

function updateAdminStats() {
    const projects = JSON.parse(localStorage.getItem('webro_projects'));
    document.getElementById('stat-posts').innerText = projects.length;
    document.getElementById('stat-cats').innerText = [...new Set(projects.map(p => p.cat))].length;
}

// Initialize
window.onload = () => {
    renderProjects();
    
    // Testimonial Mockup
    const testimonials = [
        { name: "John Doe", text: "Webro transformed our business with their AI tools!", rating: 5 },
        { name: "Sarah Smith", text: "The best web design agency I've worked with.", rating: 5 },
        { name: "Mike Ross", text: "Fast delivery and professional communication.", rating: 4 },
    ];
    const carousel = document.getElementById('testimonial-carousel');
    testimonials.forEach(t => {
        carousel.innerHTML += `
            <div class="service-card" style="margin: 10px; min-width: 300px;">
                <div class="stars">${'★'.repeat(t.rating)}</div>
                <p>"${t.text}"</p>
                <h4>- ${t.name}</h4>
            </div>
        `;
    });
    carousel.style.display = 'flex';
    carousel.style.overflowX = 'auto';
};
