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
  realCourses,
  queryVariables
}) {
  var dropHeight = "small"
  if (dropSize) {
    dropHeight = dropSize
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
          dropdownFunction(type, option, state, setState, realCourses, queryVariables)
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
  </Box>
  );
}
