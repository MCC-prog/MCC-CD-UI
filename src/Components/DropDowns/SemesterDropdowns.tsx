import React, { useState } from "react";
import { Col, Row, Label } from "reactstrap";
import SemesterTypeDropdown from "./SemesterTypeDropdown";
import Select from "react-select";

interface SemesterDropdownsProps {
  semesterTypeValue: any; // Single object for single-select
  semesterNoValue: any[]; // Array for multiselect
  onSemesterTypeChange: (selectedOption: any) => void;
  onSemesterNoChange: (selectedOptions: any[]) => void;
  isSemesterTypeInvalid?: boolean;
  isSemesterNoInvalid?: boolean;
  semesterTypeError?: string | null;
  semesterNoError?: string | null;
  semesterTypeTouched?: boolean;
  semesterNoTouched?: boolean;
}

const SemesterDropdowns: React.FC<SemesterDropdownsProps> = ({
  semesterTypeValue,
  semesterNoValue,
  onSemesterTypeChange,
  onSemesterNoChange,
  isSemesterTypeInvalid = false,
  isSemesterNoInvalid = false,
  semesterTypeError = null,
  semesterNoError = null,
  semesterTypeTouched = false,
  semesterNoTouched = false,
}) => {
  const [semesterNoOptions, setSemesterNoOptions] = useState<{ value: string; label: string }[]>([]);

  // Handle Semester Type Change
  const handleSemesterTypeChange = (selectedOption: any) => {
    onSemesterTypeChange(selectedOption);

    // Update SemesterNo options based on the selected SemesterType
    const options: { value: string; label: string }[] = [];

    if (selectedOption?.value === "odd") {
      options.push(
        { value: "I", label: "I" },
        { value: "III", label: "III" },
        { value: "V", label: "V" }
      );
    }

    if (selectedOption?.value === "even") {
      options.push(
        { value: "II", label: "II" },
        { value: "IV", label: "IV" },
        { value: "VI", label: "VI" }
      );
    }

    setSemesterNoOptions(options);

    // Reset the SemesterNo field when SemesterType changes
    onSemesterNoChange([]);
  };

  return (
    <Row>
      {/* Semester Type Dropdown */}
      <Col lg={6}>
        <div className="mb-3">
          <Label>Semester Type</Label>
          <SemesterTypeDropdown
            value={semesterTypeValue} // Single object for single-select
            onChange={handleSemesterTypeChange}
            isInvalid={isSemesterTypeInvalid}
          />
          {semesterTypeTouched && semesterTypeError && (
            <div className="text-danger">{semesterTypeError}</div>
          )}
        </div>
      </Col>

      {/* Semester No Dropdown */}
      <Col lg={6}>
        <div className="mb-3">
          <Label>Semester No.</Label>
          <Select
            options={semesterNoOptions}
            value={semesterNoValue} // Array of selected options for multiselect
            onChange={(selectedOptions) =>
              onSemesterNoChange(Array.isArray(selectedOptions) ? [...selectedOptions] : [])
            }
            isMulti // Enable multiselect
            placeholder="Select Semester Numbers"
            className={isSemesterNoInvalid ? "select-error" : ""}
          />
          {semesterNoTouched && semesterNoError && (
            <div className="text-danger">{semesterNoError}</div>
          )}
        </div>
      </Col>
    </Row>
  );
};

export default SemesterDropdowns;