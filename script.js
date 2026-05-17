const ADMIN_PHONE = "628992400880";
const WHATSAPP_BASE_URL = `https://wa.me/${ADMIN_PHONE}`;
const CONTACT_API_URL = "https://web-backend.farisi55.workers.dev/classmate/v1/kontak/submit";
const AI_RESPONSE_TIMEOUT_MS = 45000;

const contactForm = document.querySelector("#contact-form");
const contactSubmit = document.querySelector("#contact-submit");
const contactResult = document.querySelector("#contact-result");
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
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearContactState();

    const formData = new FormData(contactForm);
    const payload = {
      nama: formData.get("nama")?.toString().trim() || "",
      kota: formData.get("kota")?.toString().trim() || "",
      kontak: formData.get("kontak")?.toString().trim() || "",
      pesan: formData.get("pesan")?.toString().trim() || ""
    };

    setContactLoading(true);

    try {
      const response = await fetch(CONTACT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({
        success: false,
        message: "Respons server tidak valid"
      }));

      if (!response.ok || !result.success) {
        showContactErrors(result);
        return;
      }

      showContactSuccess(payload);
      contactForm.reset();
    } catch (error) {
      showContactErrors({
        message: "Maaf Kak, data belum bisa dikirim. Kakak masih bisa lanjut chat admin via WhatsApp.",
        errors: {}
      }, payload);
    } finally {
      setContactLoading(false);
    }
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

function buildWhatsAppMessage(payload) {
  return [
    "Halo Admin Classmate, saya sudah isi form website dan mau lanjut tanya.",
    "",
    `Nama: ${payload.nama || "-"}`,
    `Kota: ${payload.kota || "-"}`,
    `Email/WhatsApp: ${payload.kontak || "-"}`,
    `Pesan: ${payload.pesan || "-"}`
  ].join("\n");
}

function setContactLoading(isLoading) {
  if (!contactSubmit) return;

  contactSubmit.disabled = isLoading;
  contactSubmit.textContent = isLoading ? "Mengirim..." : "Kirim ke Admin";
}

function clearContactState() {
  if (contactResult) {
    contactResult.hidden = true;
    contactResult.className = "contact-result";
    contactResult.textContent = "";
  }

  contactForm?.querySelectorAll(".field-error").forEach((element) => element.remove());
  contactForm?.querySelectorAll("[aria-invalid='true']").forEach((field) => {
    field.removeAttribute("aria-invalid");
    field.removeAttribute("aria-describedby");
  });
  contactForm?.querySelectorAll(".form-field.has-error").forEach((field) => {
    field.classList.remove("has-error");
  });
}

function showContactSuccess(payload) {
  if (!contactResult) return;

  contactResult.hidden = false;
  contactResult.className = "contact-result success";
  contactResult.textContent = "";

  const message = document.createElement("p");
  message.textContent = "Data berhasil dikirim. Kakak juga bisa lanjut chat admin via WhatsApp.";

  const whatsappButton = document.createElement("button");
  whatsappButton.className = "whatsapp-followup";
  whatsappButton.type = "button";
  whatsappButton.textContent = "Lanjut Chat WhatsApp";
  whatsappButton.addEventListener("click", () => {
    openWhatsApp(buildWhatsAppMessage(payload));
  });

  contactResult.append(message, whatsappButton);
}

function showContactErrors(result, fallbackPayload = null) {
  if (!contactResult) return;

  const errors = result?.errors || {};

  contactResult.hidden = false;
  contactResult.className = "contact-result error";
  contactResult.textContent = "";

  const message = document.createElement("p");
  message.textContent = result?.message || "Data belum bisa dikirim. Cek formnya lagi ya, Kak.";
  contactResult.appendChild(message);

  if (Object.keys(errors).length > 0) {
    const list = document.createElement("ul");

    Object.entries(errors).forEach(([field, errorMessage]) => {
      const item = document.createElement("li");
      item.textContent = errorMessage;
      list.appendChild(item);
      showFieldError(field, errorMessage);
    });

    contactResult.appendChild(list);
  }

  if (fallbackPayload) {
    const whatsappButton = document.createElement("button");
    whatsappButton.className = "whatsapp-followup";
    whatsappButton.type = "button";
    whatsappButton.textContent = "Chat Admin via WhatsApp";
    whatsappButton.addEventListener("click", () => {
      openWhatsApp(buildWhatsAppMessage(fallbackPayload));
    });
    contactResult.appendChild(whatsappButton);
  }
}

function showFieldError(field, message) {
  const fieldMap = {
    nama: "#contact-name",
    kota: "#contact-city",
    kontak: "#contact-contact",
    pesan: "#contact-message"
  };

  const input = document.querySelector(fieldMap[field]);
  const wrapper = input?.closest(".form-field");

  if (!input || !wrapper) return;

  wrapper.classList.add("has-error");
  input.setAttribute("aria-invalid", "true");

  const error = document.createElement("span");
  const errorId = `${input.id}-error`;
  error.className = "field-error";
  error.id = errorId;
  error.textContent = message;
  input.setAttribute("aria-describedby", errorId);
  wrapper.appendChild(error);
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
