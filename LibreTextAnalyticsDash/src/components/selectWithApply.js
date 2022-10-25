import React, { useState, useEffect } from "react";
import { Box, Button, Select, Text } from "grommet";
import { handleChange } from "../functions/handleChangeFunction.js";

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
  a11yTitle,
  optionalSelectOptions = null,
  optionalSelectType,
  optionalSelectValue,
  pathsWithAttributes,
  individual,
  disableName,
  initPage = false,
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

  const [options, setOptions] = useState(selectOptions);
  const [secondSelectOptions, setSecondSelectOptions] = useState(
    optionalSelectOptions
  );

  useEffect(() => {
    setSecondSelectOptions(optionalSelectOptions);
  }, [optionalSelectOptions]);

  return (
    <Box direction="row">
      <Text alignSelf="center" margin={{ right: "small" }}>
        {selectLabel}
      </Text>
      <Select
        a11yTitle={a11yTitle}
        options={options}
        margin={{ vertical: initPage ? "xsmall" : "medium", right: "large" }}
        dropAlign={{
          top: "bottom",
          left: "left",
          right: "right",
        }}
        onClose={() => {
          setOptions(selectOptions);
        }}
        onSearch={(text) => {
          const escapedText = text.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
          const exp = new RegExp(escapedText, "i");
          setOptions(selectOptions.filter((o) => exp.test(o)));
        }}
        dropHeight={dropHeight}
        value={value}
        onChange={({ option }) => {
          dropdownFunction(
            type,
            option,
            state,
            setState,
            queryVariables.realCourses,
            queryVariables
          );
          setOptions(selectOptions);
        }}
        style={{ width: width }}
      />
      {renderSelect && secondSelectOptions && (
        <Select
          options={secondSelectOptions}
          margin={{
            right: "medium",
            vertical: "medium",
          }}
          value={optionalSelectValue}
          onClose={() => {
            setSecondSelectOptions(optionalSelectOptions);
          }}
          onSearch={(text) => {
            const escapedText = text.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
            const exp = new RegExp(escapedText, "i");
            setSecondSelectOptions(
              optionalSelectOptions.filter((o) => exp.test(o))
            );
          }}
          onChange={({ option }) => {
            handleChange(optionalSelectType, option, state, setState);
            setSecondSelectOptions(optionalSelectOptions);
          }}
        />
      )}
      <Button
        primary
        label="Apply"
        disabled={disable}
        onClick={() =>
          type === "courseId"
            ? clickFunction(state, setState, type, queryVariables)
            : type === "studentForChapterChart"
            ? clickFunction(state, setState, pathsWithAttributes, disableName, individual+"-chapterChart", type)
            : clickFunction(state, setState, pathsWithAttributes, disableName, individual)
        }
        margin={{
          vertical: initPage ? "small" : "medium",
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
            vertical: "medium",
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
            setState({
              ...state,
              page: null,
              pageId: null,
              individualPageViews: null,
            })
          }
          margin={{
            vertical: "medium",
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
            setState({
              ...state,
              levelGroup: null,
              levelName: null,
              individualAssignmentViews: null,
              gradesPageView: null,
              disableAssignment: true,
            })
          }
          margin={{
            vertical: "medium",
            right: "medium",
          }}
        />
      )}
    </Box>
  );
}
