import React from "react";
import { Box, Button, Select, Text } from "grommet";

//dropdown component with apply button
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
  queryVariables,
  selectLabel,
  a11yTitle
}) {
  var dropHeight = "small";
  if (dropSize) {
    dropHeight = dropSize;
  }
  //checks for display mode, which will hide student emails
  if (
    (type === "studentAssignments" ||
      type === "studentForChapterChart" ||
      type === "studentForTextbookEngagement") &&
    state.displayMode
  ) {
    selectOptions = state.encryptedStudents;
  }

  return (
    <Box direction="row">
      <Text alignSelf="center" margin={{right: "small"}}>
        {selectLabel}
      </Text>
      <Select
        a11yTitle={a11yTitle}
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
          dropdownFunction(
            type,
            option,
            state,
            setState,
            queryVariables.realCourses,
            queryVariables
          )
        }
        style={{ width: width }}
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
      {(type === "studentAssignments" ||
        type === "studentForChapterChart" ||
        type === "studentForTextbookEngagement") && (
        <Button
          secondary
          size="small"
          label="Clear Student"
          onClick={() =>
            type === "studentAssignments"
              ? setState({ ...state, student: null, studentAssignments: null })
              : type === "studentForChapterChart"
              ? setState({
                  ...state,
                  studentForChapterChart: null,
                  individualChapterData: null,
                })
              : setState({
                  ...state,
                  studentForTextbookEngagement: null,
                  textbookEngagementData: null,
                })
          }
          margin={{
            bottom: "small",
            top: "small",
            right: "medium",
          }}
        />
      )}
      {type === "page" && (
        <Button
          secondary
          size="small"
          label="Clear Page"
          onClick={() =>
            setState({ ...state, page: null, individualPageViews: null })
          }
          margin={{
            bottom: "small",
            top: "small",
            right: "medium",
          }}
        />
      )}
      {(type === "pageLevelGroup" || type === "gradesPageLevelGroup") && (
        <Button
          secondary
          size="small"
          label="Clear Assignment"
          onClick={() =>
            type === "pageLevelGroup" ?
            setState({ ...state, levelGroup: null, levelName: null, individualAssignmentViews: null, disableAssignment: true }) :
            setState({ ...state, gradeLevelGroup: null, gradeLevelName: null, gradesPageView: null, disableGradesAssignment: true })
          }
          margin={{
            bottom: "small",
            top: "small",
            right: "medium",
          }}
        />
      )}
    </Box>
  );
}
