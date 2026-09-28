(() => {
  "use strict";

  const APP_VERSION = "0.2.0";

  const state = {
    workbook: null,
    matrix: [],
    sheetName: "",
    headerRow: -1,
    mapping: {},
    rows: [],
    selectedDataset: null,
    lastAssessment: null
  };

  const els = {
    databaseFile: document.getElementById("databaseFile"),
    sheetSelect: document.getElementById("sheetSelect"),
    databaseStatus: document.getElementById("databaseStatus"),
    mappingSummary: document.getElementById("mappingSummary"),
    processDescription: document.getElementById("processDescription"),
    archetype: document.getElementById("archetype"),
    processGeography: document.getElementById("processGeography"),
    processUnit: document.getElementById("processUnit"),
    datasetPurpose: document.getElementById("datasetPurpose"),
    datasetSearch: document.getElementById("datasetSearch"),
    datasetSearchResults: document.getElementById("datasetSearchResults"),
    selectedDataset: document.getElementById("selectedDataset"),
    evaluateBtn: document.getElementById("evaluateBtn"),
    resetBtn: document.getElementById("resetBtn"),
    resultsPanel: document.getElementById("resultsPanel"),
    fitVerdict: document.getElementById("fitVerdict"),
    fitScore: document.getElementById("fitScore"),
    fitMeter: document.getElementById("fitMeter"),
    confidenceScore: document.getElementById("confidenceScore"),
    confidenceLabel: document.getElementById("confidenceLabel"),
    confidenceMeter: document.getElementById("confidenceMeter"),
    robustnessScore: document.getElementById("robustnessScore"),
    robustnessLabel: document.getElementById("robustnessLabel"),
    breakdown: document.getElementById("breakdown"),
    assessmentNotes: document.getElementById("assessmentNotes"),
    candidateResults: document.getElementById("candidateResults"),
    candidateCount: document.getElementById("candidateCount"),
    reviewBtn: document.getElementById("reviewBtn"),
    reviewEmail: document.getElementById("reviewEmail"),
    appVersion: document.getElementById("appVersion")
  };

  const FIELD_ALIASES = {
    activity: [
      "activity name", "activityname", "activity", "dataset name", "datasetname", "name"
    ],
    geography: [
      "geography", "geographical location", "geographic location", "location", "geo"
    ],
    specialType: [
      "special activity type", "specialactivitytype"
    ],
    sector: [
      "sector", "activity sector", "activitysector"
    ],
    isic: [
      "isic classification", "isicclassification", "isic"
    ],
    isicSection: [
      "isic section", "isicsection"
    ],
    cpc: [
      "cpc classification", "cpcclassification", "cpc"
    ],
    hs: [
      "hs2017 classification", "hs2017classification", "hs classification", "hsclassification", "hs2017", "hs"
    ],
    unit: [
      "unit", "reference unit", "referenceunit", "unit name", "unitname"
    ],
    productInfo: [
      "product information", "productinformation"
    ],
    product: [
      "reference product", "referenceproduct", "reference flow", "referenceflow",
      "product name", "productname", "product"
    ],
    technology: [
      "technology", "technology comment", "technologycomment", "general comment",
      "generalcomment", "comment", "dataset comment", "datasetcomment", "description"
    ],
    id: [
      "activity uuid", "activityuuid", "activity id", "activityid", "uuid", "dataset id", "datasetid", "id"
    ],
    type: [
      "activity type", "activitytype", "dataset type", "datasettype", "type"
    ]
  };

  const WEIGHTS = {
    manufacturing: { process: 35, product: 25, context: 15, geography: 10, unit: 5, role: 10 },
    material:      { process: 25, product: 30, context: 15, geography: 15, unit: 5, role: 10 },
    energy:        { process: 25, product: 20, context: 10, geography: 30, unit: 5, role: 10 },
    transport:     { process: 30, product: 10, context: 10, geography: 10, unit: 25, role: 15 },
    waste:         { process: 30, product: 20, context: 15, geography: 15, unit: 5, role: 15 },
    chemical:      { process: 30, product: 30, context: 15, geography: 10, unit: 5, role: 10 },
    agriculture:   { process: 25, product: 25, context: 15, geography: 20, unit: 5, role: 10 },
    construction:  { process: 30, product: 25, context: 15, geography: 15, unit: 5, role: 10 },
    service:       { process: 35, product: 15, context: 15, geography: 10, unit: 10, role: 15 }
  };

  const PHRASE_REPLACEMENTS = [
    ["stampaggio a iniezione", "injection moulding"],
    ["stampaggio ad iniezione", "injection moulding"],
    ["stampaggio per iniezione", "injection moulding"],
    ["lavorazione a caldo", "hot working"],
    ["lavorazione a freddo", "cold working"],
    ["profilo di alluminio", "aluminium profile"],
    ["profilato di alluminio", "aluminium profile"],
    ["energia elettrica", "electricity"],
    ["trattamento rifiuti", "waste treatment"],
    ["trattamento dei rifiuti", "waste treatment"],
    ["trasporto su strada", "road transport"],
    ["trasporto stradale", "road transport"],
    ["acciaio inossidabile", "stainless steel"],
    ["fusione in sabbia", "sand casting"],
    ["pressofusione", "die casting"]
  ];

  const SYNONYMS = {
    alluminio: "aluminium",
    aluminum: "aluminium",
    acciaio: "steel",
    plastica: "plastic",
    polimero: "polymer",
    polimero: "polymer",
    estrusione: "extrusion",
    estruso: "extrusion",
    estrusa: "extrusion",
    stampaggio: "moulding",
    iniezione: "injection",
    laminazione: "rolling",
    laminato: "rolling",
    lavorazione: "processing",
    lavorato: "processing",
    produzione: "production",
    fabbricazione: "manufacturing",
    verniciatura: "coating",
    rivestimento: "coating",
    saldatura: "welding",
    tornitura: "turning",
    fresatura: "milling",
    fusione: "casting",
    riciclo: "recycling",
    riciclato: "recycled",
    elettricita: "electricity",
    elettricità: "electricity",
    calore: "heat",
    trasporto: "transport",
    camion: "lorry",
    autocarro: "lorry",
    nave: "ship",
    ferroviario: "rail",
    rifiuto: "waste",
    rifiuti: "waste",
    trattamento: "treatment",
    incenerimento: "incineration",
    discarica: "landfill",
    chimico: "chemical",
    chimica: "chemical",
    agricolo: "agriculture",
    agricoltura: "agriculture",
    costruzione: "construction",
    servizio: "service",
    profilo: "profile",
    profilato: "profile",
    lamiera: "sheet",
    tubo: "tube",
    barra: "bar",
    rame: "copper",
    zinco: "zinc",
    ferro: "iron",
    vetro: "glass",
    carta: "paper",
    cartone: "cardboard",
    legno: "wood",
    cemento: "cement",
    calcestruzzo: "concrete"
  };

  const STOPWORDS = new Set([
    "a", "ad", "al", "alla", "alle", "con", "da", "dal", "dalla", "dei", "del", "della",
    "di", "e", "ed", "il", "in", "la", "le", "lo", "per", "un", "una",
    "and", "for", "from", "in", "of", "the", "to", "with"
  ]);

  const EU_CODES = new Set([
    "AT","BE","BG","HR","CY","CZ","DE","DK","EE","ES","FI","FR","GR","HU","IE","IT",
    "LT","LU","LV","MT","NL","PL","PT","RO","SE","SI","SK"
  ]);

  const GEO_ALIASES = {
    italy: "IT",
    italia: "IT",
    germany: "DE",
    germania: "DE",
    france: "FR",
    francia: "FR",
    spain: "ES",
    spagna: "ES",
    europe: "RER",
    europa: "RER",
    global: "GLO",
    worldwide: "GLO",
    world: "GLO",
    "rest of world": "ROW"
  };

  function normalizeHeader(value) {
    return String(value ?? "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "");
  }

  function cleanText(value) {
    return String(value ?? "").replace(/\s+/g, " ").trim();
  }

  function canonicalizeText(value) {
    let text = cleanText(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    for (const [source, target] of PHRASE_REPLACEMENTS) {
      text = text.replaceAll(source.normalize("NFD").replace(/[\u0300-\u036f]/g, ""), target);
    }
    return text.replace(/[^a-z0-9]+/g, " ").trim();
  }

  function tokens(value) {
    const raw = canonicalizeText(value).split(/\s+/).filter(Boolean);
    const out = [];
    for (const token of raw) {
      if (STOPWORDS.has(token)) continue;
      const mapped = SYNONYMS[token] || token;
      if (mapped.length > 1) out.push(mapped);
    }
    return [...new Set(out)];
  }

  function tokenSimilarityFromTokens(queryTokens, targetTokens) {
    const q = [...new Set(queryTokens || [])];
    const t = new Set(targetTokens || []);
    if (!q.length || !t.size) return 0;
    const intersection = q.filter(token => t.has(token)).length;
    const coverage = intersection / q.length;
    const union = new Set([...q, ...t]).size || 1;
    const jaccard = intersection / union;
    return Math.max(0, Math.min(100, Math.round((coverage * 0.78 + jaccard * 0.22) * 100)));
  }

  function tokenSimilarity(query, target) {
    return tokenSimilarityFromTokens(tokens(query), tokens(target));
  }

  function detectColumn(headers, aliases) {
    const normalizedAliases = aliases.map(normalizeHeader);
    let bestIndex = -1;
    let bestScore = 0;

    headers.forEach((header, index) => {
      const normalized = normalizeHeader(header);
      if (!normalized) return;

      normalizedAliases.forEach(alias => {
        let score = 0;
        if (normalized === alias) score = 100;
        else if (alias.length >= 7 && normalized.includes(alias)) score = 72;
        else if (normalized.length >= 7 && alias.includes(normalized)) score = 60;

        if (score > bestScore) {
          bestScore = score;
          bestIndex = index;
        }
      });
    });

    return bestScore >= 60 ? bestIndex : -1;
  }

  function detectMapping(headers) {
    const mapping = {};
    Object.entries(FIELD_ALIASES).forEach(([field, aliases]) => {
      mapping[field] = detectColumn(headers, aliases);
    });
    return mapping;
  }

  function mappingQuality(mapping) {
    return (
      (mapping.activity >= 0 ? 6 : 0) +
      (mapping.geography >= 0 ? 2 : 0) +
      (mapping.specialType >= 0 ? 2 : 0) +
      (mapping.sector >= 0 ? 2 : 0) +
      (mapping.productInfo >= 0 ? 2 : 0) +
      (mapping.cpc >= 0 ? 1 : 0) +
      (mapping.isic >= 0 ? 1 : 0) +
      (mapping.unit >= 0 ? 1 : 0) +
      (mapping.product >= 0 ? 1 : 0)
    );
  }

  function detectHeaderRow(matrix) {
    let best = { row: -1, score: -1, mapping: {} };
    const limit = Math.min(matrix.length, 30);

    for (let i = 0; i < limit; i += 1) {
      const row = matrix[i] || [];
      const mapping = detectMapping(row);
      const score = mappingQuality(mapping);
      if (score > best.score) best = { row: i, score, mapping };
    }

    return best;
  }

  function safeCell(row, index) {
    return index >= 0 ? cleanText(row[index]) : "";
  }

  function buildRows(matrix, headerRow, mapping) {
    const output = [];

    for (let i = headerRow + 1; i < matrix.length; i += 1) {
      const source = matrix[i] || [];
      const activity = safeCell(source, mapping.activity);
      const product = safeCell(source, mapping.product);
      if (!activity && !product) continue;

      const row = {
        _rowIndex: i + 1,
        activity,
        product,
        geography: safeCell(source, mapping.geography),
        specialType: safeCell(source, mapping.specialType),
        sector: safeCell(source, mapping.sector),
        isic: safeCell(source, mapping.isic),
        isicSection: safeCell(source, mapping.isicSection),
        cpc: safeCell(source, mapping.cpc),
        hs: safeCell(source, mapping.hs),
        unit: safeCell(source, mapping.unit),
        productInfo: safeCell(source, mapping.productInfo),
        technology: safeCell(source, mapping.technology),
        id: safeCell(source, mapping.id),
        type: safeCell(source, mapping.type)
      };

      row._activityTokens = tokens(`${row.activity} ${row.technology}`);
      row._productTokens = tokens(`${row.product} ${row.productInfo} ${row.cpc} ${row.hs}`).slice(0, 180);
      row._contextTokens = tokens(`${row.sector} ${row.isic} ${row.isicSection} ${row.cpc}`).slice(0, 120);
      row._searchCanonical = canonicalizeText(
        `${row.activity} ${row.product} ${row.geography} ${row.specialType} ${row.sector} ${row.isic} ${row.cpc} ${row.hs} ${row.productInfo.slice(0, 650)}`
      );
      output.push(row);
    }

    return output;
  }

  function datasetLabel(row) {
    const main = row.activity || row.product || "Unnamed dataset";
    const meta = [row.geography, row.specialType, row.sector, row.unit].filter(Boolean).join(" · ");
    return { main, meta };
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setDatabaseStatus(text, kind = "neutral") {
    els.databaseStatus.textContent = text;
    els.databaseStatus.className = `status ${kind}`;
  }

  function renderMapping() {
    const headers = state.matrix[state.headerRow] || [];
    const fields = [
      ["activity", "Activity"],
      ["geography", "Geography"],
      ["specialType", "Special activity type"],
      ["sector", "Sector"],
      ["isic", "ISIC"],
      ["isicSection", "ISIC section"],
      ["cpc", "CPC"],
      ["hs", "HS2017"],
      ["unit", "Unit"],
      ["productInfo", "Product information"]
    ];

    const tags = fields.map(([field, label]) => {
      const idx = state.mapping[field];
      const mapped = idx >= 0;
      const suffix = mapped ? `: ${escapeHtml(headers[idx])}` : "";
      return `<span class="tag ${mapped ? "mapped" : ""}">${escapeHtml(label)}${suffix}</span>`;
    }).join("");

    const exactEcoinventProfile = [
      "activity", "geography", "specialType", "sector", "isic",
      "isicSection", "cpc", "hs", "unit", "productInfo"
    ].every(field => state.mapping[field] >= 0);

    els.mappingSummary.innerHTML = `
      <p><strong>${state.rows.length.toLocaleString()} datasets</strong> loaded. Header detected on Excel row ${state.headerRow + 1}.
      ${exactEcoinventProfile ? "<strong>Ecoinvent 3.11 catalogue profile recognized.</strong>" : ""}</p>
      <div class="mapping-tags">${tags}</div>
    `;
  }

  function populateSheetSelector(workbook) {
    els.sheetSelect.innerHTML = workbook.SheetNames
      .map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
      .join("");
    els.sheetSelect.disabled = false;
  }

  function parseSheet(sheetName) {
    const sheet = state.workbook.Sheets[sheetName];
    const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });
    const detected = detectHeaderRow(matrix);

    state.sheetName = sheetName;
    state.matrix = matrix;
    state.headerRow = detected.row;
    state.mapping = detected.mapping;
    state.rows = detected.row >= 0 ? buildRows(matrix, detected.row, detected.mapping) : [];
    state.selectedDataset = null;
    state.lastAssessment = null;

    if (state.mapping.activity < 0 && state.mapping.product < 0) {
      setDatabaseStatus("Columns not recognized", "danger");
      els.datasetSearch.disabled = true;
      els.mappingSummary.innerHTML = "<p>No activity/name or reference-product column could be identified automatically in this worksheet.</p>";
      updateSelectedDataset();
      updateEvaluateState();
      return;
    }

    if (!state.rows.length) {
      setDatabaseStatus("No datasets found", "danger");
      els.datasetSearch.disabled = true;
      els.mappingSummary.innerHTML = "<p>The worksheet was read, but no usable dataset rows were found below the detected header.</p>";
      updateSelectedDataset();
      updateEvaluateState();
      return;
    }

    setDatabaseStatus(`${state.rows.length.toLocaleString()} datasets ready`, "good");
    els.datasetSearch.disabled = false;
    els.datasetSearch.value = "";
    els.datasetSearchResults.innerHTML = "";
    renderMapping();
    updateSelectedDataset();
    updateEvaluateState();
  }

  async function loadWorkbook(file) {
    setDatabaseStatus("Reading workbook…", "neutral");

    try {
      const buffer = await file.arrayBuffer();
      state.workbook = XLSX.read(buffer, { type: "array", cellDates: false });
      populateSheetSelector(state.workbook);
      parseSheet(state.workbook.SheetNames[0]);
    } catch (error) {
      console.error(error);
      state.workbook = null;
      state.rows = [];
      setDatabaseStatus("Workbook error", "danger");
      els.mappingSummary.innerHTML = "<p>The file could not be parsed. Confirm that it is a valid Excel or CSV export.</p>";
      els.datasetSearch.disabled = true;
      updateEvaluateState();
    }
  }

  function searchDatasets(query) {
    const q = cleanText(query);
    if (!q || q.length < 2) return [];

    const canonicalQuery = canonicalizeText(q);
    const queryTokens = tokens(q);

    return state.rows
      .map(row => {
        const direct = row._searchCanonical.includes(canonicalQuery) ? 1 : 0;
        const activitySimilarity = tokenSimilarityFromTokens(queryTokens, row._activityTokens);
        const productSimilarity = tokenSimilarityFromTokens(queryTokens, row._productTokens);
        const contextSimilarity = tokenSimilarityFromTokens(queryTokens, row._contextTokens);
        const similarity = Math.max(activitySimilarity, productSimilarity * 0.92, contextSimilarity * 0.78) / 100;
        const score = direct * 2 + similarity;
        return { row, score };
      })
      .filter(item => item.score > 0.12)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30);
  }

  function renderDatasetSearch(query) {
    const matches = searchDatasets(query);

    if (!cleanText(query)) {
      els.datasetSearchResults.innerHTML = "";
      return;
    }

    if (!matches.length) {
      els.datasetSearchResults.innerHTML = '<div class="selected-dataset empty">No matching datasets found.</div>';
      return;
    }

    els.datasetSearchResults.innerHTML = matches.map(({ row }) => {
      const label = datasetLabel(row);
      return `
        <button type="button" class="search-result" data-row-index="${row._rowIndex}">
          <span class="dataset-title">${escapeHtml(label.main)}</span>
          <span class="dataset-meta">${escapeHtml(label.meta || "No additional metadata")}</span>
        </button>
      `;
    }).join("");
  }

  function updateSelectedDataset() {
    if (!state.selectedDataset) {
      els.selectedDataset.className = "selected-dataset empty";
      els.selectedDataset.textContent = "No dataset selected.";
      return;
    }

    const row = state.selectedDataset;
    const label = datasetLabel(row);
    els.selectedDataset.className = "selected-dataset";
    els.selectedDataset.innerHTML = `
      <strong>${escapeHtml(label.main)}</strong>
      <span class="dataset-meta">${escapeHtml(label.meta || "No additional metadata")}</span>
    `;
  }

  function normalizeGeo(value) {
    const raw = cleanText(value);
    if (!raw) return "";
    const canonical = canonicalizeText(raw);
    if (GEO_ALIASES[canonical]) return GEO_ALIASES[canonical];

    const upper = raw.toUpperCase().replace(/\s+/g, " ").trim();
    if (upper === "ROW") return "ROW";
    if (upper.includes("RER") && upper.includes("CH")) return "RERWCH";
    if (upper === "EUROPE") return "RER";
    return upper;
  }

  function geographyScore(userGeo, datasetGeo) {
    if (!cleanText(userGeo)) return 70;
    if (!cleanText(datasetGeo)) return 40;

    const user = normalizeGeo(userGeo);
    const data = normalizeGeo(datasetGeo);

    if (user === data) return 100;

    if (EU_CODES.has(user)) {
      if (data === "RER" || data === "EUROPE") return 82;
      if (data === "RERWCH") return 80;
      if (data === "GLO") return 50;
      if (data === "ROW") return 45;
      if (EU_CODES.has(data)) return 35;
    }

    if (user === "RER" || user === "RERWCH") {
      if (data === "RER" || data === "RERWCH") return 95;
      if (EU_CODES.has(data)) return 72;
      if (data === "GLO") return 55;
      if (data === "ROW") return 48;
    }

    if (data === "GLO") return 55;
    if (data === "ROW") return 58;
    return 30;
  }

  function normalizeUnit(value) {
    const unit = canonicalizeText(value).replaceAll(" ", "");
    const aliases = {
      kilogram: "kg", kilograms: "kg", kilo: "kg", kg: "kg",
      tonne: "t", ton: "t", tonnes: "t", tons: "t", t: "t",
      kilowatthour: "kwh", kwh: "kwh",
      megajoule: "mj", mj: "mj",
      cubicmetre: "m3", cubicmeter: "m3", m3: "m3",
      squaremetre: "m2", squaremeter: "m2", m2: "m2",
      tonkilometer: "tkm", tonnekilometre: "tkm", tkm: "tkm",
      unit: "unit", piece: "unit", item: "unit"
    };
    return aliases[unit] || unit;
  }

  function unitScore(userUnit, datasetUnit) {
    if (!cleanText(userUnit)) return 70;
    if (!cleanText(datasetUnit)) return 35;
    return normalizeUnit(userUnit) === normalizeUnit(datasetUnit) ? 100 : 20;
  }

  function datasetRole(row) {
    const type = canonicalizeText(row.specialType || row.type);
    if (type.includes("market group")) return "market_group";
    if (type.includes("market activity")) return "market";
    if (type.includes("production mix")) return "production_mix";
    return "transforming";
  }

  function datasetFamily(row) {
    const text = canonicalizeText(`${row.activity} ${row.sector} ${row.isicSection}`);
    if (text.includes("waste") || text.includes("treatment") || text.includes("disposal") || text.includes("recycling")) return "waste";
    if (text.includes("transport") || text.includes("freight") || text.includes("transportation")) return "transport";
    if (text.includes("electricity") || text.includes("heat") || text.includes("power generation")) return "energy";
    return "general";
  }

  function sectorArchetypeScore(archetype, row) {
    const text = canonicalizeText(`${row.sector} ${row.isic} ${row.isicSection}`);
    const includesAny = (...terms) => terms.some(term => text.includes(term));

    if (archetype === "energy") return includesAny("electricity", "heat", "fuel", "gas steam") ? 100 : 35;
    if (archetype === "transport") return includesAny("transport", "transportation storage") ? 100 : 30;
    if (archetype === "waste") return includesAny("waste treatment recycling", "waste management", "remediation") ? 100 : 25;
    if (archetype === "chemical") return includesAny("chemical", "manufacture of chemicals") ? 100 : 35;
    if (archetype === "agriculture") return includesAny("agriculture", "animal husbandry", "forestry fishing", "land use") ? 100 : 30;
    if (archetype === "construction") return includesAny("construction", "cement concrete", "infrastructure machinery") ? 100 : 40;
    if (archetype === "material") {
      return includesAny("metals", "wood", "pulp paper", "cement concrete", "resource extraction", "mining quarrying", "chemical") ? 95 : 55;
    }
    if (archetype === "service") {
      return includesAny("service", "information communication", "professional scientific", "administrative support", "accommodation", "wholesale retail") ? 100 : 55;
    }
    if (archetype === "manufacturing") {
      return includesAny("manufacturing", "metals", "electronics", "infrastructure machinery", "wood", "pulp paper", "batteries", "textile", "plastic") ? 95 : 50;
    }
    return 60;
  }

  function expectedDatasetRole(input) {
    if (input.purpose && input.purpose !== "auto") {
      if (["waste", "transport", "energy"].includes(input.purpose)) return null;
      return input.purpose;
    }

    const text = canonicalizeText(input.description);
    if (text.includes("market for") || text.includes("market mix") || text.includes("supply mix") || text.includes("fornitura") || text.includes("acquisto")) return "market";
    if (text.includes("production mix") || text.includes("mix di produzione")) return "production_mix";
    return null;
  }

  function roleScore(input, row) {
    const expected = expectedDatasetRole(input);
    const actual = datasetRole(row);
    const family = datasetFamily(row);

    if (input.purpose === "waste") return family === "waste" ? 100 : 20;
    if (input.purpose === "transport") return family === "transport" ? 100 : 20;
    if (input.purpose === "energy") return family === "energy" ? 100 : 20;
    if (!expected) return 70;
    if (expected === actual) return 100;
    if (expected === "market" && actual === "market_group") return 90;
    if (expected === "market" && actual === "production_mix") return 72;
    if (expected === "production_mix" && actual === "market") return 65;
    if (expected === "transforming" && actual === "production_mix") return 55;
    if (expected === "transforming" && actual === "market") return 35;
    return 40;
  }

  function scoreDataset(row, input) {
    const weights = WEIGHTS[input.archetype] || WEIGHTS.manufacturing;
    const qTokens = input._tokens || tokens(input.description);
    const semanticContext = tokenSimilarityFromTokens(qTokens, row._contextTokens);
    const components = {
      process: tokenSimilarityFromTokens(qTokens, row._activityTokens),
      product: tokenSimilarityFromTokens(qTokens, row._productTokens),
      context: Math.max(semanticContext, sectorArchetypeScore(input.archetype, row)),
      geography: geographyScore(input.geography, row.geography),
      unit: unitScore(input.unit, row.unit),
      role: roleScore(input, row)
    };

    let weighted = 0;
    Object.entries(weights).forEach(([key, weight]) => {
      weighted += (components[key] / 100) * weight;
    });

    return {
      score: Math.round(weighted),
      components,
      weights,
      row
    };
  }

  function assessmentInput() {
    const description = cleanText(els.processDescription.value);
    return {
      description,
      _tokens: tokens(description),
      archetype: els.archetype.value,
      purpose: els.datasetPurpose.value,
      geography: cleanText(els.processGeography.value),
      unit: cleanText(els.processUnit.value)
    };
  }

  function confidenceScore(input) {
    let score = 10;
    const wordCount = input._tokens.length;

    score += Math.min(25, wordCount * 3);
    if (input.geography) score += 10;
    if (input.unit) score += 7;
    if (input.purpose && input.purpose !== "auto") score += 8;

    if (state.mapping.activity >= 0) score += 12;
    if (state.mapping.geography >= 0) score += 4;
    if (state.mapping.specialType >= 0) score += 7;
    if (state.mapping.sector >= 0) score += 6;
    if (state.mapping.isic >= 0) score += 3;
    if (state.mapping.cpc >= 0) score += 4;
    if (state.mapping.productInfo >= 0) score += 9;
    if (state.mapping.unit >= 0) score += 3;

    return Math.min(100, Math.round(score));
  }

  function confidenceLabel(score) {
    if (score >= 80) return "High";
    if (score >= 60) return "Medium";
    return "Low";
  }

  function fitVerdict(score) {
    if (score >= 85) return { text: "Strong fit", kind: "good" };
    if (score >= 70) return { text: "Good fit", kind: "good" };
    if (score >= 55) return { text: "Acceptable proxy", kind: "warning" };
    if (score >= 40) return { text: "Weak proxy", kind: "warning" };
    return { text: "Poor fit", kind: "danger" };
  }

  function componentLabel(key) {
    return {
      process: "Process / technology",
      product: "Product / material",
      context: "Sector / classification",
      geography: "Geography",
      unit: "Reference unit",
      role: "Dataset role / purpose"
    }[key] || key;
  }

  function renderBreakdown(assessment) {
    els.breakdown.innerHTML = Object.entries(assessment.components).map(([key, score]) => {
      const weight = assessment.weights[key] || 0;
      return `
        <div class="breakdown-row">
          <span>${escapeHtml(componentLabel(key))} <small>(${weight}%)</small></span>
          <span class="breakdown-track"><span style="width:${score}%"></span></span>
          <span class="breakdown-score">${score}</span>
        </div>
      `;
    }).join("");
  }

  function buildNotes(assessment, input) {
    const notes = [];
    const c = assessment.components;
    const row = assessment.row;

    if (c.process >= 80) notes.push("Strong match between the real-process description and the Ecoinvent activity name.");
    else if (c.process < 55) notes.push("Process/technology alignment is weak: verify that the activity name represents the physical operation being modelled.");

    if (c.product < 55) {
      notes.push("Product/material alignment is weak based on Product Information and CPC/HS classification.");
    }

    if (c.context < 55) {
      notes.push(`Sector/classification alignment is weak for the selected ${input.archetype} archetype.`);
    }

    if (input.geography && c.geography < 70) {
      notes.push(`Geographical representativeness is limited: requested ${input.geography}, dataset ${row.geography || "not stated"}.`);
    }

    if (input.unit && c.unit < 70) {
      notes.push(`Reference unit mismatch: requested ${input.unit}, dataset ${row.unit || "not stated"}.`);
    }

    if (c.role < 60) {
      notes.push(`Dataset-purpose warning: dataset type is "${row.specialType || row.type || "not stated"}" and may not match the intended modelling role.`);
    }

    if (!row.productInfo) notes.push("No Product Information text is available for this dataset; product/material scoring relies on classifications and activity name.");
    if (!row.geography) notes.push("No geography value is available for this dataset.");

    notes.push("Temporal representativeness is not scored because this Ecoinvent catalogue export contains no temporal field.");

    return notes;
  }

  function renderNotes(notes) {
    els.assessmentNotes.innerHTML = notes.map(note => `<li>${escapeHtml(note)}</li>`).join("");
  }

  function rankCandidates(input) {
    return state.rows
      .map(row => scoreDataset(row, input))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  function selectedKey(row) {
    return row.id || `${row._rowIndex}|${row.activity}|${row.product}`;
  }

  function renderCandidates(candidates) {
    const selectedId = selectedKey(state.selectedDataset);
    els.candidateCount.textContent = `Top ${candidates.length} of ${state.rows.length.toLocaleString()}`;

    els.candidateResults.innerHTML = candidates.map(candidate => {
      const row = candidate.row;
      const label = datasetLabel(row);
      const isSelected = selectedKey(row) === selectedId;
      return `
        <div class="candidate">
          <div class="candidate-score">${candidate.score}</div>
          <div>
            <div class="dataset-title">${escapeHtml(label.main)}</div>
            <div class="dataset-meta">${escapeHtml(label.meta || "No additional metadata")}</div>
          </div>
          <div>${isSelected ? '<span class="selected-flag">SELECTED</span>' : ""}</div>
        </div>
      `;
    }).join("");
  }

  function renderRobustness(selectedAssessment, candidates) {
    const best = candidates[0];
    if (!best) {
      els.robustnessScore.textContent = "—";
      els.robustnessLabel.textContent = "No comparison available";
      return;
    }

    const gap = Math.max(0, best.score - selectedAssessment.score);
    els.robustnessScore.textContent = gap === 0 ? "0 pts" : `-${gap} pts`;

    if (gap <= 3) els.robustnessLabel.textContent = "Close to best available candidate";
    else if (gap <= 10) els.robustnessLabel.textContent = "A moderately stronger candidate exists";
    else els.robustnessLabel.textContent = "A materially stronger candidate exists";
  }

  function evaluate() {
    const input = assessmentInput();
    if (!input.description || !state.selectedDataset || !state.rows.length) return;

    els.evaluateBtn.disabled = true;
    els.evaluateBtn.textContent = "Evaluating…";

    window.setTimeout(() => {
      const assessment = scoreDataset(state.selectedDataset, input);
      const confidence = confidenceScore(input);
      const candidates = rankCandidates(input);
      const notes = buildNotes(assessment, input);
      const verdict = fitVerdict(assessment.score);

      state.lastAssessment = { input, assessment, confidence, candidates, notes };

      els.fitScore.textContent = assessment.score;
      els.fitMeter.style.width = `${assessment.score}%`;
      els.confidenceScore.textContent = `${confidence}%`;
      els.confidenceLabel.textContent = confidenceLabel(confidence);
      els.confidenceMeter.style.width = `${confidence}%`;
      els.fitVerdict.textContent = verdict.text;
      els.fitVerdict.className = `status ${verdict.kind}`;

      renderBreakdown(assessment);
      renderNotes(notes);
      renderCandidates(candidates);
      renderRobustness(assessment, candidates);

      els.resultsPanel.classList.remove("hidden");
      els.resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });

      els.evaluateBtn.textContent = "Re-evaluate dataset fit";
      updateEvaluateState();
    }, 20);
  }

  function updateEvaluateState() {
    const ready = Boolean(
      state.rows.length &&
      state.selectedDataset &&
      cleanText(els.processDescription.value)
    );
    els.evaluateBtn.disabled = !ready;
  }

  function selectDataset(rowIndex) {
    state.selectedDataset = state.rows.find(row => row._rowIndex === Number(rowIndex)) || null;
    updateSelectedDataset();
    els.datasetSearchResults.innerHTML = "";
    if (state.selectedDataset) els.datasetSearch.value = state.selectedDataset.activity || state.selectedDataset.product;
    updateEvaluateState();
  }

  function resetAnalysis() {
    els.processDescription.value = "";
    els.processGeography.value = "";
    els.processUnit.value = "";
    els.datasetPurpose.value = "auto";
    els.archetype.value = "manufacturing";
    els.datasetSearch.value = "";
    els.datasetSearchResults.innerHTML = "";
    state.selectedDataset = null;
    state.lastAssessment = null;
    updateSelectedDataset();
    updateEvaluateState();
    els.resultsPanel.classList.add("hidden");
  }

  function requestReview() {
    if (!state.lastAssessment) return;

    const email = cleanText(els.reviewEmail.value);
    if (!email) {
      alert("Set the expert review email in Local settings first.");
      const details = els.reviewEmail.closest("details");
      if (details) details.open = true;
      els.reviewEmail.focus();
      return;
    }

    const { input, assessment, candidates, notes } = state.lastAssessment;
    const selected = assessment.row;
    const alternatives = candidates
      .filter(item => selectedKey(item.row) !== selectedKey(selected))
      .slice(0, 3)
      .map((item, index) => `${index + 1}. ${item.row.activity || item.row.product} — ${item.score}/100`)
      .join("\n");

    const subject = `Dataset review request — ${selected.activity || selected.product || "LCA dataset"}`;
    const body = [
      "LCA Dataset Fit Checker — expert review request",
      "",
      `Process description: ${input.description}`,
      `Process archetype: ${input.archetype}`,
      `Requested geography: ${input.geography || "not specified"}`,
      `Requested unit: ${input.unit || "not specified"}`,
      `Dataset purpose: ${input.purpose || "auto"}`,
      "",
      `Selected dataset: ${selected.activity || "not stated"}`,
      `Product information: ${selected.productInfo ? selected.productInfo.slice(0, 500) : (selected.product || "not stated")}`,
      `Dataset geography: ${selected.geography || "not stated"}`,
      `Special activity type: ${selected.specialType || "not stated"}`,
      `Sector: ${selected.sector || "not stated"}`,
      `CPC classification: ${selected.cpc || "not stated"}`,
      `Dataset unit: ${selected.unit || "not stated"}`,
      `Dataset ID: ${selected.id || "not available"}`,
      "",
      `Fit score: ${assessment.score}/100`,
      `Confidence: ${state.lastAssessment.confidence}% (${confidenceLabel(state.lastAssessment.confidence)})`,
      "",
      "Assessment notes:",
      ...notes.map(note => `- ${note}`),
      "",
      "Strongest alternative candidates:",
      alternatives || "- No alternative candidate available",
      "",
      "Reviewer comment:",
      "[Please add the reason for escalation here]",
      "",
      `Tool version: ${APP_VERSION}`
    ].join("\n");

    window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  let searchTimer;
  els.datasetSearch.addEventListener("input", event => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => renderDatasetSearch(event.target.value), 120);
  });

  els.datasetSearchResults.addEventListener("click", event => {
    const button = event.target.closest("[data-row-index]");
    if (button) selectDataset(button.dataset.rowIndex);
  });

  els.databaseFile.addEventListener("change", event => {
    const [file] = event.target.files || [];
    if (file) loadWorkbook(file);
  });

  els.sheetSelect.addEventListener("change", event => parseSheet(event.target.value));
  els.processDescription.addEventListener("input", updateEvaluateState);
  els.evaluateBtn.addEventListener("click", evaluate);
  els.resetBtn.addEventListener("click", resetAnalysis);
  els.reviewBtn.addEventListener("click", requestReview);

  els.reviewEmail.value = localStorage.getItem("lca-fit-review-email") || "";
  els.reviewEmail.addEventListener("change", () => {
    localStorage.setItem("lca-fit-review-email", cleanText(els.reviewEmail.value));
  });

  els.appVersion.textContent = APP_VERSION;
  updateEvaluateState();
})();
