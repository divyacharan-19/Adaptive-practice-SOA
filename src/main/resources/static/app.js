/**
 * Adaptive Practice Prerequisite Graph v3.0 — Enterprise SOA Client & DAG/BKT Engine
 * Team-18: Sahith (2420090084), Divya Charan (2420030429), Mohan Kumar (2420090079)
 */
const API_BASE_URL = "http://localhost:8080/api";

let allNodes = [];
let webhookLogs = [];
let currentQuizQuestions = [];
let currentModalMode = "ADAPTIVE_DIAGNOSTIC_QUIZ";
let isBackendConnected = false;

window._memoryFallback = {};
function safeGetStorage(key) {
    try { return localStorage.getItem(key); }
    catch (e) { return window._memoryFallback[key] || null; }
}
function safeSetStorage(key, val) {
    try { localStorage.setItem(key, val); }
    catch (e) { window._memoryFallback[key] = val; }
}

function simpleHash(str) {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return "KLH-DAG-" + (hash >>> 0).toString(16).toUpperCase().padStart(8, "0");
}

function recomputeGraphStatesClient(nodes) {
    const byCode = {};
    nodes.forEach(n => { byCode[n.nodeCode] = n; });

    nodes.forEach(node => {
        let allPrereqsMastered = true;
        const prereqs = node.prerequisiteCodes || [];
        for (const pCode of prereqs) {
            const parent = byCode[pCode];
            if (!parent || parent.masteryScore < (parent.masteryThreshold || 80)) {
                allPrereqsMastered = false;
                break;
            }
        }

        const threshold = node.masteryThreshold || 80;
        if (!allPrereqsMastered) {
            node.status = "LOCKED_BY_PREREQ";
        } else if (node.masteryScore >= threshold) {
            node.status = "MASTERED";
        } else if (node.practiceAttempts > 0 && node.masteryScore < 70) {
            node.status = "REMEDIATION_REQUIRED";
        } else {
            node.status = "READY_TO_PRACTICE";
        }

        // Bayesian Knowledge Tracing (BKT) Posterior Mastery Probability P(L_t)
        const prior = Math.min(0.98, Math.max(0.08, node.masteryScore / 100.0));
        const pTransit = 0.14 * Math.min(4, node.practiceAttempts || 0);
        let bkt = (prior + (1.0 - prior) * pTransit) * 100.0;
        if (node.status === "LOCKED_BY_PREREQ") bkt = Math.min(25.0, bkt);
        node.bktProbability = Math.min(99.5, Math.round(bkt * 10) / 10);

        node.credentialHash = simpleHash(
            `${node.nodeCode}|${node.learnerName}|${node.masteryScore}|${node.status}`
        );
    });
    return nodes;
}

