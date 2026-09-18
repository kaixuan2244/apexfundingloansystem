const storageKey = "apexFundingClients";
const cloudConfigKey = "apexFundingSupabaseConfig";
const cloudTableName = "clients";
const defaultCloudBucket = "customer-files";

const defaultClients = [
  {
    id: "c-001",
    name: "Daniel Lim",
    role: "SME Owner",
    location: "Kuala Lumpur",
    status: "approved",
    ic: "DEMO-ID-001",
    phone: "+60 00-000 0001",
    email: "demo.client1@apexfunding.example",
    address: "Demo Business District, Kuala Lumpur",
    loanAmount: 180000,
    term: 36,
    monthlyPayment: 5780,
    interest: "8.8% p.a.",
    paid: 18,
    balance: 98260,
    nextDue: "03 Sep 2026",
    risk: "Low",
    documents: [
      ["NRIC / Passport", "verified"],
      ["Bank Statement", "verified"],
      ["Business Registration", "verified"],
      ["Income Proof", "pending"],
    ],
  },
  {
    id: "c-002",
    name: "Aisha Rahman",
    role: "Restaurant Director",
    location: "Petaling Jaya",
    status: "approved",
    ic: "DEMO-ID-002",
    phone: "+60 00-000 0002",
    email: "demo.client2@apexfunding.example",
    address: "Demo Commercial Area, Petaling Jaya",
    loanAmount: 95000,
    term: 24,
    monthlyPayment: 4385,
    interest: "9.2% p.a.",
    paid: 7,
    balance: 69120,
    nextDue: "08 Sep 2026",
    risk: "Low",
    documents: [
      ["NRIC / Passport", "verified"],
      ["Bank Statement", "verified"],
      ["Business Registration", "pending"],
      ["Income Proof", "verified"],
    ],
  },
  {
    id: "c-003",
    name: "Jason Wong",
    role: "Property Agent",
    location: "Johor Bahru",
    status: "pending",
    ic: "DEMO-ID-003",
    phone: "+60 00-000 0003",
    email: "demo.client3@apexfunding.example",
    address: "Demo Client Address, Johor Bahru",
    loanAmount: 260000,
    term: 48,
    monthlyPayment: 6650,
    interest: "10.4% p.a.",
    paid: 0,
    balance: 260000,
    nextDue: "Pending approval",
    risk: "Medium",
    documents: [
      ["NRIC / Passport", "verified"],
      ["Bank Statement", "pending"],
      ["Business Registration", "missing"],
      ["Income Proof", "pending"],
    ],
  },
  {
    id: "c-004",
    name: "Priya Menon",
    role: "Clinic Partner",
    location: "Subang Jaya",
    status: "approved",
    ic: "DEMO-ID-004",
    phone: "+60 00-000 0004",
    email: "demo.client4@apexfunding.example",
    address: "Demo Client Address, Subang Jaya",
    loanAmount: 140000,
    term: 30,
    monthlyPayment: 5280,
    interest: "8.6% p.a.",
    paid: 12,
    balance: 82410,
    nextDue: "11 Sep 2026",
    risk: "Low",
    documents: [
      ["NRIC / Passport", "verified"],
      ["Bank Statement", "verified"],
      ["Business Registration", "verified"],
      ["Income Proof", "verified"],
    ],
  },
];

let clients = loadClients().map(normalizeClient);
const cloud = {
  client: null,
  enabled: false,
  bucket: defaultCloudBucket,
};

const money = new Intl.NumberFormat("en-MY", {
  style: "currency",
  currency: "MYR",
  maximumFractionDigits: 0,
});

const views = ["dashboard", "clients", "loans", "documents"];

const state = {
  activeId: clients[0].id,
  filter: "all",
  query: "",
  view: getViewFromHash(),
  editingId: null,
  isSubmitting: false,
};

