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
      const response = await api.get("/getAllDepartmentEntry", "");

      console.log("Raw API Response:", response);

      const filteredDepartmentList = response.filter((department: any) => {
        return String(department.isAcademic).toLowerCase() === "true" || String(department.isAcademic) === "1";
      });

      const departmentList = filteredDepartmentList.map((department: any) => ({
        value: department.id,
        label: department.name,
      }));

      console.log("Mapped Department Options:", departmentList);

      setOptions(departmentList);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch all Department");
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
      onChange={onChange}
      placeholder={placeholder}
      className={isInvalid ? "select-error" : ""}
         styles={{
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

export default GetAllDepartmentDropdown;