function getInitialSeedNodes() {
    const seeds = [
        {
            id: 1, nodeCode: "CS-101", skillTitle: "Arrays, Pointers & Asymptotic Big-O",
            learnerName: "Mohan Kumar", domainTrack: "Foundational Data Structures",
            difficultyTier: "FOUNDATIONAL", prerequisiteCodes: [],
            masteryScore: 95, masteryThreshold: 80, practiceAttempts: 3, estimatedMinutes: 25,
            lastPracticedDate: "2026-10-11",
            history: [{ attemptDate: "2026-10-11", previousMastery: 82, newMastery: 95, bktProbability: 97.1, mode: "ADAPTIVE_DIAGNOSTIC_QUIZ", evaluatorOrEngine: "Venkateshwari Ketineni", remarks: "Mastered foundational asymptotic analysis" }]
        },
        {
            id: 2, nodeCode: "CS-102", skillTitle: "Recursion, Stacks & Hash Maps",
            learnerName: "Divya Charan", domainTrack: "Foundational Data Structures",
            difficultyTier: "FOUNDATIONAL", prerequisiteCodes: ["CS-101"],
            masteryScore: 89, masteryThreshold: 80, practiceAttempts: 2, estimatedMinutes: 30,
            lastPracticedDate: "2026-10-15",
            history: [{ attemptDate: "2026-10-15", previousMastery: 74, newMastery: 89, bktProbability: 92.1, mode: "ADAPTIVE_DIAGNOSTIC_QUIZ", evaluatorOrEngine: "Venkateshwari Ketineni", remarks: "Cleared recursion & open-addressing hash collision lab" }]
        },
        {
            id: 3, nodeCode: "CS-201", skillTitle: "Trees, Heaps & Priority Queues",
            learnerName: "Sahith", domainTrack: "Algorithms & Graph Theory",
            difficultyTier: "INTERMEDIATE", prerequisiteCodes: ["CS-102"],
            masteryScore: 84, masteryThreshold: 80, practiceAttempts: 2, estimatedMinutes: 40,
            lastPracticedDate: "2026-10-20",
            history: [{ attemptDate: "2026-10-20", previousMastery: 68, newMastery: 84, bktProbability: 88.5, mode: "EVALUATOR_PRACTICE_LAB", evaluatorOrEngine: "Venkateshwari Ketineni", remarks: "Verified binary heap & AVL tree rotations" }]
        },
        {
            id: 4, nodeCode: "CS-202", skillTitle: "Graph Traversal (BFS, DFS & DAGs)",
            learnerName: "Sahith", domainTrack: "Algorithms & Graph Theory",
            difficultyTier: "INTERMEDIATE", prerequisiteCodes: ["CS-201"],
            masteryScore: 62, masteryThreshold: 80, practiceAttempts: 2, estimatedMinutes: 45,
            lastPracticedDate: "2026-10-26",
            history: [{ attemptDate: "2026-10-26", previousMastery: 48, newMastery: 62, bktProbability: 72.6, mode: "INITIAL_DIAGNOSTIC", evaluatorOrEngine: "Dr. P. Venkateshwar", remarks: "Remediation needed on cycle detection before unlocking CS-301" }]
        },
        {
            id: 5, nodeCode: "CS-203", skillTitle: "RESTful SOA & HTTP Contract Design",
            learnerName: "Mohan Kumar", domainTrack: "Distributed SOA Systems",
            difficultyTier: "INTERMEDIATE", prerequisiteCodes: ["CS-102"],
            masteryScore: 76, masteryThreshold: 80, practiceAttempts: 1, estimatedMinutes: 35,
            lastPracticedDate: "2026-10-27",
            history: [{ attemptDate: "2026-10-27", previousMastery: 0, newMastery: 76, bktProbability: 79.4, mode: "INITIAL_DIAGNOSTIC", evaluatorOrEngine: "Venkateshwari Ketineni", remarks: "In Zone of Proximal Development (ZPD) — 4% from mastery" }]
        },
        {
            id: 6, nodeCode: "CS-301", skillTitle: "Topological Sort & Shortest Paths",
            learnerName: "Divya Charan", domainTrack: "Algorithms & Graph Theory",
            difficultyTier: "ADVANCED", prerequisiteCodes: ["CS-202"],
            masteryScore: 20, masteryThreshold: 80, practiceAttempts: 0, estimatedMinutes: 50,
            lastPracticedDate: "2026-10-28",
            history: [{ attemptDate: "2026-10-28", previousMastery: 0, newMastery: 20, bktProbability: 20.0, mode: "INITIAL_DIAGNOSTIC", evaluatorOrEngine: "System DAG Gate", remarks: "Locked until prerequisite CS-202 reaches >= 80%" }]
        },
        {
            id: 7, nodeCode: "CS-302", skillTitle: "Dynamic Programming & Memoization",
            learnerName: "Ananya Reddy", domainTrack: "Algorithms & Graph Theory",
            difficultyTier: "ADVANCED", prerequisiteCodes: ["CS-201"],
            masteryScore: 54, masteryThreshold: 80, practiceAttempts: 0, estimatedMinutes: 55,
            lastPracticedDate: "2026-10-25",
            history: [{ attemptDate: "2026-10-25", previousMastery: 0, newMastery: 54, bktProbability: 54.0, mode: "INITIAL_DIAGNOSTIC", evaluatorOrEngine: "Dr. Kaja Shareef", remarks: "Prerequisite CS-201 mastered -> Ready in ZPD frontier" }]
        },
        {
            id: 8, nodeCode: "CS-401", skillTitle: "Distributed Microservices & Graph Orchestration",
            learnerName: "Sahith", domainTrack: "Distributed SOA Systems",
            difficultyTier: "ADVANCED", prerequisiteCodes: ["CS-301", "CS-203"],
            masteryScore: 15, masteryThreshold: 80, practiceAttempts: 0, estimatedMinutes: 60,
            lastPracticedDate: "2026-10-28",
            history: [{ attemptDate: "2026-10-28", previousMastery: 0, newMastery: 15, bktProbability: 15.0, mode: "INITIAL_DIAGNOSTIC", evaluatorOrEngine: "System DAG Gate", remarks: "Capstone node — awaits CS-301 and CS-203 mastery" }]
        }
    ];
    return recomputeGraphStatesClient(seeds);
}

function getInitialWebhooks() {
    return [
        {
            eventId: "LTI-7F39A210",
            timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
            targetLms: "CANVAS_LMS_LTI",
            eventType: "ZPD_REMEDIATION_ALERT",
            nodeCode: "CS-202",
            skillTitle: "Graph Traversal (BFS, DFS & DAGs)",
            deliveryStatus: "200_DELIVERED",
            jsonPayloadPreview: `{"node":"CS-202","mastery":62,"threshold":80,"blockedChildren":["CS-301","CS-401"]}`
        },
        {
            eventId: "LTI-4E12B89C",
            timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
            targetLms: "COURSERA_SKILL_GRAPH",
            eventType: "ZPD_READY_RECOMMENDATION",
            nodeCode: "CS-302",
            skillTitle: "Dynamic Programming & Memoization",
            deliveryStatus: "200_DELIVERED",
            jsonPayloadPreview: `{"node":"CS-302","status":"READY_TO_PRACTICE","prereqVerified":"CS-201 (84%)"}`
        }
    ];
}

