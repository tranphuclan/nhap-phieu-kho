(function () {
  const dialog = document.getElementById("confirm-delete");
  const form = document.getElementById("confirm-delete-form");
  const label = document.getElementById("confirm-delete-no");
  const cancel = dialog?.querySelector("[data-confirm-cancel]");
  const submit = form?.querySelector('button[type="submit"]');

  if (!(dialog instanceof HTMLDialogElement) || !(form instanceof HTMLFormElement) || !label) {
    return;
  }

  const submitLabel = submit?.textContent ?? "Xóa phiếu";

  function openConfirm(trigger) {
    const url = trigger.getAttribute("data-url");
    if (!url) return;
    form.action = url;
    label.textContent = trigger.getAttribute("data-document-no") || "";
    if (submit) {
      submit.disabled = false;
      submit.textContent = submitLabel;
    }
    dialog.showModal();
    if (cancel instanceof HTMLButtonElement) {
      cancel.focus();
    }
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target instanceof Element
      ? event.target.closest("[data-confirm-delete]")
      : null;
    if (trigger) {
      event.preventDefault();
      openConfirm(trigger);
      return;
    }
    if (event.target === dialog) {
      dialog.close();
    }
  });

  cancel?.addEventListener("click", () => {
    dialog.close();
  });

  form.addEventListener("submit", () => {
    if (submit) {
      submit.disabled = true;
      submit.textContent = "Đang xóa…";
    }
  });
})();
