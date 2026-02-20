import React, { createContext, useContext, useState } from "react";
import ConfirmationModal from "../components/ui/ConfirmationModal";

const ConfirmationContext = createContext();

export const useConfirm = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmationProvider");
  }
  return context;
};

export const ConfirmationProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
    confirmText: "Confirm",
    cancelText: "Cancel",
    isDanger: false,
    showInput: false,
    inputPlaceholder: "",
    inputType: "text",
    initialValue: "",
  });

  const openConfirm = ({
    title = "Are you sure?",
    message = "This action cannot be undone.",
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDanger = false,
    showInput = false,
    inputPlaceholder = "",
    inputType = "text",
    initialValue = "",
  }) => {
    setModalConfig({
      title,
      message,
      onConfirm: onConfirm || (() => {}),
      onCancel: onCancel || (() => {}),
      confirmText,
      cancelText,
      isDanger,
      showInput,
      inputPlaceholder,
      inputType,
      initialValue,
    });
    setIsOpen(true);
  };

  const closeConfirm = () => {
    setIsOpen(false);
    // Optional: Reset config after animation, but simpler to just close
  };

  const handleConfirm = (inputValue) => {
    if (modalConfig.onConfirm) {
      modalConfig.onConfirm(inputValue);
    }
    closeConfirm();
  };

  const handleCancel = () => {
    if (modalConfig.onCancel) {
      modalConfig.onCancel();
    }
    closeConfirm();
  };

  return (
    <ConfirmationContext.Provider value={{ openConfirm, closeConfirm }}>
      {children}
      {isOpen && (
        <ConfirmationModal
          isOpen={isOpen}
          title={modalConfig.title}
          message={modalConfig.message}
          confirmText={modalConfig.confirmText}
          cancelText={modalConfig.cancelText}
          isDanger={modalConfig.isDanger}
          showInput={modalConfig.showInput}
          inputPlaceholder={modalConfig.inputPlaceholder}
          inputType={modalConfig.inputType}
          initialValue={modalConfig.initialValue}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmationContext.Provider>
  );
};
