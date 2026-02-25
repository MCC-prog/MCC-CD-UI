import React, { useState } from "react";
import ChecklistModal from "./ChecklistModal";

const ChecklistLink: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <>
      <div
        style={{ cursor: "pointer", color: "#450202ff", marginBottom: "1rem" }}
        onClick={() => setShowModal(true)}
      >
        ✓ Screen Checklist
      </div>

      <ChecklistModal
        show={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default ChecklistLink;
