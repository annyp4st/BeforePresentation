/* Survey helper (static, no backend)
   - collects answers
   - copies text result (for messenger)
*/

function $id(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el;
}

function $opt(id) {
  return document.getElementById(id);
}

function nowRu() {
  return new Date().toLocaleString("ru-RU");
}

function getSelectedValues(form) {
  const data = new FormData(form);
  const out = {};
  for (const [k, v] of data.entries()) {
    if (out[k] == null) out[k] = [];
    out[k].push(String(v));
  }
  return out;
}

function formatSurveyResult({ title, meta, answers, questions }) {
  const lines = [];
  lines.push(title);
  lines.push("");
  lines.push(`Дата/время: ${nowRu()}`);
  if (meta.className) lines.push(`Класс: ${meta.className}`);
  if (meta.student) lines.push(`Участник: ${meta.student}`);
  lines.push("");

  questions.forEach((q, i) => {
    lines.push(`${i + 1}. ${q.text}`);
    const chosen = answers[q.name] ?? [];
    if (chosen.length === 0) {
      lines.push("   Ответ: —");
    } else {
      chosen.forEach((v) => lines.push(`   - ${v}`));
    }
    if (q.freeName) {
      const free = (meta[q.freeName] ?? "").trim();
      if (free) lines.push(`   Комментарий: ${free}`);
    }
    lines.push("");
  });

  return lines.join("\n").trim() + "\n";
}

window.SurveyApp = {
  init({ title, questions, defaultEmail }) {
    const form = $id("surveyForm");
    const outEl = $id("resultText");
    const copyBtn = $id("copyBtn");

    const classEl = $id("className");
    const studentEl = $id("studentName");
    const teacherEmailEl = $opt("teacherEmail");

    if (teacherEmailEl && defaultEmail && !teacherEmailEl.value) {
      teacherEmailEl.value = String(defaultEmail);
    }

    function build() {
      const meta = {
        className: classEl.value || "",
        student: studentEl.value || "",
        teacherEmail: teacherEmailEl ? teacherEmailEl.value || "" : "",
        free7: ($opt("free7")?.value ?? ""),
        free4: ($opt("free4")?.value ?? ""),
      };
      const answers = getSelectedValues(form);
      const txt = formatSurveyResult({ title, meta, answers, questions });
      outEl.value = txt;
      return { txt };
    }

    copyBtn.addEventListener("click", async () => {
      const { txt } = build();
      try {
        await navigator.clipboard.writeText(txt);
        copyBtn.textContent = "Скопировано";
        setTimeout(() => (copyBtn.textContent = "Скопировать текст"), 1200);
      } catch {
        // file:// может не давать clipboard
        alert("Не удалось скопировать автоматически. Выдели текст в поле ниже и скопируй вручную.");
      }
    });
  },
};