const elements = {
  navItems: document.querySelectorAll(".nav-item"),
  toggleForm: document.querySelector("#toggleFormButton"),
  closeForm: document.querySelector("#closeFormButton"),
  formPanel: document.querySelector("#applicationFormPanel"),
  form: document.querySelector("#applicationForm"),
  cancelEdit: document.querySelector("#cancelEditButton"),
  editCustomer: document.querySelector("#editCustomerButton"),
  deleteCustomer: document.querySelector("#deleteCustomerButton"),
  resetDemo: document.querySelector("#resetDemoButton"),
  viewSections: document.querySelectorAll(".view-section"),
  totalApproved: document.querySelector("#totalApproved"),
  activeClients: document.querySelector("#activeClients"),
  dueThisWeek: document.querySelector("#dueThisWeek"),
  loanCount: document.querySelector("#loanCount"),
  loanTable: document.querySelector("#loanTable"),
  documentCount: document.querySelector("#documentCount"),
  documentTable: document.querySelector("#documentTable"),
  search: document.querySelector("#clientSearch"),
  tabs: document.querySelectorAll(".tab"),
  list: document.querySelector("#clientList"),
  count: document.querySelector("#clientCount"),
  profilePanel: document.querySelector("#profilePanel"),
  status: document.querySelector("#clientStatus"),
  name: document.querySelector("#clientName"),
  meta: document.querySelector("#clientMeta"),
  loanAmount: document.querySelector("#loanAmount"),
  loanTerm: document.querySelector("#loanTerm"),
  monthlyPayment: document.querySelector("#monthlyPayment"),
  interestRate: document.querySelector("#interestRate"),
  clientId: document.querySelector("#clientId"),
  phone: document.querySelector("#clientPhone"),
  email: document.querySelector("#clientEmail"),
  address: document.querySelector("#clientAddress"),
  paidLabel: document.querySelector("#paidLabel"),
  progress: document.querySelector("#progressBar"),
  balance: document.querySelector("#balance"),
  nextDue: document.querySelector("#nextDue"),
  risk: document.querySelector("#riskLevel"),
  documents: document.querySelector("#documentList"),
  clientAvatar: document.querySelector("#clientAvatar"),
  clientInitials: document.querySelector("#clientInitials"),
  pendingReasonSection: document.querySelector("#pendingReasonSection"),
  pendingReasonText: document.querySelector("#pendingReasonText"),
  rejectReasonSection: document.querySelector("#rejectReasonSection"),
  rejectReasonText: document.querySelector("#rejectReasonText"),
  mediaPreviewList: document.querySelector("#mediaPreviewList"),
  syncStatus: document.querySelector("#syncStatus"),
  supabaseUrl: document.querySelector("#supabaseUrl"),
  supabaseAnonKey: document.querySelector("#supabaseAnonKey"),
  supabaseBucket: document.querySelector("#supabaseBucket"),
  connectSupabase: document.querySelector("#connectSupabaseButton"),
  disconnectSupabase: document.querySelector("#disconnectSupabaseButton"),
};

function loadClients() {
  const stored = readStoredClients();
  if (!stored) {
    return [...defaultClients];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length ? parsed : [...defaultClients];
  } catch {
    return [...defaultClients];
  }
}

function normalizeClient(client) {
  return {
    pendingReason: "",
    rejectReason: "",
    assets: {},
    ...client,
  };
}

function saveClients() {
  writeStoredClients(JSON.stringify(clients));
}

function readStoredClients() {
  try {
    return window.localStorage?.getItem(storageKey);
  } catch {
    return null;
  }
}

function writeStoredClients(value) {
  try {
    window.localStorage?.setItem(storageKey, value);
  } catch {
    // Some embedded browsers disable localStorage; the in-memory list still works.
  }
}

function clearStoredClients() {
  try {
    window.localStorage?.removeItem(storageKey);
  } catch {
    // Ignore unavailable storage.
  }
}

