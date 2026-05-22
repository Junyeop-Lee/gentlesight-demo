const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);

function assertTrainingPage() {
  const isLocal =
    localHosts.has(window.location.hostname) ||
    window.location.protocol === "file:";
  const root = document.querySelector('[data-training-page="ticket-macro-training"]');

  if (!isLocal || !root) {
    throw new Error(
      "This training macro only runs on the local ticket-training demo page."
    );
  }
}

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

function findAvailableSection(preferredSection, quantity) {
  const sections = Array.from(
    document.querySelectorAll(
      '[data-training-id^="section-"][data-training-available="true"]'
    )
  );

  if (preferredSection) {
    const preferred = normalize(preferredSection);
    const match = sections.find((section) =>
      normalize(section.dataset.trainingSectionName).includes(preferred)
    );

    if (match) {
      return match;
    }
  }

  return (
    sections.find(
      (section) => Number(section.dataset.trainingRemaining ?? 0) >= quantity
    ) ??
    sections[0] ??
    null
  );
}

function clickByTrainingId(trainingId) {
  const target = document.querySelector(`[data-training-id="${trainingId}"]`);

  if (!(target instanceof HTMLElement)) {
    throw new Error(`Missing training target: ${trainingId}`);
  }

  target.click();
  return target;
}

function setSelectValue(trainingId, value) {
  const target = document.querySelector(`[data-training-id="${trainingId}"]`);

  if (!(target instanceof HTMLSelectElement)) {
    throw new Error(`Missing training select: ${trainingId}`);
  }

  target.value = String(value);
  target.dispatchEvent(new Event("input", { bubbles: true }));
  target.dispatchEvent(new Event("change", { bubbles: true }));
  return target;
}

function readText(trainingId) {
  return (
    document.querySelector(`[data-training-id="${trainingId}"]`)?.textContent?.trim() ??
    ""
  );
}

export async function runTicketTrainingMacro(options = {}) {
  assertTrainingPage();

  const delay = Math.min(
    2000,
    Math.max(80, Number(options.stepDelayMs ?? 350))
  );
  const quantity = Math.min(4, Math.max(0, Number(options.quantity ?? 2)));
  const section = findAvailableSection(options.preferredSection, quantity);

  if (!(section instanceof HTMLElement)) {
    throw new Error("No available demo section found.");
  }

  section.click();
  await wait(delay);
  clickByTrainingId("auto-assign");
  await wait(delay);

  const shortageModal = document.querySelector('[data-training-id="shortage-modal"]');

  if (shortageModal) {
    return {
      ok: false,
      reason: shortageModal.textContent?.trim() ?? "Auto assignment failed.",
      section: section.dataset.trainingSectionName ?? ""
    };
  }

  clickByTrainingId("seat-confirm");
  await wait(delay);

  if (options.includePriceStep !== false) {
    setSelectValue("price-basic-quantity", quantity);
    await wait(delay);
    clickByTrainingId("next-price");
  }

  return {
    ok: true,
    section: section.dataset.trainingSectionName ?? "",
    seat:
      document.querySelector('[data-training-id="selected-seat"] strong')
        ?.textContent ??
      document.querySelector('[data-training-id="summary-seat-count"]')
        ?.textContent ??
      "",
    total: readText("summary-total")
  };
}

window.runTicketTrainingMacro = runTicketTrainingMacro;