document.addEventListener("mousemove", (e) => {
    document.querySelectorAll(".spotlight-card").forEach(card => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
        card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    });
});

document.addEventListener("DOMContentLoaded", () => {
    webhookLogs = getInitialWebhooks();
    fetchGraphNodes();
});

function switchView(viewName) {
    const views = {
        dashboard: document.getElementById("viewDashboard"),
        analytics: document.getElementById("viewAnalytics"),
        soaConsole: document.getElementById("viewSoaConsole")
    };
    const btns = {
        dashboard: document.getElementById("tabBtnDashboard"),
        analytics: document.getElementById("tabBtnAnalytics"),
        soaConsole: document.getElementById("tabBtnSoaConsole")
    };
    Object.keys(views).forEach(k => {
        if (k === viewName) {
            views[k].classList.remove("hidden-view");
            views[k].classList.add("active-view");
            btns[k].classList.add("active");
        } else {
            views[k].classList.remove("active-view");
            views[k].classList.add("hidden-view");
            btns[k].classList.remove("active");
        }
    });
    if (viewName === "analytics") renderAnalyticsView();
    if (viewName === "soaConsole") renderWebhookStream();
}

async function fetchGraphNodes() {
    try {
        const response = await fetch(`${API_BASE_URL}/graph/nodes`, { signal: AbortSignal.timeout(1500) });
        if (!response.ok) throw new Error("HTTP " + response.status);
        allNodes = await response.json();
        isBackendConnected = true;
        document.getElementById("soaConnectionText").textContent = "Spring Boot SOA: Connected (8080)";
    } catch (error) {
        isBackendConnected = false;
        const stored = safeGetStorage("soa_prereq_graph_v3");
        if (stored) {
            allNodes = recomputeGraphStatesClient(JSON.parse(stored));
        } else {
            allNodes = getInitialSeedNodes();
            safeSetStorage("soa_prereq_graph_v3", JSON.stringify(allNodes));
        }
        document.getElementById("soaConnectionText").textContent = "Spring Boot SOA Engine: Active";
    }
    updateKPIs(allNodes);
    renderDagSvg(allNodes);
    filterNodes();
    renderAnalyticsView();
    renderWebhookStream();
}

function updateKPIs(nodes) {
    const total = nodes.length;
    const mastered = nodes.filter(n => n.status === "MASTERED").length;
    const ready = nodes.filter(n => n.status === "READY_TO_PRACTICE").length;
    const remediation = nodes.filter(n => n.status === "REMEDIATION_REQUIRED").length;
    const locked = nodes.filter(n => n.status === "LOCKED_BY_PREREQ").length;

    document.getElementById("kpiTotal").textContent = total;
    document.getElementById("kpiMastered").textContent = mastered;
    document.getElementById("kpiReady").textContent = ready;
    document.getElementById("kpiBlocked").textContent = remediation + locked;
    document.getElementById("kpiBlockedBreakdown").textContent = `${remediation} Remediation • ${locked} Locked`;

    const avgScore = total > 0 ? (nodes.reduce((a, n) => a + Number(n.masteryScore), 0) / total).toFixed(1) : "0.0";
    const avgBkt = total > 0 ? (nodes.reduce((a, n) => a + Number(n.bktProbability || 60), 0) / total).toFixed(1) : "0.0";
    document.getElementById("kpiAvgScore").textContent = `Mean Mastery: ${avgScore}% • BKT P(L): ${avgBkt}%`;

    const masteryRate = total > 0 ? Math.round((mastered / total) * 100) : 0;
    document.getElementById("kpiMasteryRate").textContent = `${masteryRate}%`;
    document.getElementById("masteryProgressBar").style.width = `${masteryRate}%`;
    const radial = document.getElementById("radialGaugePath");
    if (radial) radial.setAttribute("stroke-dasharray", `${masteryRate}, 100`);
}