function readCloudConfig() {
  try {
    const stored = window.localStorage?.getItem(cloudConfigKey);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function writeCloudConfig(config) {
  try {
    window.localStorage?.setItem(cloudConfigKey, JSON.stringify(config));
  } catch {
    // Cloud sync still works for this session if localStorage is unavailable.
  }
}

function clearCloudConfig() {
  try {
    window.localStorage?.removeItem(cloudConfigKey);
  } catch {
    // Ignore unavailable storage.
  }
}

function updateSyncStatus(message, mode = "idle") {
  if (!elements.syncStatus) {
    return;
  }

  elements.syncStatus.textContent = message;
  elements.syncStatus.dataset.mode = mode;
}

async function connectSupabase(loadRemote = true) {
  const config = {
    url: elements.supabaseUrl.value.trim(),
    anonKey: elements.supabaseAnonKey.value.trim(),
    bucket: elements.supabaseBucket.value.trim() || defaultCloudBucket,
  };

  if (!config.url || !config.anonKey) {
    updateSyncStatus("Enter Supabase URL and anon key", "error");
    return;
  }

  if (!window.supabase?.createClient) {
    updateSyncStatus("Supabase SDK not loaded", "error");
    return;
  }

  cloud.client = window.supabase.createClient(config.url, config.anonKey);
  cloud.bucket = config.bucket;
  cloud.enabled = true;
  writeCloudConfig(config);
  updateSyncStatus("Connected. Loading cloud data...", "syncing");

  if (loadRemote) {
    await pullClientsFromCloud();
  }

  updateSyncStatus("Connected to Supabase", "connected");
}

function disconnectSupabase() {
  cloud.client = null;
  cloud.enabled = false;
  clearCloudConfig();
  updateSyncStatus("Local only", "idle");
}

async function pullClientsFromCloud() {
  if (!cloud.enabled) {
    return;
  }

  const { data, error } = await cloud.client
    .from(cloudTableName)
    .select("payload")
    .order("updated_at", { ascending: false });

  if (error) {
    updateSyncStatus(`Cloud load failed: ${error.message}`, "error");
    return;
  }

  const cloudClients = data
    .map((row) => row.payload)
    .filter(Boolean)
    .map(normalizeClient);

  if (cloudClients.length) {
    clients = cloudClients;
    state.activeId = clients[0].id;
    saveClients();
    render();
  }
}

async function saveClientToCloud(client) {
  if (!cloud.enabled) {
    return;
  }

  updateSyncStatus("Syncing customer...", "syncing");
  const { error } = await cloud.client.from(cloudTableName).upsert({
    id: client.id,
    payload: client,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    updateSyncStatus(`Cloud save failed: ${error.message}`, "error");
    return;
  }

  updateSyncStatus("Saved to Supabase", "connected");
}

async function deleteClientFromCloud(client) {
  if (!cloud.enabled) {
    return true;
  }

  updateSyncStatus("Deleting customer...", "syncing");
  const { error } = await cloud.client.from(cloudTableName).delete().eq("id", client.id);

  if (error) {
    updateSyncStatus(`Cloud delete failed: ${error.message}`, "error");
    return false;
  }

  const storagePaths = Object.values(client.assets || {})
    .map((asset) => asset?.storagePath)
    .filter(Boolean);

  if (storagePaths.length) {
    const { error: storageError } = await cloud.client.storage.from(cloud.bucket).remove(storagePaths);
    if (storageError) {
      updateSyncStatus(`Customer deleted, but file cleanup failed: ${storageError.message}`, "error");
      return true;
    }
  }

  updateSyncStatus("Customer deleted from Supabase", "connected");
  return true;
}

function filteredClients() {
  const query = state.query.trim().toLowerCase();
  return clients.filter((client) => {
    const statusMatch = state.filter === "all" || client.status === state.filter;
    const text = [
      client.name,
      client.role,
      client.location,
      client.ic,
      client.email,
      client.phone,
    ]
      .join(" ")
      .toLowerCase();
    return statusMatch && (!query || text.includes(query));
  });
}

function renderClientList() {
  const visibleClients = filteredClients();
  elements.count.textContent = `${visibleClients.length} client${visibleClients.length === 1 ? "" : "s"}`;

  elements.list.innerHTML = visibleClients
    .map((client) => {
      const name = escapeHtml(client.name);
      const role = escapeHtml(client.role);
      const location = escapeHtml(client.location);

      return `
        <button class="client-card ${client.id === state.activeId ? "selected" : ""}" type="button" data-id="${client.id}">
          <div class="client-card-header">
            <div>
              <h3>${name}</h3>
              <p>${role} - ${location}</p>
            </div>
            ${renderStatusPill(client.status)}
          </div>
          <div class="mini-stat">
            <span>${money.format(client.loanAmount)} loan</span>
            <strong>${client.term} months</strong>
          </div>
        </button>
      `;
    })
    .join("") || `<div class="empty-state">No customers found.</div>`;

  elements.list.querySelectorAll(".client-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.activeId = card.dataset.id;
      render();
    });
  });
}

