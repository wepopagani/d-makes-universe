export type WebsiteLeadKind = "contact" | "quote" | "course" | "b2b" | "order" | "message";

export type WebsiteLeadFile = {
  name: string;
  url: string;
  type?: string;
};

export type WebsiteLeadPayload = {
  kind: WebsiteLeadKind;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  service?: string;
  extra?: string;
  files?: WebsiteLeadFile[];
  botField?: string;
};

const DEFAULT_GESTIONALE = "https://lugano-lab-flow.lovable.app";
const GESTIONALE_PROJECT = "gestionale-a0cb6";
const GESTIONALE_WEB_KEY = "AIzaSyCBUMEwdWXnPKaMdkhtPSMwouMFeyDlsH0";

function clip(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

function leadEndpoint() {
  const base = (import.meta.env.VITE_GESTIONALE_URL as string | undefined)?.replace(/\/$/, "");
  if (base) return `${base}/api/public/website-lead`;
  if (import.meta.env.DEV) return "http://localhost:5174/api/public/website-lead";
  return `${DEFAULT_GESTIONALE}/api/public/website-lead`;
}

function filesJson(files?: WebsiteLeadFile[]) {
  if (!files?.length) return "";
  return JSON.stringify(
    files.slice(0, 80).map((file) => ({
      name: clip(file.name, 200),
      url: clip(file.url, 2000),
      type: clip(file.type, 20),
    })).filter((file) => file.name && file.url),
  );
}

async function writeLeadDirect(payload: WebsiteLeadPayload) {
  const authRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${GESTIONALE_WEB_KEY}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ returnSecureToken: true }),
    },
  );
  const auth = (await authRes.json()) as { idToken?: string };
  if (!authRes.ok || !auth.idToken) throw new Error("gestionale_auth_failed");

  const fields: Record<string, { stringValue: string } | { nullValue: null }> = {};
  const data: Record<string, string | null> = {
    kind: clip(payload.kind, 20),
    status: "new",
    firstName: clip(payload.firstName, 80),
    lastName: clip(payload.lastName, 80),
    email: clip(payload.email, 160),
    phone: clip(payload.phone, 40),
    subject: clip(payload.subject, 160),
    message: clip(payload.message, 4000),
    service: clip(payload.service, 80),
    extra: clip(payload.extra, 8000),
    filesJson: filesJson(payload.files),
    source: "sito_web",
    createdAt: new Date().toISOString(),
    handledAt: null,
    clientId: null,
  };
  for (const [key, value] of Object.entries(data)) {
    fields[key] = value ? { stringValue: value } : { nullValue: null };
  }

  const writeRes = await fetch(
    `https://firestore.googleapis.com/v1/projects/${GESTIONALE_PROJECT}/databases/(default)/documents/website_leads`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${auth.idToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ fields }),
    },
  );
  if (!writeRes.ok) throw new Error("gestionale_write_failed");
}

export async function sendWebsiteLead(payload: WebsiteLeadPayload) {
  if (clip(payload.botField, 80)) return;
  try {
    const response = await fetch(leadEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) return;
  } catch {
    // API gestionale non ancora online: scriviamo diretto su Firestore.
  }
  await writeLeadDirect(payload);
}

export async function notifyGestionale(payload: WebsiteLeadPayload) {
  try {
    await sendWebsiteLead(payload);
  } catch (error) {
    console.error("Gestionale non raggiungibile:", error);
  }
}
