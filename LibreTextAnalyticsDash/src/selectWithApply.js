import React from "react";
import { Box, Button, Select } from "grommet";

export default function SelectWithApply({
  selectOptions,
  value,
  dropdownFunction,
  clickFunction,
  state,
  setState,
  type,
  disable,
  optionalSelect,
  renderSelect,
  width,
  dropSize,
  queryVariables
}) {
  var dropHeight = "small"
  if (dropSize) {
    dropHeight = dropSize
  }
  if (type === "studentAssignments" && state.displayMode) {
    selectOptions = state.encryptedStudents
  }
  return (
    <Box direction="row">
      <Select
        options={selectOptions}
        margin={{ vertical: "xsmall", right: "large" }}
        dropAlign={{
          top: "bottom",
          left: "left",
          right: "right",
        }}
        dropHeight={dropHeight}
        value={value}
        onChange={({ option }) =>
          dropdownFunction(type, option, state, setState, queryVariables.realCourses, queryVariables)
        }
        style={{width: width}}
      />
      {renderSelect && optionalSelect}
    <Button
      primary
      label="Apply"
      disabled={disable}
      onClick={() => clickFunction(state, setState, type, queryVariables)}
      margin={{
        bottom: "small",
        top: "small",
        right: "medium",
      }}
    />
    {type === "studentAssignments" &&
      <Button
        secondary
        size="small"
        label="Clear Student"
        onClick={() => setState({...state, student: null, studentAssignments: null})}
        margin={{
          bottom: "small",
          top: "small",
          right: "medium",
        }}
      />
    }
  </Box>
  );
}
