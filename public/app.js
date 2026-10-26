const T = {
    ar: {
        siteTitle: 'أسهل طريقة للمذاكرة',
        heroTitle: 'حوّل أي محاضرة لشرح مبسط + امتحان فوري',
        heroDesc: 'ارفع PDF أو حط رابط وهنشرحهولك',
        uploadFile: 'ارفع ملف المحاضرة',
        uploadHint: 'PDF, TXT, DOC — حتى 50MB',
        dropText: 'اسحب الملف هنا أو اضغط',
        uploadURL: 'أو أدخل روابط',
        urlHint: 'رابط مقال أو PDF على الإنترنت',
        lecName: 'اسم المحاضرة',
        lecNamePH: 'مثال: الذكاء الاصطناعي',
        subject: 'المادة',
        subjectPH: 'مثال: علوم الحاسب',
        outLang: 'لغة الشرح',
        analyzeBtn: 'حلّل المحاضرة الآن',
        loading: 'جاري تحليل المحاضرة...',
        loadingHint: 'قد يستغرق الأمر دقيقة',
        tabSummary: 'الشرح',
        tabExam: 'الامتحان',
        tabNotes: 'ملاحظات',
        summaryTitle: 'شرح المحاضرة',
        examTitle: 'امتحان 20 سؤال',
        notesTitle: 'ملاحظات مهمة',
        dlPDF: 'تحميل PDF',
        copy: 'نسخ',
        reset: 'إعادة',
        gradeBtn: 'تصحيح',
        backBtn: 'محاضرة جديدة',
        toastFile: 'تم رفع الملف',
        toastNoFile: 'ارفع ملف أو أدخل رابط',
        toastSuccess: 'تم التحليل بنجاح 🎉',
        toastError: 'حدث خطأ',
        toastCopied: 'تم النسخ',
        toastPDF: 'تم تحميل PDF',
        partLabel: 'الجزء',
        noContent: 'لا يوجد محتوى كافٍ للتحليل',
        scoreExcellent: '🌟 ممتاز!',
        scoreGood: '👏 جيد جداً',
        scoreOk: '👍 جيد',
        scoreWeak: '📚 راجع المحاضرة'
    },
    en: {
        siteTitle: 'The Easiest Way to Study',
        heroTitle: 'Turn any lecture into a simple explanation + instant exam',
        heroDesc: 'Upload a PDF or paste a link and get it explained',
        uploadFile: 'Upload Lecture File',
        uploadHint: 'PDF, TXT, DOC — up to 50MB',
        dropText: 'Drag file here or click',
        uploadURL: 'Or enter links',
        urlHint: 'Article or PDF link',
        lecName: 'Lecture Name',
        lecNamePH: 'e.g. Artificial Intelligence',
        subject: 'Subject',
        subjectPH: 'e.g. Computer Science',
        outLang: 'Output Language',
        analyzeBtn: 'Analyze Now',
        loading: 'Analyzing lecture...',
        loadingHint: 'This may take a minute',
        tabSummary: 'Summary',
        tabExam: 'Exam',
        tabNotes: 'Notes',
        summaryTitle: 'Lecture Explanation',
        examTitle: '20-Question Exam',
        notesTitle: 'Important Notes',
        dlPDF: 'Download PDF',
        copy: 'Copy',
        reset: 'Reset',
        gradeBtn: 'Grade',
        backBtn: 'New Lecture',
        toastFile: 'File uploaded',
        toastNoFile: 'Upload a file or enter a link',
        toastSuccess: 'Analysis complete 🎉',
        toastError: 'An error occurred',
        toastCopied: 'Copied!',
        toastPDF: 'PDF downloaded',
        partLabel: 'Part',
        noContent: 'Not enough content to analyze',
        scoreExcellent: '🌟 Excellent!',
        scoreGood: '👏 Very Good',
        scoreOk: '👍 Good',
        scoreWeak: '📚 Review the lecture'
    }
};

let currentLang = 'ar';
let currentTheme = 'light';
let selectedFile = null;
let resultData = null;

// ===== THEME =====
function setTheme(t) {
    currentTheme = t;
    document.documentElement.setAttribute('data-theme', t);
    document.getElementById('themeIcon').className =
        t === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('theme', t);
}

document.getElementById('themeToggle').addEventListener('click', () => {
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
});

