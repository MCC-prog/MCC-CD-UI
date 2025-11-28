import React, { useEffect, useState } from "react";
import Select from "react-select";
import { APIClient } from "../../helpers/api_helper";

const api = new APIClient();

interface DepartmentDropdownProps {
  streamId: string | null;
  value: any;
  onChange: (selectedOption: any) => void;
  placeholder?: string;
  isInvalid?: boolean;
  styles?: any; // Add styles property to the interface
}

const DepartmentDropdown: React.FC<DepartmentDropdownProps> = ({
  streamId,
  value,
  styles,
  onChange,
  placeholder = "Select Department",
  isInvalid = false,
}) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!streamId) {
      setOptions([]);
      return;
    }

    const fetchDepartments = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/getDepartmentByStream?streamId=${streamId}`, "");
        const departments = response.map((department: any) => ({
          value: department.id,
          label: department.name,
        }));
        setOptions(departments);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch departments");
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [streamId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={isInvalid ? "select-error" : ""}
      styles={{
        ...styles,
        menu: (provided) => ({ ...provided, zIndex: 9999 }),
        menuList: (provided) => ({
          ...provided,
          maxHeight: "170px",
          overflowY: "auto",
        }),
      }}
    />
  );
};

export default DepartmentDropdown;