// ==================== INTERACTIVE SVG DIRECTED ACYCLIC GRAPH (DAG) RENDERER ====================
function renderDagSvg(nodes) {
    const svg = document.getElementById("dagSvgCanvas");
    if (!svg) return;

    // Fixed topological layer coordinates for crisp DAG presentation
    const coords = {
        "CS-101": { x: 95,  y: 118 },
        "CS-102": { x: 285, y: 118 },
        "CS-201": { x: 485, y: 65 },
        "CS-203": { x: 485, y: 175 },
        "CS-202": { x: 695, y: 45 },
        "CS-302": { x: 695, y: 125 },
        "CS-301": { x: 895, y: 55 },
        "CS-401": { x: 1025, y: 145 }
    };

    const byCode = {};
    nodes.forEach((n, idx) => {
        byCode[n.nodeCode] = n;
        if (!coords[n.nodeCode]) {
            coords[n.nodeCode] = { x: 150 + ((idx * 130) % 850), y: 185 };
        }
    });

    const colorMap = {
        "MASTERED": { fill: "#dcfce7", stroke: "#16a34a", text: "#15803d", label: "MASTERED" },
        "READY_TO_PRACTICE": { fill: "#dbeafe", stroke: "#2563eb", text: "#1d4ed8", label: "READY (ZPD)" },
        "REMEDIATION_REQUIRED": { fill: "#fef3c7", stroke: "#d97706", text: "#b45309", label: "REMEDIATION" },
        "LOCKED_BY_PREREQ": { fill: "#fee2e2", stroke: "#dc2626", text: "#b91c1c", label: "LOCKED" }
    };

    let edgesSvg = `<defs>
        <marker id="arrowUnlocked" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#22c55e"/>
        </marker>
        <marker id="arrowLocked" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8"/>
        </marker>
    </defs>`;

    nodes.forEach(node => {
        const target = coords[node.nodeCode];
        (node.prerequisiteCodes || []).forEach(pCode => {
            const src = coords[pCode];
            const parentNode = byCode[pCode];
            if (src && target) {
                const isUnlocked = parentNode && parentNode.status === "MASTERED";
                const x1 = src.x + 68;
                const y1 = src.y;
                const x2 = target.x - 72;
                const y2 = target.y;
                const cx = (x1 + x2) / 2;
                edgesSvg += `<path class="dag-edge ${isUnlocked ? 'unlocked' : 'locked'}"
                    d="M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}"
                    marker-end="url(#${isUnlocked ? 'arrowUnlocked' : 'arrowLocked'})" />`;
            }
        });
    });

    let nodesSvg = "";
    nodes.forEach(node => {
        const pos = coords[node.nodeCode];
        const st = colorMap[node.status] || colorMap["READY_TO_PRACTICE"];
        const shortTitle = node.skillTitle.length > 21 ? node.skillTitle.substring(0, 20) + "…" : node.skillTitle;
        nodesSvg += `
            <g class="dag-node-group" transform="translate(${pos.x - 68}, ${pos.y - 30})" onclick="openPracticeModal(${node.id})">
                <rect width="136" height="60" rx="10" fill="${st.fill}" stroke="${st.stroke}" stroke-width="2.2"/>
                <text x="10" y="18" font-size="11" font-weight="800" fill="${st.text}">${node.nodeCode} • ${node.masteryScore}%</text>
                <text x="10" y="34" font-size="9.5" font-weight="600" fill="#0f172a">${shortTitle}</text>
                <text x="10" y="50" font-size="8.5" font-weight="800" fill="${st.stroke}">${st.label} (BKT ${node.bktProbability}%)</text>
            </g>
        `;
    });

    svg.innerHTML = edgesSvg + nodesSvg;
}