function renderProfile() {
  const active = getActiveClient();
  if (!active) {
    elements.profilePanel.hidden = true;
    return;
  }
  elements.profilePanel.hidden = false;
  state.activeId = active.id;
  const percent = Math.min(100, Math.round((active.paid / active.term) * 100));

  elements.status.outerHTML = renderStatusPill(active.status, "clientStatus");
  elements.status = document.querySelector("#clientStatus");
  elements.name.textContent = active.name;
  elements.meta.textContent = `${active.role} - ${active.location}`;
  elements.loanAmount.textContent = money.format(active.loanAmount);
  elements.loanTerm.textContent = `${active.term} months`;
  elements.monthlyPayment.textContent = money.format(active.monthlyPayment);
  elements.interestRate.textContent = active.interest;
  elements.clientId.textContent = active.ic;
  elements.phone.textContent = active.phone;
  elements.email.textContent = active.email;
  elements.address.textContent = active.address;
  const avatar = active.assets.avatar;
  elements.clientAvatar.hidden = !avatar;
  elements.clientInitials.hidden = Boolean(avatar);
  elements.clientAvatar.src = avatar?.dataUrl || "";
  elements.clientInitials.textContent = getInitials(active.name);
  elements.paidLabel.textContent = `${active.paid} / ${active.term} paid`;
  elements.progress.style.width = `${percent}%`;
  elements.balance.textContent = money.format(active.balance);
  elements.nextDue.textContent = active.nextDue;
  elements.risk.textContent = active.risk;
  elements.pendingReasonSection.hidden = active.status !== "pending";
  elements.pendingReasonText.textContent = active.pendingReason || "No reason provided.";
  elements.rejectReasonSection.hidden = active.status !== "rejected";
  elements.rejectReasonText.textContent = active.rejectReason || "No reason provided.";
  renderMediaPreview(active);

  elements.documents.innerHTML = active.documents
    .map(([name, status]) => {
      const asset = getDocumentAsset(active, name);
      return `
        <div class="document-row">
          <strong>${escapeHtml(name)}</strong>
          <span class="doc-status ${asset ? "verified" : status}">${asset ? "Uploaded" : labelStatus(status)}</span>
          ${asset ? `<a class="file-link" href="${asset.dataUrl}" target="_blank" rel="noopener">Open</a>` : ""}
        </div>
      `;
    })
    .join("");
}

function renderMetrics() {
  const approvedClients = clients.filter((client) => client.status === "approved");
  const totalApproved = approvedClients.reduce((sum, client) => sum + client.loanAmount, 0);
  const dueThisWeek = approvedClients.reduce((sum, client) => sum + client.monthlyPayment, 0);
  const pendingDocs = clients.reduce(
    (sum, client) => sum + client.documents.filter(([, status]) => status !== "verified").length,
    0,
  );

  elements.totalApproved.textContent = money.format(totalApproved);
  elements.activeClients.textContent = `Across ${approvedClients.length} approved clients`;
  elements.dueThisWeek.textContent = money.format(dueThisWeek);
  document.querySelector(".metric-card:nth-child(3) strong").textContent = pendingDocs;
}