// ===== LANGUAGE =====
function setLang(lang) {
    currentLang = lang;
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.getElementById('langLabel').textContent = lang === 'ar' ? 'EN' : 'عر';

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (T[lang][key]) el.textContent = T[lang][key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (T[lang][key]) el.placeholder = T[lang][key];
    });

    localStorage.setItem('lang', lang);
}

document.getElementById('langToggle').addEventListener('click', () => {
    setLang(currentLang === 'ar' ? 'en' : 'ar');
});

// ===== FILE UPLOAD =====
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('drag');
});

dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag'));

dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag');
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener('change', e => {
    if (e.target.files[0]) setFile(e.target.files[0]);
});

function setFile(f) {
    selectedFile = f;
    document.getElementById('fileName').textContent = f.name;
    document.getElementById('fileInfo').classList.remove('hidden');
    dropZone.classList.add('hidden');
    toast(T[currentLang].toastFile, 'success');
}

document.getElementById('removeFile').addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    document.getElementById('fileInfo').classList.add('hidden');
    dropZone.classList.remove('hidden');
});

// ===== TABS =====
document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
    });
});

// ===== ANALYZE =====
document.getElementById('analyzeBtn').addEventListener('click', analyze);

async function analyze() {
    const url1 = document.getElementById('url1').value.trim();
    const url2 = document.getElementById('url2').value.trim();

    if (!selectedFile && !url1 && !url2) {
        toast(T[currentLang].toastNoFile, 'warning');
        return;
    }

    show('loadingSection');
    hide('uploadSection');
    hide('resultsSection');

    const fd = new FormData();
    if (selectedFile) fd.append('file', selectedFile);
    fd.append('urls', JSON.stringify([url1, url2].filter(Boolean)));
    fd.append('lang', document.getElementById('outLang').value);
    fd.append('lectureName', document.getElementById('lectureName').value);
    fd.append('subject', document.getElementById('subject').value);

    try {
        const res = await fetch('/api/analyze', { method: 'POST', body: fd });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || T[currentLang].toastError);

        resultData = data;
        renderResults(data);
        hide('loadingSection');
        show('resultsSection');
        toast(T[currentLang].toastSuccess, 'success');
    } catch (err) {
        hide('loadingSection');
        show('uploadSection');
        toast(err.message, 'error');
    }
}

// ===== RENDER =====
function renderResults(data) {
    // Summary
    let html = '';
    if (data.summary) html += renderMD(data.summary);
    if (data.sections && data.sections.length) {
        html += '<hr style="border:0;border-top:2px solid var(--border);margin:24px 0">';
        html += `<h2>${currentLang === 'ar' ? 'الشرح حسب الأجزاء' : 'Section-by-Section'}</h2>`;
        data.sections.forEach((s, i) => {
            html += `<div class="section-block">
                <span class="section-badge">${T[currentLang].partLabel} ${i + 1}</span>
                <h3>${esc(s.title)}</h3>
                ${s.pages ? `<p class="section-pages"><i class="fas fa-file-pdf"></i> ${esc(s.pages)}</p>` : ''}
                ${renderMD(s.explanation)}
            </div>`;
        });
    }
    document.getElementById('summaryBody').innerHTML = html;

    // Notes
    document.getElementById('notesBody').innerHTML = renderMD(data.notes || '');

    // Exam
    renderExam(data.exam || []);
}

function renderExam(questions) {
    if (!questions.length) {
        document.getElementById('examBody').innerHTML =
            `<p style="text-align:center;padding:30px;color:var(--text2)">${T[currentLang].noContent}</p>`;
        return;
    }

    let html = '';
    questions.forEach((q, i) => {
        html += `<div class="q-card" data-correct="${q.correct}" data-explain="${esc(q.explanation || '')}">
            <div class="q-text"><span class="q-num">${i + 1}</span><span>${esc(q.question)}</span></div>
            <div class="q-opts">
                ${q.options.map((o, oi) => `
                    <label class="opt-label" data-oi="${oi}">
                        <input type="radio" name="q${i}" value="${oi}">
                        <span>${esc(o)}</span>
                    </label>
                `).join('')}
            </div>
            <div class="q-explain">💡 ${esc(q.explanation || '')}</div>
        </div>`;
    });

    document.getElementById('examBody').innerHTML = html;

    document.querySelectorAll('.opt-label').forEach(l => {
        l.addEventListener('click', () => {
            const card = l.closest('.q-card');
            card.querySelectorAll('.opt-label').forEach(x => x.classList.remove('selected'));
            l.classList.add('selected');
        });
    });
}

