const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");
const reveals = document.querySelectorAll(".reveal");
const cursorGlow = document.querySelector(".cursor-glow");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatWindow = document.getElementById("chatWindow");

// أرقام واتساب - عدلهم بالأرقام الحقيقية بصيغة دولية بدون +
const whatsappTargets = {
  bilal: {
    person: "أستاذ بلال الشيخ",
    phone: "201222221008",
  },
  mohamed: {
    person: "أستاذ محمد أبو سالم",
    phone: "201070828389",
  },
};

// حالة الشات
const chatState = {
  step: 0,
  data: {
    name: "",
    phone: "",
    service: "",
  },
};

// المينيو في الموبايل
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

// أنيميشن العناصر
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

// حركة الإضاءة
document.addEventListener("mousemove", (e) => {
  if (!cursorGlow) return;
  cursorGlow.style.left = `${e.clientX}px`;
  cursorGlow.style.top = `${e.clientY}px`;
});

// الهيدر
window.addEventListener("scroll", () => {
  const header = document.querySelector(".header");
  if (!header) return;

  header.style.borderBottom =
    window.scrollY > 30
      ? "1px solid rgba(182, 155, 106, 0.35)"
      : "1px solid rgba(182, 155, 106, 0.22)";
});

function appendMessage(text, sender = "bot") {
  if (!chatWindow) return;

  const wrapper = document.createElement("div");
  wrapper.className = `chat-message ${sender}`;

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.textContent = text;

  wrapper.appendChild(bubble);
  chatWindow.appendChild(wrapper);
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

function isValidService(text) {
  const normalized = normalizeText(text);

  return (
    normalized.includes("دراسه جدوى") ||
    normalized.includes("دراسة جدوى") ||
    normalized.includes("محاسبه") ||
    normalized.includes("محاسبة") ||
    normalized.includes("ضرائب") ||
    normalized.includes("ضرايب") ||
    normalized.includes("ضريبة") ||
    normalized.includes("مراجعه") ||
    normalized.includes("مراجعة")
  );
}

function getTransferData(service) {
  const normalized = normalizeText(service);

  if (normalized.includes("مراجعه") || normalized.includes("مراجعة")) {
    return whatsappTargets.bilal;
  }

  if (
    normalized.includes("ضرائب") ||
    normalized.includes("ضرايب") ||
    normalized.includes("ضريبة")
  ) {
    return whatsappTargets.mohamed;
  }

  return Math.random() > 0.5 ? whatsappTargets.bilal : whatsappTargets.mohamed;
}

function sendToWhatsApp(data, transfer) {
  const message = `مرحبًا ${transfer.person}
لدينا طلب حجز جديد من موقع IPO.

الاسم: ${data.name}
رقم التليفون / واتساب: ${data.phone}
الخدمة المطلوبة: ${data.service}

يرجى متابعة العميل في أقرب وقت.`;

  const url = `https://wa.me/${transfer.phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

function getTransferMessage(service, assignedPerson) {
  const normalized = normalizeText(service);

  if (normalized.includes("مراجعه") || normalized.includes("مراجعة")) {
    return "شكرًا لك. تم تسجيل طلبك وسيتم تحويلك إلى أستاذ بلال الشيخ لمتابعة خدمة المراجعة. تم فتح واتساب برسالة جاهزة الآن.";
  }

  if (
    normalized.includes("ضرائب") ||
    normalized.includes("ضرايب") ||
    normalized.includes("ضريبة")
  ) {
    return "شكرًا لك. تم تسجيل طلبك وسيتم تحويلك إلى أستاذ محمد أبو سالم لمتابعة خدمات الضرائب. تم فتح واتساب برسالة جاهزة الآن.";
  }

  return `شكرًا لك. تم تسجيل طلبك وسيتم تحويلك إلى ${assignedPerson} لمتابعة طلبك. تم فتح واتساب برسالة جاهزة الآن.`;
}

function showRepeatOptions() {
  setTimeout(() => {
    appendMessage(
      "إذا أردت إدخال عملية أخرى بنفس الاسم، يرجى اختيار الخدمة مباشرة: دراسة جدوى / محاسبة / ضرائب / مراجعة. ولو عايز تبدأ باسم جديد اكتب: بدء من جديد",
      "bot"
    );
  }, 700);
}

function askForService() {
  setTimeout(() => {
    appendMessage(
      "تمام. من فضلك اختر نوع الخدمة: دراسة جدوى / محاسبة / ضرائب / مراجعة",
      "bot"
    );
  }, 400);
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
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const value = chatInput.value.trim();
    if (!value) return;

    appendMessage(value, "user");
    chatInput.value = "";

    // الخطوة 1: الاسم
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

    // الخطوة 2: رقم التليفون
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

    // الخطوة 3: أول خدمة
    if (chatState.step === 2) {
      if (!isValidService(value)) {
        setTimeout(() => {
          appendMessage(
            "من فضلك اختر خدمة صحيحة من التخصصات المتاحة فقط: دراسة جدوى / محاسبة / ضرائب / مراجعة",
            "bot"
          );
        }, 400);
        return;
      }

      chatState.data.service = value;
      chatState.step = 3;

      const transfer = getTransferData(value);
      sendToWhatsApp(chatState.data, transfer);

      setTimeout(() => {
        appendMessage(getTransferMessage(value, transfer.person), "bot");
        showRepeatOptions();
      }, 400);

      return;
    }

    // الخطوة 4: خدمة جديدة بنفس الاسم أو بدء من جديد
    if (chatState.step === 3) {
      if (normalizeText(value) === normalizeText("بدء من جديد")) {
        resetConversation();

        setTimeout(() => {
          appendMessage(
            "أهلاً بك مع المساعد الذكي لـ IPO. من فضلك اكتب اسمك الكامل.",
            "bot"
          );
        }, 400);
        return;
      }

      if (!isValidService(value)) {
        setTimeout(() => {
          appendMessage(
            "إذا أردت إدخال عملية أخرى بنفس الاسم، اختر الخدمة مباشرة: دراسة جدوى / محاسبة / ضرائب / مراجعة. ولو عايز تبدأ من أول وجديد اكتب: بدء من جديد",
            "bot"
          );
        }, 400);
        return;
      }

      chatState.data.service = value;
      const transfer = getTransferData(value);
      sendToWhatsApp(chatState.data, transfer);

      setTimeout(() => {
        appendMessage(getTransferMessage(value, transfer.person), "bot");
        showRepeatOptions();
      }, 400);
    }
  });
}