function renderViews() {
  elements.navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.view === state.view);
  });

  elements.viewSections.forEach((section) => {
    const visibleViews = section.dataset.section.split(" ");
    section.hidden = !visibleViews.includes(state.view);
  });
}

function renderLoansView() {
  elements.loanCount.textContent = `${clients.length} record${clients.length === 1 ? "" : "s"}`;
  elements.loanTable.innerHTML = `
    <div class="table-row header">
      <span>Customer</span>
      <span>Amount</span>
      <span>Term</span>
      <span>Monthly</span>
      <span>Status</span>
      <span>Risk</span>
    </div>
    ${clients
      .map(
        (client) => `
          <button class="table-row" type="button" data-loan-id="${client.id}">
            <strong>${escapeHtml(client.name)}</strong>
            <span>${money.format(client.loanAmount)}</span>
            <span>${client.term} months</span>
            <span>${money.format(client.monthlyPayment)}</span>
            ${renderStatusPill(client.status)}
            <span>${escapeHtml(client.risk)}</span>
          </button>
        `,
      )
      .join("")}
  `;

  elements.loanTable.querySelectorAll("[data-loan-id]").forEach((row) => {
    row.addEventListener("click", () => {
      state.activeId = row.dataset.loanId;
      state.view = "clients";
      render();
    });
  });
}

function renderDocumentsView() {
  const rows = clients.flatMap((client) => [
    {
      client,
      name: "Customer Avatar",
      status: client.assets.avatar ? "verified" : "pending",
      asset: client.assets.avatar,
    },
    {
      client,
      name: "IC Photo",
      status: client.assets.icPhoto ? "verified" : "pending",
      asset: client.assets.icPhoto,
    },
    {
      client,
      name: "Selfie With IC",
      status: client.assets.selfie ? "verified" : "pending",
      asset: client.assets.selfie,
    },
    ...client.documents.map(([name, status]) => ({
      client,
      name,
      status,
      asset: getDocumentAsset(client, name),
    })),
  ]);

  elements.documentCount.textContent = `${rows.length} item${rows.length === 1 ? "" : "s"}`;
  elements.documentTable.innerHTML = `
    <div class="table-row document-table-row header">
      <span>Customer</span>
      <span>Document</span>
      <span>Status</span>
      <span>Loan Status</span>
    </div>
    ${rows
      .map(
        ({ client, name, status, asset }) => {
          return `
          <button class="table-row document-table-row" type="button" data-doc-client-id="${client.id}">
            <strong>${escapeHtml(client.name)}</strong>
            <span>${escapeHtml(name)}</span>
            <span class="doc-status ${asset ? "verified" : status}">${asset ? "Uploaded" : labelStatus(status)}</span>
            ${renderStatusPill(client.status)}
          </button>
        `;
        },
      )
      .join("")}
  `;

  elements.documentTable.querySelectorAll("[data-doc-client-id]").forEach((row) => {
    row.addEventListener("click", () => {
      state.activeId = row.dataset.docClientId;
      state.view = "clients";
      render();
    });
  });
}

