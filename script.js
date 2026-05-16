const ADMIN_PHONE = "628992400880";
const WHATSAPP_BASE_URL = `https://wa.me/${ADMIN_PHONE}`;
const AI_RESPONSE_TIMEOUT_MS = 45000;

const contactForm = document.querySelector("#contactForm");
const currentYear = document.querySelector("#currentYear");
const chatToggle = document.querySelector("#chatToggle");
const chatClose = document.querySelector("#chatClose");
const chatPanel = document.querySelector("#chatPanel");
const chatMessages = document.querySelector("#chatMessages");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");

const systemContext = "You are Classmate virtual assistant. Answer in friendly Indonesian. Classmate is a kids event organizer for children aged 5-8. Free events are usually for new members based on partner or client terms. Paid events are open for new and existing members. Help parents ask about free events, paid events, registration, event types, and partnership. Keep answers short, warm, and helpful. Use Kak. If user wants to register, ask name, city, child's age, and whether they want free or paid event. If user asks for human admin, direct them to WhatsApp admin at 628992400880. Do not make false claims about exact event schedules. If schedule is unknown, say admin will confirm.";
const firstGreeting = "Halo Kak 😊 Aku admin virtual Classmate. Mau tanya event anak, pendaftaran, atau kerja sama partner?";
const fallbackMessage = "Maaf Kak, chat AI sedang tidak tersedia. Kakak bisa langsung hubungi admin via WhatsApp ya.";

const chatHistory = [
  { role: "system", content: systemContext },
  { role: "assistant", content: firstGreeting }
];

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

if (contactForm) {
  // The contact form stays static and hands the conversation to WhatsApp.
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = formData.get("name")?.toString().trim() || "-";
    const city = formData.get("city")?.toString().trim() || "-";
    const contact = formData.get("contact")?.toString().trim() || "-";
    const message = formData.get("message")?.toString().trim() || "-";

    const whatsappMessage = [
      "Halo Admin Classmate, saya mau tanya event atau kerja sama.",
      "",
      `Nama: ${name}`,
      `Kota: ${city}`,
      `Email/WhatsApp: ${contact}`,
      `Pesan: ${message}`
    ].join("\n");

    openWhatsApp(whatsappMessage);
  });
}

if (chatMessages) {
  appendChatMessage(firstGreeting, "bot");
}

if (chatToggle && chatPanel) {
  chatToggle.addEventListener("click", () => {
    const isOpen = !chatPanel.hidden;
    setChatOpen(!isOpen);
  });
}

if (chatClose && chatPanel) {
  chatClose.addEventListener("click", () => {
    setChatOpen(false);
  });
}

if (chatForm && chatInput) {
  // Chat history only lives in browser memory for this tab session.
  chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    appendChatMessage(userMessage, "user");
    chatHistory.push({ role: "user", content: userMessage });
    chatInput.value = "";
    chatInput.disabled = true;

    const loadingMessage = appendChatMessage("Sedang mengetik...", "bot loading");

    try {
      if (!window.puter?.ai?.chat) {
        throw new Error("Puter AI is not available.");
      }

      const response = await withTimeout(
        window.puter.ai.chat(chatHistory),
        AI_RESPONSE_TIMEOUT_MS
      );
      const botReply = extractPuterText(response) || fallbackMessage;

      loadingMessage.textContent = botReply;
      loadingMessage.classList.remove("loading");
      chatHistory.push({ role: "assistant", content: botReply });
    } catch (error) {
      loadingMessage.textContent = fallbackMessage;
      loadingMessage.classList.remove("loading");
      chatHistory.push({ role: "assistant", content: fallbackMessage });
    } finally {
      chatInput.disabled = false;
      chatInput.focus();
      scrollChatToBottom();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && chatPanel && !chatPanel.hidden) {
    setChatOpen(false);
  }
});

function openWhatsApp(message) {
  const encodedMessage = encodeURIComponent(message);
  const whatsappWindow = window.open(`${WHATSAPP_BASE_URL}?text=${encodedMessage}`, "_blank", "noopener,noreferrer");
  if (whatsappWindow) {
    whatsappWindow.opener = null;
  }
}

function setChatOpen(isOpen) {
  if (!chatPanel || !chatToggle) return;

  chatPanel.hidden = !isOpen;
  chatToggle.setAttribute("aria-expanded", String(isOpen));
  chatToggle.setAttribute("aria-label", isOpen ? "Tutup chat Classmate" : "Buka chat Classmate");

  if (isOpen) {
    chatInput?.focus();
    setTimeout(() => chatInput?.focus(), 100);
    scrollChatToBottom();
  }
}

function appendChatMessage(text, type) {
  const messageElement = document.createElement("div");
  messageElement.className = `chat-message ${type}`;
  messageElement.textContent = text;
  chatMessages?.appendChild(messageElement);
  scrollChatToBottom();
  return messageElement;
}

function scrollChatToBottom() {
  if (!chatMessages) return;
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function extractPuterText(response) {
  if (!response) return "";

  if (typeof response === "string") {
    return response;
  }

  const content = response.message?.content ?? response.content ?? response.text;

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => item?.text || item?.content || "")
      .filter(Boolean)
      .join("\n");
  }

  if (content && typeof content.toString === "function") {
    const text = content.toString();
    return text === "[object Object]" ? "" : text;
  }

  if (typeof response.toString === "function") {
    const text = response.toString();
    return text === "[object Object]" ? "" : text;
  }

  return "";
}

function withTimeout(promise, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error("Puter AI request timed out."));
    }, timeoutMs);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => window.clearTimeout(timeoutId));
  });
}
