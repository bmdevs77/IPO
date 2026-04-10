const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");
const reveals = document.querySelectorAll(".reveal");
const cursorGlow = document.querySelector(".cursor-glow");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatWindow = document.getElementById("chatWindow");

const whatsappTargets = {
  bilal: {
    person: "أستاذ بلال الشيخ",
    phone: "201222221008",
  },
  mohamed: {
    person: "أستاذ محمد أبو سالم",
    phone: "201006975169",
  },
};

const chatState = {
  step: 0,
  data: {
    name: "",
    phone: "",
    service: "",
  },
};

if (menuBtn && navMenu) {
  menuBtn.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });

  document.querySelectorAll(".nav-menu a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active");
    });
  });
}

if (reveals.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    },
    { threshold: 0.15 }
  );

  reveals.forEach((item) => observer.observe(item));
}

document.addEventListener("mousemove", (e) => {
  if (!cursorGlow) return;
  cursorGlow.style.left = `${e.clientX}px`;
  cursorGlow.style.top = `${e.clientY}px`;
});

window.addEventListener("scroll", () => {
  const header = document.querySelector(".header");
  if (!header) return;

  header.style.borderBottom =
    window.scrollY > 30
      ? "1px solid rgba(182, 155, 106, 0.35)"
      : "1px solid rgba(182, 155, 106, 0.22)";
});

function appendMessage(text, sender = "bot") {
  const wrapper = document.createElement("div");
  wrapper.className = `chat-message ${sender}`;

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.textContent = text;

  wrapper.appendChild(bubble);
  chatWindow.appendChild(wrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showServiceButtons() {
  const services = [
    "دراسة جدوى",
    "محاسبة",
    "ضرائب",
    "مراجعة",
    "تأسيس شركات",
    "تعديلات",
    "جمعيات",
  ];

  const container = document.createElement("div");
  container.className = "chat-options";

  services.forEach((service) => {
    const btn = document.createElement("button");
    btn.textContent = service;

    btn.onclick = () => {
      appendMessage(service, "user");

      chatState.data.service = service;
      chatState.step = 3;

      const transfer = getTransferData(service);
      sendToWhatsApp(chatState.data, transfer);

      setTimeout(() => {
        appendMessage(getTransferMessage(service, transfer.person), "bot");
        showRepeatOptions();
      }, 400);
    };

    container.appendChild(btn);
  });

  chatWindow.appendChild(container);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function normalizeText(text) {
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .trim()
    .toLowerCase();
}

function isValidPhone(text) {
  const cleaned = text.replace(/[^\d+]/g, "");
  return cleaned.length >= 10;
}

function getTransferData(service) {
  const normalized = normalizeText(service);

  if (
    normalized.includes("مراجعه") ||
    normalized.includes("مراجعة") ||
    normalized.includes("دراسه جدوى") ||
    normalized.includes("دراسة جدوى")
  ) {
    return whatsappTargets.bilal;
  }

  if (
    normalized.includes("ضرائب") ||
    normalized.includes("ضرايب") ||
    normalized.includes("ضريبة") ||
    normalized.includes("تأسيس شركات")||normalized.includes("تاسيس شركات") 
  ) {
    return whatsappTargets.mohamed;
  }

  
}

function sendToWhatsApp(data, transfer) {
  const message = `مرحبًا ${transfer.person}
لدينا طلب حجز جديد من موقع IPO.

الاسم: ${data.name}
رقم التليفون / واتساب: ${data.phone}
الخدمة المطلوبة: ${data.service}

يرجى متابعة العميل في أقرب وقت.`;

  const url = `https://wa.me/${transfer.phone}?text=${encodeURIComponent(
    message
  )}`;

  window.open(url, "_blank");
}

function getTransferMessage(service, assignedPerson) {
  return `شكرًا لك. تم تسجيل طلبك وسيتم تحويلك إلى ${assignedPerson} لمتابعة طلبك. تم فتح واتساب برسالة جاهزة الآن.`;
}

function askForService() {
  setTimeout(() => {
    appendMessage("من فضلك اختر نوع الخدمة:", "bot");
    showServiceButtons();
  }, 400);
}

function showRepeatOptions() {
  setTimeout(() => {
    appendMessage(
      "لو عايز خدمة تانية بنفس الاسم اختار من الأزرار. ولو عايز تبدأ باسم جديد اكتب: بدء من جديد",
      "bot"
    );
    showServiceButtons();
  }, 700);
}

function resetConversation() {
  chatState.step = 0;
  chatState.data = {
    name: "",
    phone: "",
    service: "",
  };
}

if (chatForm && chatInput) {
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const value = chatInput.value.trim();
    if (!value) return;

    appendMessage(value, "user");
    chatInput.value = "";

    if (chatState.step === 0) {
      chatState.data.name = value;
      chatState.step = 1;

      setTimeout(() => {
        appendMessage(
          `شكرًا يا ${value}. من فضلك اكتب رقم التليفون (واتساب).`,
          "bot"
        );
      }, 400);
      return;
    }

    if (chatState.step === 1) {
      if (!isValidPhone(value)) {
        setTimeout(() => {
          appendMessage("من فضلك اكتب رقم تليفون صحيح.", "bot");
        }, 400);
        return;
      }

      chatState.data.phone = value;
      chatState.step = 2;
      askForService();
      return;
    }

    if (chatState.step === 3) {
      if (normalizeText(value) === normalizeText("بدء من جديد")) {
        resetConversation();

        setTimeout(() => {
          appendMessage(
            "أهلاً بك مع المساعد الذكي لـ IPO. من فضلك اكتب اسمك الكامل.",
            "bot"
          );
        }, 400);
      }
    }
  });
}