function formatDate(value) {
  if (!value) {
    return "Pending confirmation";
  }

  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getActiveClient() {
  return clients.find((client) => client.id === state.activeId) || filteredClients()[0] || clients[0];
}

function renderMediaPreview(client) {
  const previewAssets = [
    ["Customer Avatar", client.assets.avatar],
    ["IC Photo", client.assets.icPhoto],
    ["Selfie With IC", client.assets.selfie],
  ].filter(([, asset]) => asset);

  if (!previewAssets.length) {
    elements.mediaPreviewList.innerHTML = `<div class="empty-state">No customer photos uploaded yet.</div>`;
    return;
  }

  elements.mediaPreviewList.innerHTML = previewAssets
    .map(([label, asset]) => {
      const isImage = asset.type?.startsWith("image/");
      return `
        <article class="media-card">
          ${
            isImage
              ? `<img src="${asset.dataUrl}" alt="${escapeHtml(label)}" />`
              : `<div class="file-preview">${escapeHtml(asset.name)}</div>`
          }
          <div class="media-card-body">
            <span>${escapeHtml(label)}</span>
            <a href="${asset.dataUrl}" target="_blank" rel="noopener">${escapeHtml(asset.name)}</a>
          </div>
        </article>
      `;
    })
    .join("");
}

function getDocumentAsset(client, documentName) {
  const map = {
    "NRIC / Passport": client.assets.icPhoto,
    "Bank Statement": client.assets.bankStatement,
    "Business Registration": client.assets.businessRegistration,
    "Income Proof": client.assets.incomeProof,
  };
  return map[documentName] || null;
}

function getViewFromHash() {
  const view = window.location.hash.replace("#", "");
  return views.includes(view) ? view : "dashboard";
}

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderStatusPill(status, id = "") {
  const idAttribute = id ? ` id="${id}"` : "";
  const loader = status === "pending" ? `<span class="loading-ring" aria-hidden="true"></span>` : "";
  return `<span${idAttribute} class="status-pill ${status}">${loader}${labelStatus(status)}</span>`;
}

async function createClientFromForm(form, existingClient = null) {
  const data = new FormData(form);
  const term = Number(data.get("term"));
  const paid = Math.min(Number(data.get("paid")), term);
  const id = existingClient?.id || `c-${Date.now()}`;
  const assets = {
    ...(existingClient?.assets || {}),
    avatar: (await fileAssetFromInput(form.elements.avatarFile, id, "avatar")) || existingClient?.assets?.avatar,
    icPhoto: (await fileAssetFromInput(form.elements.icPhotoFile, id, "ic-photo")) || existingClient?.assets?.icPhoto,
    selfie: (await fileAssetFromInput(form.elements.selfieFile, id, "selfie-with-ic")) || existingClient?.assets?.selfie,
    bankStatement:
      (await fileAssetFromInput(form.elements.bankStatementFile, id, "bank-statement")) ||
      existingClient?.assets?.bankStatement,
    businessRegistration:
      (await fileAssetFromInput(form.elements.businessRegistrationFile, id, "business-registration")) ||
      existingClient?.assets?.businessRegistration,
    incomeProof:
      (await fileAssetFromInput(form.elements.incomeProofFile, id, "income-proof")) ||
      existingClient?.assets?.incomeProof,
  };

  return {
    id,
    name: data.get("name").trim(),
    role: data.get("role").trim(),
    location: data.get("location").trim(),
    status: data.get("status"),
    pendingReason: data.get("pendingReason").trim(),
    rejectReason: data.get("rejectReason").trim(),
    ic: data.get("ic").trim(),
    phone: data.get("phone").trim(),
    email: data.get("email").trim() || "Not provided",
    address: data.get("address").trim(),
    loanAmount: Number(data.get("loanAmount")),
    term,
    monthlyPayment: Number(data.get("monthlyPayment")),
    interest: data.get("interest").trim(),
    paid,
    balance: Number(data.get("balance")),
    rawNextDue: data.get("nextDue"),
    nextDue: formatDate(data.get("nextDue")),
    risk: data.get("risk"),
    documents: [
      ["NRIC / Passport", assets.icPhoto ? "verified" : "pending"],
      ["Bank Statement", assets.bankStatement ? "verified" : "pending"],
      ["Business Registration", assets.businessRegistration ? "verified" : "pending"],
      ["Income Proof", assets.incomeProof ? "verified" : "pending"],
    ],
    assets,
  };
}

async function fileAssetFromInput(input, clientId, key) {
  const file = input.files?.[0];
  if (!file) {
    return null;
  }

  if (cloud.enabled) {
    const cloudAsset = await uploadAssetToCloud(file, clientId, key);
    if (cloudAsset) {
      return cloudAsset;
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () =>
      resolve({
        name: file.name,
        type: file.type || "application/octet-stream",
        dataUrl: reader.result,
      }),
    );
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

async function uploadAssetToCloud(file, clientId, key) {
  const safeName = file.name.replace(/[^a-z0-9._-]/gi, "-").toLowerCase();
  const path = `${clientId}/${key}-${Date.now()}-${safeName}`;
  const { error } = await cloud.client.storage.from(cloud.bucket).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || "application/octet-stream",
    upsert: true,
  });

  if (error) {
    updateSyncStatus(`File upload failed: ${error.message}`, "error");
    return null;
  }

  const { data } = cloud.client.storage.from(cloud.bucket).getPublicUrl(path);
  return {
    name: file.name,
    type: file.type || "application/octet-stream",
    dataUrl: data.publicUrl,
    storagePath: path,
  };
}

function labelStatus(status) {
  const labels = {
    approved: "Approved",
    review: "Review",
    pending: "Pending",
    rejected: "Fail / Reject",
    verified: "Verified",
    missing: "Missing",
  };
  return labels[status] || status;
}

function render() {
  renderViews();
  renderMetrics();
  renderClientList();
  renderProfile();
  renderLoansView();
  renderDocumentsView();
}

function openApplicationForm(mode) {
  elements.formPanel.hidden = false;
  elements.formPanel.querySelector("h2").textContent = mode === "edit" ? "Edit Loan Application" : "Add Loan Application";
  elements.formPanel.querySelector(".eyebrow").textContent = mode === "edit" ? "Update Customer" : "New Customer";
  elements.form.querySelector("button[type='submit']").textContent = mode === "edit" ? "Save Changes" : "Save Customer";
  elements.cancelEdit.hidden = mode !== "edit";
  elements.form.querySelector("input[name='name']").focus();
}

function closeApplicationForm() {
  state.editingId = null;
  elements.form.reset();
  elements.cancelEdit.hidden = true;
  elements.formPanel.hidden = true;
  elements.formPanel.querySelector("h2").textContent = "Add Loan Application";
  elements.formPanel.querySelector(".eyebrow").textContent = "New Customer";
  elements.form.querySelector("button[type='submit']").textContent = "Save Customer";
}

function populateForm(client) {
  const fields = elements.form.elements;
  fields.name.value = client.name;
  fields.role.value = client.role;
  fields.location.value = client.location;
  fields.ic.value = client.ic;
  fields.phone.value = client.phone;
  fields.email.value = client.email === "Not provided" ? "" : client.email;
  fields.address.value = client.address;
  fields.loanAmount.value = client.loanAmount;
  fields.term.value = client.term;
  fields.monthlyPayment.value = client.monthlyPayment;
  fields.interest.value = client.interest;
  fields.paid.value = client.paid;
  fields.balance.value = client.balance;
  fields.nextDue.value = client.rawNextDue || "";
  fields.status.value = client.status;
  fields.risk.value = client.risk;
  fields.pendingReason.value = client.pendingReason || "";
  fields.rejectReason.value = client.rejectReason || "";
}

elements.navItems.forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    setPortalView(item.dataset.view);
  });
});

