import React, { useEffect, useState } from "react";
import Select from "react-select";
import { APIClient } from "../../helpers/api_helper";

const api = new APIClient();

interface ProgramDropdownProps {
<<<<<<< HEAD
=======
   programTypeId: string | null; // Program Type ID passed from the parent
  deptId: string | null;
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
  degreeId: string | null; // Degree ID passed from the parent
  value: any[]; // Array for multi-select
  onChange: (selectedOptions: any[]) => void; // Array of selected options
  placeholder?: string;
  isInvalid?: boolean;
}

const ProgramDropdown: React.FC<ProgramDropdownProps> = ({
<<<<<<< HEAD
=======
  programTypeId,
  deptId,
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
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
<<<<<<< HEAD
    if (!degreeId) {
=======
    if (!programTypeId || !deptId || !degreeId) {
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
      setOptions([]);
      return;
    }

    const fetchPrograms = async () => {
      setLoading(true);
      try {
        // Fetch programs based on the selected degree ID
<<<<<<< HEAD
        const response = await api.get(`getCourseByProgramId?programId=${degreeId}`, "");
=======
        const response = await api.get(`getCoursesByDeptIdProgramTypeIdPId?deptId=${deptId}&programTypeId=${programTypeId}&programId=${degreeId}`, "");
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
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