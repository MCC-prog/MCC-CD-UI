import React, { useEffect, useState } from "react";
import Select from "react-select";
import { APIClient } from "../../helpers/api_helper";

const api = new APIClient();

interface ProgramDropdownProps {
  degreeId: string | null; // Degree ID passed from the parent
  value: any[]; // Array for multi-select
  onChange: (selectedOptions: any[]) => void; // Array of selected options
  placeholder?: string;
  isInvalid?: boolean;
}

const ProgramDropdown: React.FC<ProgramDropdownProps> = ({
  degreeId,
  value,
  onChange,
  placeholder = "Select Programs",
  isInvalid = false,
}) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!degreeId) {
      setOptions([]);
      return;
    }

    const fetchPrograms = async () => {
      setLoading(true);
      try {
        // Fetch programs based on the selected degree ID
        const response = await api.get(`getCourseByProgramId?programId=${degreeId}`, "");
        const programsList = response.map((program: any) => ({
          value: program.id,
          label: program.courseName,
        }));
        setOptions(programsList);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch programs");
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [degreeId]);

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

export default ProgramDropdown;