function setPortalView(view, updateHash = true) {
  if (!views.includes(view)) {
    return;
  }

  state.view = view;
  if (updateHash && window.location.hash !== `#${view}`) {
    window.location.hash = view;
  }
  closeApplicationForm();
  render();
}

window.setPortalView = setPortalView;

window.addEventListener("hashchange", () => {
  setPortalView(getViewFromHash(), false);
});


elements.toggleForm.addEventListener("click", () => {
  state.editingId = null;
  elements.form.reset();
  openApplicationForm("add");
});

elements.closeForm.addEventListener("click", () => {
  closeApplicationForm();
});

elements.cancelEdit.addEventListener("click", () => {
  closeApplicationForm();
});

elements.editCustomer.addEventListener("click", () => {
  const active = getActiveClient();
  if (!active) {
    return;
  }

  state.view = "clients";
  state.editingId = active.id;
  populateForm(active);
  openApplicationForm("edit");
  renderViews();
});

elements.deleteCustomer.addEventListener("click", async () => {
  const active = getActiveClient();
  if (!active || !window.confirm(`Delete ${active.name}? This cannot be undone.`)) {
    return;
  }

  elements.deleteCustomer.disabled = true;
  elements.deleteCustomer.textContent = "Deleting...";
  const deletedFromCloud = await deleteClientFromCloud(active);

  if (!deletedFromCloud) {
    elements.deleteCustomer.disabled = false;
    elements.deleteCustomer.textContent = "Delete";
    window.alert("Unable to delete this customer from Supabase. Please try again.");
    return;
  }

  clients = clients.filter((client) => client.id !== active.id);
  state.activeId = clients[0]?.id || null;
  saveClients();
  render();
  elements.deleteCustomer.disabled = false;
  elements.deleteCustomer.textContent = "Delete";
});

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (state.isSubmitting) {
    return;
  }

  state.isSubmitting = true;
  const submitButton = elements.form.querySelector("button[type='submit']");
  const originalLabel = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Saving...";

  try {
    const enteredIc = new FormData(elements.form).get("ic").trim().toLowerCase();
    const duplicateClient = clients.find(
      (client) => client.id !== state.editingId && client.ic.trim().toLowerCase() === enteredIc,
    );
    if (duplicateClient) {
      window.alert(`${duplicateClient.name} already uses this IC / Passport. Open that customer and use Edit instead.`);
      return;
    }

    const existingClient = clients.find((client) => client.id === state.editingId);
    const editedClient = await createClientFromForm(elements.form, existingClient);

    if (state.editingId) {
      clients = clients.map((client) => (client.id === state.editingId ? editedClient : client));
    } else {
      clients = [editedClient, ...clients];
    }

    state.activeId = editedClient.id;
    state.filter = "all";
    state.query = "";
    state.editingId = null;
    elements.search.value = "";
    elements.tabs.forEach((item) => item.classList.toggle("active", item.dataset.filter === "all"));
    saveClients();
    await saveClientToCloud(editedClient);
    closeApplicationForm();
    render();
  } catch (error) {
    console.error("Unable to save customer", error);
    window.alert("Unable to save this customer. Please try again.");
  } finally {
    state.isSubmitting = false;
    submitButton.disabled = false;
    submitButton.textContent = originalLabel;
  }
});

