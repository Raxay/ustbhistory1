// ===== 北京科技大学校史档案 - 共享逻辑 =====

// ---- 初始化 ----
const ERAS = ['1952年建校初期', '五六十年代', '改革开放后', '新世纪', '近年发展', '1952年前渊源'];
const CATEGORIES = ['建校历程', '校园建设', '校园文化', '科研突破', '人物志', '学科渊源', '重大荣誉'];

let currentEra = null;
let currentCategory = null;
let currentSearch = '';

document.addEventListener('DOMContentLoaded', function() {
    // 高亮当前导航链接
    const page = getCurrentPage();
    document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === page || (page === 'detail' && href === 'index.html')) {
            // detail 页不高亮导航
        } else if (href === page) {
            link.classList.add('active');
        }
    });
});

function getCurrentPage() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    if (path === '') return 'index.html';
    return path;
}

// ---- 卡片 HTML ----
function renderCard(item, showYear = true) {
    const tags = (item.tags || []).map(t => `<span class="card-tag">${t}</span>`).join('');
    const yearBlock = showYear ? `<div class="card-year">${item.year}</div>` : '';
    return `
        <div class="card" onclick="goDetail(${item.id})">
            ${yearBlock}
            <div class="card-era">${item.era} · ${item.category}</div>
            <div class="card-title">${item.title}</div>
            <div class="card-summary">${item.summary}</div>
            <div class="card-meta">${tags}</div>
        </div>
    `;
}

function renderTimelineItem(item) {
    return `
        <div class="timeline-item" onclick="goDetail(${item.id})">
            <div class="timeline-year">${item.year}年${item.month ? item.month + '月' : ''}</div>
            <div class="timeline-title">${item.title}</div>
            <div class="timeline-summary">${item.summary}</div>
        </div>
    `;
}

// ---- 搜索 ----
function search(query) {
    if (!query || query.trim() === '') return HISTORY_DATA;
    const q = query.trim().toLowerCase();
    return HISTORY_DATA.filter(item => {
        const fields = [item.title, item.summary, item.content, item.category, item.era,
            ...(item.tags || []), ...(item.relatedPeople || [])];
        return fields.some(f => f && f.toLowerCase().includes(q));
    });
}

function filterByEra(data, era) {
    if (!era) return data;
    return data.filter(item => item.era === era);
}

function filterByCategory(data, category) {
    if (!category) return data;
    return data.filter(item => item.category === category);
}

function getSearchQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
}

// ---- 导航 ----
function goDetail(id) {
    window.location.href = 'detail.html?id=' + id;
}

function goHome() {
    window.location.href = 'index.html';
}

function goSearch(query) {
    if (!query || query.trim() === '') {
        window.location.href = 'search.html';
    } else {
        window.location.href = 'search.html?q=' + encodeURIComponent(query.trim());
    }
}

// ---- 获取 URL 参数 ----
function getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// ---- 获取相关事件 ----
function getRelated(item) {
    if (!item.related || item.related.length === 0) return [];
    return item.related.map(id => HISTORY_DATA.find(d => d.id === id)).filter(Boolean);
}

// ---- 获取所有年代 ----
function getAllEras() {
    const eras = [...new Set(HISTORY_DATA.map(d => d.era))];
    return eras;
}

// ---- 获取所有分类 ----
function getAllCategories() {
    const cats = [...new Set(HISTORY_DATA.map(d => d.category))];
    return cats;
}

// ---- 获取按年代分组的数据 ----
function groupByEra(data) {
    const groups = {};
    data.forEach(item => {
        if (!groups[item.era]) groups[item.era] = [];
        groups[item.era].push(item);
    });
    // 按年份排序组内
    for (const era in groups) {
        groups[era].sort((a, b) => a.year - b.year || (a.month || 0) - (b.month || 0));
    }
    return groups;
}

// ---- 生成年代导航按钮 HTML ----
function renderEraNav(activeEra) {
    const allEras = getAllEras();
    return allEras.map(era => {
        const cls = (era === activeEra) ? 'era-btn active' : 'era-btn';
        return `<button class="${cls}" onclick="filterEra('${era}')">${era}</button>`;
    }).join('');
}

function filterEra(era) {
    if (currentEra === era) {
        currentEra = null;
    } else {
        currentEra = era;
    }
    applyFilters();
}
