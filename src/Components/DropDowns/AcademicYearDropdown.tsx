import React, { useEffect, useState } from "react";
import Select from "react-select";
import { APIClient } from "../../helpers/api_helper";

const api = new APIClient();

interface AcademicYearDropdownProps {
    value: any;
    onChange: (selectedOption: any) => void;
    placeholder?: string;
    isInvalid?: boolean;
}

const AcademicYearDropdown: React.FC<AcademicYearDropdownProps> = ({
    value,
    onChange,
    placeholder = "Select Academic Year",
    isInvalid = false,
}) => {
    const [options, setOptions] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

<<<<<<< HEAD
=======
    const [menuOpen, setmenuOpen] = useState(false);

>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
    useEffect(() => {
        const fetchAcademicYears = async () => {
            try {
                // Fetch data from API
                const response = await api.get("/getAllAcademicYear", "");

                // Filter the response where isActive or isCurrentForAdmission is true
                const filteredAcademicYearList = response.filter(
                    (year: any) => year.isActive
                );

                // Map the filtered data to the required format
                const academicYearList = filteredAcademicYearList.map((year: any) => ({
                    value: year.year,
                    label: year.display
                }));

                setOptions(academicYearList);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch academic years");
                setLoading(false);
            }
        };

        fetchAcademicYears();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-danger">{error}</div>;
    }

    return (
        <Select
<<<<<<< HEAD
=======
        menuIsOpen ={menuOpen}
        onMenuOpen ={()=>setmenuOpen(true)}
        onMenuClose ={()=>setmenuOpen(false)}
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
            options={options}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={isInvalid ? "select-error" : ""}
            styles={{
                menu: (provided) => ({ ...provided, zIndex: 9999 }),
<<<<<<< HEAD
=======
                menuList: (provided) => ({
                    ...provided,
                    maxHeight: "170px",
                    overflowY: "auto",
                }),
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
            }}
        />
    );
};

export default AcademicYearDropdown;