// ===== GRADE =====
document.getElementById('gradeBtn').addEventListener('click', () => {
    const cards = document.querySelectorAll('.q-card');
    let correct = 0;

    cards.forEach((card, i) => {
        const sel = card.querySelector(`input[name="q${i}"]:checked`);
        const ci = parseInt(card.dataset.correct);

        if (sel && parseInt(sel.value) === ci) {
            correct++;
            card.classList.add('correct');
        } else {
            card.classList.add('wrong');
        }

        card.querySelectorAll('.opt-label')[ci]?.classList.add('correct-opt');
        if (sel && parseInt(sel.value) !== ci) {
            card.querySelector('.opt-label.selected')?.classList.add('wrong-opt');
        }
        card.querySelector('.q-explain')?.classList.add('show');
    });

    const total = cards.length;
    const pct = (correct / total) * 100;
    document.getElementById('scoreNum').textContent = `${correct}/${total}`;

    let msg = '';
    if (pct >= 90) msg = T[currentLang].scoreExcellent;
    else if (pct >= 75) msg = T[currentLang].scoreGood;
    else if (pct >= 60) msg = T[currentLang].scoreOk;
    else msg = T[currentLang].scoreWeak;

    document.getElementById('scoreMsg').textContent = msg;
    document.getElementById('scoreBox').classList.remove('hidden');
});

document.getElementById('resetExamBtn').addEventListener('click', () => {
    if (resultData) renderExam(resultData.exam || []);
    document.getElementById('scoreBox').classList.add('hidden');
});

// ===== DOWNLOAD PDF =====
async function downloadPDF(elementId, title) {
    const el = document.getElementById(elementId);
    const clone = el.cloneNode(true);
    clone.style.maxHeight = 'none';
    clone.style.overflow = 'visible';

    const wrapper = document.createElement('div');
    wrapper.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    wrapper.style.cssText = 'padding:20px;font-family:Cairo,Arial,sans-serif;color:#1e293b;background:#fff;';
    wrapper.innerHTML = `<h1 style="color:#6C63FF;text-align:center;margin-bottom:20px">${title}</h1>`;
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    try {
        await html2pdf().set({
            margin: 10,
            filename: `${title}.pdf`,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(wrapper).save();
        toast(T[currentLang].toastPDF, 'success');
    } catch { toast(T[currentLang].toastError, 'error'); }
    finally { wrapper.remove(); }
}

document.getElementById('dlSummaryPDF').addEventListener('click', () =>
    downloadPDF('summaryBody', T[currentLang].summaryTitle));

document.getElementById('dlNotesPDF').addEventListener('click', () =>
    downloadPDF('notesBody', T[currentLang].notesTitle));

// ===== COPY =====
document.getElementById('copySummary').addEventListener('click', async () => {
    const text = document.getElementById('summaryBody').innerText;
    await navigator.clipboard.writeText(text);
    toast(T[currentLang].toastCopied, 'success');
});

// ===== BACK =====
document.getElementById('backBtn').addEventListener('click', () => {
    hide('resultsSection');
    show('uploadSection');
    resultData = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== HELPERS =====
function show(id) { document.getElementById(id).classList.remove('hidden'); }
function hide(id) { document.getElementById(id).classList.add('hidden'); }

function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

function renderMD(text) {
    if (!text) return '';
    return text
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code style="background:var(--primary-bg);padding:2px 6px;border-radius:4px">$1</code>')
        .replace(/^[\-\*] (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
        .replace(/<\/ul>\s*<ul>/g, '')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
}

function toast(msg, type = 'info') {
    const box = document.getElementById('toastBox');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
    t.innerHTML = `<i class="fas ${icons[type]}"></i> ${msg}`;
    box.appendChild(t);
    setTimeout(() => t.remove(), 4000);
}

// ===== INIT =====
(function init() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedLang = localStorage.getItem('lang') || 'ar';
    setTheme(savedTheme);
    setLang(savedLang);
})();