elements.resetDemo.addEventListener("click", () => {
  clients = [...defaultClients];
  state.activeId = clients[0].id;
  state.filter = "all";
  state.query = "";
  elements.search.value = "";
  elements.tabs.forEach((item) => item.classList.toggle("active", item.dataset.filter === "all"));
  clearStoredClients();
  render();
});

elements.connectSupabase.addEventListener("click", async () => {
  await connectSupabase(true);
});

elements.disconnectSupabase.addEventListener("click", () => {
  disconnectSupabase();
});

function restoreCloudSettings() {
  const config = readCloudConfig() || window.APEX_SUPABASE_CONFIG;
  if (!config) {
    return;
  }

  elements.supabaseUrl.value = config.url || "";
  elements.supabaseAnonKey.value = config.anonKey || "";
  elements.supabaseBucket.value = config.bucket || defaultCloudBucket;
  connectSupabase(true);
}

elements.search.addEventListener("input", (event) => {
  state.query = event.target.value;
  const firstVisible = filteredClients()[0];
  if (firstVisible && !filteredClients().some((client) => client.id === state.activeId)) {
    state.activeId = firstVisible.id;
  }
  render();
});

elements.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    state.filter = tab.dataset.filter;
    elements.tabs.forEach((item) => item.classList.toggle("active", item === tab));
    const firstVisible = filteredClients()[0];
    if (firstVisible) {
      state.activeId = firstVisible.id;
    }
    render();
  });
});

render();
restoreCloudSettings();