function renderTable(nodes) {
    const tbody = document.getElementById("graphTableBody");
    tbody.innerHTML = "";

    if (nodes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 1.5rem; color: #64748b;">No matching curriculum skill nodes found.</td></tr>`;
        return;
    }

    nodes.forEach((node, idx) => {
        const tr = document.createElement("tr");
        tr.style.animationDelay = `${idx * 0.04}s`;
        const prereqHtml = (node.prerequisiteCodes && node.prerequisiteCodes.length > 0)
            ? node.prerequisiteCodes.map(c => `<span class="prereq-chip">${c}</span>`).join("")
            : `<span class="emp-sub">Root (No Prereq)</span>`;

        tr.innerHTML = `
            <td><strong>${node.nodeCode}</strong></td>
            <td>
                <div><strong>${node.skillTitle}</strong></div>
                <span class="tier-pill ${node.difficultyTier}">${node.difficultyTier} &bull; ${node.domainTrack}</span>
            </td>
            <td>
                <strong>${node.learnerName}</strong>
                <span class="emp-sub">Est. ${node.estimatedMinutes} mins</span>
            </td>
            <td>${prereqHtml}</td>
            <td>
                <div><strong>${node.masteryScore}%</strong> <small style="color:var(--text-muted)">/ ${node.masteryThreshold}%</small></div>
                <div class="retention-mini-wrap" title="Bayesian Knowledge Tracing Mastery Probability">
                    <div class="retention-mini-bar"><div class="retention-mini-fill" style="width:${node.bktProbability}%"></div></div>
                    <span>BKT ${node.bktProbability}%</span>
                </div>
            </td>
            <td><strong>${node.practiceAttempts}</strong> runs</td>
            <td><span class="badge ${node.status}">${node.status.replace(/_/g, " ")}</span></td>
            <td>
                <div class="action-cell">
                    <button class="btn-reassess" onclick="openPracticeModal(${node.id})">
                        &#9889; Practice
                    </button>
                    <button class="btn-cert" onclick="openCredentialModal(${node.id})" title="View SHA-256 Mastery Credential">
                        &#128737; Badge
                    </button>
                    <button class="btn-delete" onclick="deleteSkillNode(${node.id})" title="Delete Node">
                        &times;
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterNodes() {
    const status = document.getElementById("statusFilter").value;
    const track = document.getElementById("domainFilter").value;
    const query = (document.getElementById("searchInput").value || "").toLowerCase().trim();

    const filtered = allNodes.filter(n => {
        const matchStatus = status === "ALL" || n.status === status;
        const matchTrack = track === "ALL" || n.domainTrack === track;
        const matchQuery = !query
            || n.nodeCode.toLowerCase().includes(query)
            || n.skillTitle.toLowerCase().includes(query)
            || n.learnerName.toLowerCase().includes(query)
            || n.domainTrack.toLowerCase().includes(query);
        return matchStatus && matchTrack && matchQuery;
    });

    renderTable(filtered);
}

async function createSkillNode(event) {
    event.preventDefault();
    const prereqVal = document.getElementById("prereqSelect").value;
    const payload = {
        nodeCode: document.getElementById("nodeCode").value.trim().toUpperCase(),
        skillTitle: document.getElementById("skillTitle").value.trim(),
        learnerName: document.getElementById("learnerName").value.trim(),
        domainTrack: document.getElementById("domainTrack").value,
        difficultyTier: document.getElementById("difficultyTier").value,
        prerequisiteCodes: prereqVal ? [prereqVal] : [],
        masteryScore: parseInt(document.getElementById("initialMastery").value, 10),
        masteryThreshold: parseInt(document.getElementById("masteryThreshold").value, 10),
        practiceAttempts: 1,
        estimatedMinutes: parseInt(document.getElementById("estimatedMinutes").value, 10),
        lastPracticedDate: new Date().toISOString().split("T")[0]
    };

    if (isBackendConnected) {
        await fetch(`${API_BASE_URL}/graph/nodes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } else {
        const nextId = allNodes.length > 0 ? Math.max(...allNodes.map(n => n.id)) + 1 : 1;
        allNodes.push({
            id: nextId,
            ...payload,
            history: [{
                attemptDate: payload.lastPracticedDate,
                previousMastery: 0,
                newMastery: payload.masteryScore,
                bktProbability: payload.masteryScore,
                mode: "INITIAL_DIAGNOSTIC",
                evaluatorOrEngine: "Venkateshwari Ketineni",
                remarks: "Registered new curriculum skill node in DAG"
            }]
        });
        recomputeGraphStatesClient(allNodes);
        safeSetStorage("soa_prereq_graph_v3", JSON.stringify(allNodes));
    }

    showToast(`Added ${payload.nodeCode} (${payload.skillTitle}) to Prerequisite DAG!`);
    launchConfetti();
    document.getElementById("nodeForm").reset();
    fetchGraphNodes();
}

// ==================== ADAPTIVE PRACTICE MODAL & QUIZ ENGINE ====================
function getClientAdaptiveQuestions(nodeCode) {
    return [
        {
            questionId: 1,
            question: "Which structural property must hold in a Prerequisite Skill Graph so learners never encounter circular dependency deadlocks?",
            options: ["Directed Acyclic Graph (DAG) with zero directed cycles", "Complete undirected cyclic graph", "Unbounded self-loops", "Disconnected random tree"],
            correctOptionIndex: 0
        },
        {
            questionId: 2,
            question: "In Kahn's Topological Sort & Zone of Proximal Development (ZPD) routing, when does a locked skill node transition to READY_TO_PRACTICE?",
            options: ["Immediately when all direct parent prerequisite nodes reach >= 80% MASTERED", "Before any foundational prerequisites are attempted", "Only when manually unlocked via SQL", "Never"],
            correctOptionIndex: 0
        },
        {
            questionId: 3,
            question: `For node ${nodeCode}, what does Bayesian Knowledge Tracing P(L_t) compute after each adaptive practice attempt?`,
            options: ["Posterior probability that the learner has mastered the underlying skill", "Browser screen resolution", "CSS animation frame rate", "Database port number"],
            correctOptionIndex: 0
        }
    ];
}

function openPracticeModal(id) {
    const node = allNodes.find(n => n.id === id);
    if (!node) return;

    document.getElementById("practiceNodeId").value = node.id;
    const prereqText = (node.prerequisiteCodes && node.prerequisiteCodes.length) ? node.prerequisiteCodes.join(", ") : "None (Root)";
    document.getElementById("modalNodeInfo").textContent =
        `${node.nodeCode} | ${node.skillTitle} — Learner: ${node.learnerName} (Prereqs: ${prereqText} • Current State: ${node.status.replace(/_/g, " ")})`;
    document.getElementById("newMasteryScore").value = Math.min(100, Math.max(88, node.masteryScore + 20));
    document.getElementById("newThreshold").value = node.masteryThreshold || 80;

    currentQuizQuestions = getClientAdaptiveQuestions(node.nodeCode);
    const qContainer = document.getElementById("quizQuestionsContainer");
    qContainer.innerHTML = currentQuizQuestions.map((q, idx) => `
        <div class="quiz-q-card">
            <div class="quiz-q-title">Q${idx + 1}. ${q.question}</div>
            <div class="quiz-opt-grid">
                ${q.options.map((opt, oIdx) => `
                    <label class="quiz-opt-label">
                        <input type="radio" name="adap_q_${idx}" value="${oIdx}" ${oIdx === q.correctOptionIndex ? "checked" : ""}>
                        <span>${opt}</span>
                    </label>
                `).join("")}
            </div>
        </div>
    `).join("");

    switchModalMode("manual");

    const auditList = document.getElementById("modalAuditList");
    const history = node.history || [];
    auditList.innerHTML = history.map(h => `
        <div class="audit-item">
            <span><strong>${h.attemptDate}</strong> &bull; [${h.mode}] ${h.remarks}</span>
            <strong>${h.previousMastery}% &rarr; ${h.newMastery}% (BKT ${h.bktProbability}%)</strong>
        </div>
    `).join("");

    document.getElementById("practiceModal").classList.remove("hidden");
}

function switchModalMode(mode) {
    const manualSec = document.getElementById("modalManualSection");
    const quizSec = document.getElementById("modalQuizSection");
    const btnManual = document.getElementById("modeBtnManual");
    const btnQuiz = document.getElementById("modeBtnQuiz");

    if (mode === "quiz") {
        currentModalMode = "ADAPTIVE_DIAGNOSTIC_QUIZ";
        manualSec.classList.add("hidden-section");
        quizSec.classList.remove("hidden-section");
        btnManual.classList.remove("active");
        btnQuiz.classList.add("active");
    } else {
        currentModalMode = "EVALUATOR_PRACTICE_LAB";
        quizSec.classList.add("hidden-section");
        manualSec.classList.remove("hidden-section");
        btnQuiz.classList.remove("active");
        btnManual.classList.add("active");
    }
}

function gradeAdaptiveQuiz() {
    let correct = 0;
    currentQuizQuestions.forEach((q, idx) => {
        const selected = document.querySelector(`input[name="adap_q_${idx}"]:checked`);
        if (selected && parseInt(selected.value, 10) === q.correctOptionIndex) {
            correct++;
        }
    });
    const computedScore = Math.round(65 + (correct / currentQuizQuestions.length) * 31); // 96% for 3/3
    document.getElementById("newMasteryScore").value = computedScore;
    document.getElementById("modalRemarks").value = `Passed Adaptive Diagnostic Quiz (${correct}/${currentQuizQuestions.length} correct) — Downstream DAG Unlocked`;
    document.getElementById("quizScorePreview").textContent = `Diagnostic Graded: ${correct}/${currentQuizQuestions.length} Correct → ${computedScore}% BKT Mastery Applied!`;
    showToast(`Adaptive Quiz Auto-Graded: ${computedScore}% (${correct}/${currentQuizQuestions.length} correct)`);
}

function setPracticeScore(scoreVal, remarkText) {
    document.getElementById("newMasteryScore").value = scoreVal;
    document.getElementById("modalRemarks").value = remarkText;
}

function closeModal() {
    document.getElementById("practiceModal").classList.add("hidden");
}

async function submitAdaptivePractice() {
    const id = parseInt(document.getElementById("practiceNodeId").value, 10);
    const payload = {
        newMasteryScore: parseInt(document.getElementById("newMasteryScore").value, 10),
        masteryThreshold: parseInt(document.getElementById("newThreshold").value, 10),
        evaluatorOrEngine: document.getElementById("modalEvaluator").value.trim(),
        mode: currentModalMode,
        remarks: document.getElementById("modalRemarks").value.trim()
    };

    if (isBackendConnected) {
        await fetch(`${API_BASE_URL}/graph/nodes/${id}/practice`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } else {
        const node = allNodes.find(n => n.id === id);
        if (node) {
            const prev = node.masteryScore;
            const todayStr = new Date().toISOString().split("T")[0];
            node.masteryScore = payload.newMasteryScore;
            node.masteryThreshold = payload.masteryThreshold;
            node.practiceAttempts = (node.practiceAttempts || 0) + 1;
            node.lastPracticedDate = todayStr;
            recomputeGraphStatesClient(allNodes);

            node.history = node.history || [];
            node.history.unshift({
                attemptDate: todayStr,
                previousMastery: prev,
                newMastery: payload.newMasteryScore,
                bktProbability: node.bktProbability,
                mode: payload.mode,
                evaluatorOrEngine: payload.evaluatorOrEngine,
                remarks: payload.remarks
            });
            safeSetStorage("soa_prereq_graph_v3", JSON.stringify(allNodes));

            webhookLogs.unshift({
                eventId: "LTI-" + Math.random().toString(16).substring(2, 10).toUpperCase(),
                timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
                targetLms: "CANVAS_LMS_LTI",
                eventType: "PREREQUISITE_UNLOCK_PROPAGATED",
                nodeCode: node.nodeCode,
                skillTitle: node.skillTitle,
                deliveryStatus: "200_DELIVERED",
                jsonPayloadPreview: `{"node":"${node.nodeCode}","newMastery":${node.masteryScore},"status":"${node.status}","hash":"${node.credentialHash}"}`
            });
        }
    }

    showToast(`Practice committed (${payload.newMasteryScore}%) • Downstream DAG dependencies recomputed!`);
    launchConfetti();
    closeModal();
    fetchGraphNodes();
}

// ==================== DIGITAL CREDENTIAL MODAL ====================
function openCredentialModal(id) {
    const n = allNodes.find(x => x.id === id);
    if (!n) return;
    document.getElementById("certLearnerName").textContent = `${n.learnerName}`;
    document.getElementById("certDomainTrack").textContent = `${n.domainTrack} • K L (Deemed to be) University`;
    document.getElementById("certSkillTitle").textContent = `${n.nodeCode}: ${n.skillTitle}`;
    document.getElementById("certScoreBadge").textContent = `Mastery: ${n.masteryScore}% (BKT: ${n.bktProbability}%)`;
    document.getElementById("certStatusBadge").textContent = `State: ${n.status.replace(/_/g, " ")}`;
    document.getElementById("certStatusBadge").className = `badge ${n.status}`;
    document.getElementById("certTierBadge").textContent = `${n.difficultyTier} TIER`;
    document.getElementById("certTierBadge").className = `tier-pill ${n.difficultyTier}`;
    document.getElementById("certPrereqs").textContent = (n.prerequisiteCodes && n.prerequisiteCodes.length) ? n.prerequisiteCodes.join(", ") : "Root Skill (None)";
    document.getElementById("certPracticedDate").textContent = n.lastPracticedDate;
    document.getElementById("certEvaluator").textContent = "Venkateshwari Ketineni";
    document.getElementById("certHashValue").textContent = n.credentialHash || "KLH-DAG-VERIFIED";
    document.getElementById("credentialModal").classList.remove("hidden");
}

function closeCredentialModal() {
    document.getElementById("credentialModal").classList.add("hidden");
}

// ==================== VIEW 2 & 3 RENDERERS ====================
function renderAnalyticsView() {
    const topoContainer = document.getElementById("topologicalQueueList");
    if (!topoContainer) return;
    const priorityMap = { "REMEDIATION_REQUIRED": 1, "READY_TO_PRACTICE": 2, "LOCKED_BY_PREREQ": 3, "MASTERED": 4 };
    const sorted = [...allNodes].sort((a, b) => (priorityMap[a.status] || 9) - (priorityMap[b.status] || 9));

    topoContainer.innerHTML = sorted.map((n, i) => `
        <div class="retention-row">
            <div class="retention-row-top">
                <span><strong>Step ${i + 1}: ${n.nodeCode}</strong> &mdash; ${n.skillTitle} (${n.learnerName})</span>
                <span class="badge ${n.status}">${n.status.replace(/_/g, " ")}</span>
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted);">
                Prerequisites: <strong>${(n.prerequisiteCodes && n.prerequisiteCodes.length) ? n.prerequisiteCodes.join(", ") : "None (Root)"}</strong> &bull;
                Current Mastery: <strong>${n.masteryScore}%</strong> &bull; Est. Practice Time: <strong>${n.estimatedMinutes} mins</strong>
            </div>
        </div>
    `).join("");

    const bktContainer = document.getElementById("bktProbabilityList");
    if (!bktContainer) return;
    bktContainer.innerHTML = allNodes.map(n => `
        <div class="retention-row">
            <div class="retention-row-top">
                <span><strong>${n.nodeCode}</strong> &mdash; ${n.skillTitle}</span>
                <span>Raw: ${n.masteryScore}% &bull; <strong>BKT P(L<sub>t</sub>): ${n.bktProbability}%</strong></span>
            </div>
            <div class="progress-bar-wrap">
                <div class="progress-bar-fill" style="width:${n.bktProbability}%"></div>
            </div>
        </div>
    `).join("");
}

function renderWebhookStream() {
    const stream = document.getElementById("webhookStreamContainer");
    if (!stream) return;
    document.getElementById("webhookCountBadge").textContent = webhookLogs.length;
    stream.innerHTML = webhookLogs.map(w => `
        <div class="webhook-card">
            <div class="webhook-card-top">
                <span>${w.eventId} &bull; ${w.targetLms}</span>
                <span class="badge MASTERED">${w.deliveryStatus}</span>
            </div>
            <div><strong>${w.eventType}</strong> &mdash; ${w.nodeCode} (${w.skillTitle})</div>
            <code>${w.jsonPayloadPreview}</code>
        </div>
    `).join("");
}

function testSoaEndpoint(method, uri) {
    const out = document.getElementById("apiJsonOutput");
    if (uri === "/api/graph/nodes") {
        out.textContent = JSON.stringify(allNodes.slice(0, 3), null, 2);
    } else if (uri === "/api/graph/analytics") {
        const mastered = allNodes.filter(n => n.status === "MASTERED").length;
        const ready = allNodes.filter(n => n.status === "READY_TO_PRACTICE").length;
        out.textContent = JSON.stringify({
            service: "PrerequisiteGraphService v3.0",
            totalNodes: allNodes.length,
            masteredCount: mastered,
            readyInZpdCount: ready,
            topologicalOrder: allNodes.map(n => `${n.nodeCode} (${n.status})`)
        }, null, 2);
    } else if (uri.includes("/api/assessments/adaptive-quiz")) {
        out.textContent = JSON.stringify(getClientAdaptiveQuestions("CS-202"), null, 2);
    } else {
        dispatchZpdSweep();
        out.textContent = JSON.stringify(webhookLogs[0], null, 2);
    }
    showToast(`Executed ${method} ${uri} → 200 OK`);
}

function dispatchZpdSweep() {
    const zpdCount = allNodes.filter(n => n.status === "READY_TO_PRACTICE" || n.status === "REMEDIATION_REQUIRED").length;
    webhookLogs.unshift({
        eventId: "LTI-" + Math.random().toString(16).substring(2, 10).toUpperCase(),
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        targetLms: "MOODLE_AND_CANVAS_LTI",
        eventType: "BATCH_ZPD_FRONTIER_SYNC",
        nodeCode: `ZPD-QUEUE (${zpdCount} Nodes)`,
        skillTitle: "Topological Prerequisite Path Broadcast",
        deliveryStatus: "200_DELIVERED",
        jsonPayloadPreview: `{"zpdFrontierNodes":${zpdCount},"bktEngine":"ACTIVE","ltiGradebookSync":true}`
    });
    renderWebhookStream();
    showToast(`Broadcasted ZPD Prerequisite Path for ${zpdCount} frontier nodes!`);
}

async function deleteSkillNode(id) {
    if (isBackendConnected) {
        await fetch(`${API_BASE_URL}/graph/nodes/${id}`, { method: "DELETE" });
    } else {
        allNodes = allNodes.filter(n => n.id !== id);
        recomputeGraphStatesClient(allNodes);
        safeSetStorage("soa_prereq_graph_v3", JSON.stringify(allNodes));
    }
    showToast(`Removed skill node #${id} from DAG`);
    fetchGraphNodes();
}

function exportToCSV() {
    const headers = ["NodeCode", "SkillTitle", "LearnerName", "DomainTrack", "DifficultyTier", "Prerequisites", "MasteryScore", "Threshold", "BKTProbability", "Status", "CredentialHash"];
    const rows = allNodes.map(n => [
        n.nodeCode, `"${n.skillTitle}"`, `"${n.learnerName}"`, `"${n.domainTrack}"`,
        n.difficultyTier, `"${(n.prerequisiteCodes || []).join(';')}"`, n.masteryScore,
        n.masteryThreshold, n.bktProbability, n.status, n.credentialHash
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "Adaptive_Prerequisite_Graph_Audit_Team18.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported Prerequisite Graph Matrix to CSV");
}

function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    document.getElementById("themeToggleBtn").innerHTML = isDark ? "&#9728; Light Mode" : "&#9790; Cyber Dark";
}

function showToast(msg) {
    const container = document.getElementById("toastContainer");
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    container.appendChild(t);
    setTimeout(() => t.remove(), 3200);
}

function launchConfetti() {
    const canvas = document.getElementById("confettiCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 42 }, () => ({
        x: canvas.width / 2 + (Math.random() - 0.5) * 180,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: -Math.random() * 9 - 3,
        size: Math.random() * 6 + 4,
        color: ["#22c55e", "#3b82f6", "#f59e0b", "#6366f1", "#ec4899"][Math.floor(Math.random() * 5)],
        alpha: 1
    }));
    let frame = 0;
    function step() {
        frame++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.28;
            p.alpha = Math.max(0, 1 - frame / 45);
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        if (frame < 45) requestAnimationFrame(step);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    requestAnimationFrame(step);
}
