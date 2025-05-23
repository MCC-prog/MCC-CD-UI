import React, { useEffect, useState } from "react";
import Select from "react-select";
import { APIClient } from "../../helpers/api_helper";

const api = new APIClient();

interface GetAllDepartmentDropdownProps {
  value: any;
  onChange: (selectedOption: any) => void;
  placeholder?: string;
  isInvalid?: boolean;
}

const GetAllDepartmentDropdown: React.FC<GetAllDepartmentDropdownProps> = ({
  value,
  onChange,
  placeholder = "Select Department",
  isInvalid = false,
}) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGetAllDepartment = async () => {
      try {
        // Fetch data from API
        const response = await api.get("/getAllDepartmentEntry", "");

        // Map all Department data to the required format
        const departmentList = response.map((department: any) => ({
          value: department.id,
          label: department.name,
        }));

        setOptions(departmentList);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch Department");
        setLoading(false);
      }
    };

    fetchGetAllDepartment();
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
      onChange={(selectedOptions) => onChange(Array.isArray(selectedOptions) ? [...selectedOptions] : [])}
      placeholder={placeholder}
      isMulti
      className={isInvalid ? "select-error" : ""}
      styles={{
        menu: (provided) => ({ ...provided, zIndex: 9999 }),
        menuList: (provided) => ({
          ...provided,
          maxHeight: "200px",
          overflowY: "auto",
        }),
      }}
    />
  );
};

export default GetAllDepartmentDropdown;
