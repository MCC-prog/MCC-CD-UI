import React, { useEffect, useState } from "react";
import Select from "react-select";
import { APIClient } from "../../helpers/api_helper";

const api = new APIClient();

interface AssociationDropdownProps {
  value: any;
  onChange: (selectedOption: any) => void;
  placeholder?: string;
  isInvalid?: boolean;
}

const AssociationDropdown: React.FC<AssociationDropdownProps> = ({
  value,
  onChange,
  placeholder = "Select Association",
  isInvalid = false,
}) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchGetAllAssociationDropdown = async () => {
    try {
      const data = await api.get("/centralized/commonApi/getAllAssociation", {});
      console.log("Raw API data:", data);

      const associationList = (Array.isArray(data) ? data : data?.data || []).map(
        (association: any) => ({
          value: association.associationId,
          label: association.name,
        })
      );

      setOptions(associationList);
    } catch (err) {
      console.error("Error fetching association list:", err);
      setError("Failed to fetch all association list");
    } finally {
      setLoading(false);
    }
  };

  fetchGetAllAssociationDropdown();
}, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-danger">{error}</div>;
  }

  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={isInvalid ? "select-error" : ""}
      styles={{
        menu: (provided) => ({ ...provided, zIndex: 9999 }),
      }}
    />
  );
};

export default AssociationDropdown;
