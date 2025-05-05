import React, { useEffect, useState } from "react";
import Select from "react-select";
import { APIClient } from "../../helpers/api_helper";

const api = new APIClient();

interface DegreeDropdownProps {
  programTypeId: string | null; // Program Type ID passed from the parent
  value: any;
  onChange: (selectedOption: any) => void;
  placeholder?: string;
  isInvalid?: boolean;
}

const DegreeDropdown: React.FC<DegreeDropdownProps> = ({
  programTypeId,
  value,
  onChange,
  placeholder = "Select Degree",
  isInvalid = false,
}) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!programTypeId) {
      setOptions([]);
      return;
    }

    const fetchDegrees = async () => {
      setLoading(true);
      try {
        // Fetch degrees based on the selected program type ID
        const degreeList = await api.get(`/ProgramsByProgramTypeId?programTypeId=${programTypeId}`, "");
        const degree = degreeList.map((deg: any) => ({
          value: deg.id,
          label: deg.name,
        }));
        setOptions(degree);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch degrees");
        setLoading(false);
      }
    };

    fetchDegrees();
  }, [programTypeId]);

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
        menu: (provided) => ({ ...provided, zIndex: 9999 }),
      }}
    />
  );
};

export default DegreeDropdown;