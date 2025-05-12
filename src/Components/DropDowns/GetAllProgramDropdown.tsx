import React, { useEffect, useState } from "react";
import Select from "react-select";
import { APIClient } from "../../helpers/api_helper";

const api = new APIClient();

interface GetAllProgramDropdownProps {
  value: any;
  onChange: (selectedOption: any) => void;
  placeholder?: string;
  isInvalid?: boolean;
}

const GetAllProgramDropdown: React.FC<GetAllProgramDropdownProps> = ({
  value,
  onChange,
  placeholder = "Select Program",
  isInvalid = false,
}) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGetAllProgram = async () => {
      try {
        // Fetch data from API
        const response = await api.get("/getAllCourses", "");

        // Map all course data to the required format
        const programList = response.map((course: any) => ({
          value: course.id,
          label: course.courseName,
        }));

        setOptions(programList);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch Program");
        setLoading(false);
      }
    };

    fetchGetAllProgram();
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

export default GetAllProgramDropdown;
