import { Box, Button, TextInput } from "grommet";
import SelectWithApply from "./selectWithApply.js";
import { handleChange } from "../functions/handleChangeFunction.js";
import { handleClick, getEWSModelData } from "../functions/dataFetchingFunctions.js";
import InfoBox from "./infoBox.js";
import infoText from "./allInfoText.js";
import "../css/index.css";
import BasicCSSButton from "./basicCSSButton.js";
import React from "react";

// Used to load all courses to select from
export default function CourseDropdown({
  state,
  setState,
  queryVariables,
  initPage = false,
  height = "150px",
}) {
  const [value, setValue] = React.useState('');
  const [timeValue, setTimeValue] = React.useState('');
  const [textbookValue, setTextbookValue] = React.useState('');
  return (
    <Box gridArea="courses" height={height} margin={{ top: "small" }}>
      <Box width="100%" responsive={true}>
        {state.showInfoBox && (
          <InfoBox
            show={state.showInfoBox}
            state={state}
            queryVariables={queryVariables}
            infoText={infoText.courseText}
            color="#b0e0e6"
            main={true}
          />
        )}
      </Box>
      <Box direction="row">
        <Box
          gridArea="courses"
          alignContent={state.environment === "production" && !state.filterTab ? "end" : state.environment === "production" && state.filterTab ? "start" : "center"}
          align={state.environment === "production" && !state.filterTab ? "end" : state.environment === "production" && state.filterTab ? "start" : "center"}
          alignSelf={state.environment === "production" && !state.filterTab ? "end" : state.environment === "production" && state.filterTab ? "start" : "center"}
          fill
        >
          <Box direction="row">
          {state.environment === "development" && (
            <Box direction="column">
            <SelectWithApply
              selectOptions={Object.keys(queryVariables.realCourses)}
              value={state.courseName}
              dropdownFunction={handleChange}
              clickFunction={handleClick}
              queryVariables={queryVariables}
              state={state}
              setState={setState}
              type="courseId"
              disable={state.disableCourse}
              width="300px"
              dropSize="medium"
              a11yTitle="Select a course"
              initPage={initPage}
            />
            <TextInput value={textbookValue} onChange={event => setTextbookValue(event.target.value)}/>
            <TextInput value={value} onChange={event => setValue(event.target.value)}/>
            <TextInput value={timeValue} onChange={event => setTimeValue(event.target.value)}/>
            <Button onClick={() => setState((s) => ({...s, courseId: textbookValue, adaptCourseID: value, cutoffDate: timeValue, adaptCourse: value ? true : false, ltCourse: textbookValue ? true : false}))} />
            </Box>
          )}
            {!initPage && state.environment === "development" && (
              <Button
                label="Reload Course"
                secondary
                color="#0047BA"
                size="small"
                style={{ height: "30px" }}
                margin={{ top: "30px" }}
                onClick={() =>
                  handleClick(state, setState, "refresh", queryVariables)
                }
              />
            )}
            {!initPage && state.environment === "production" && (
              <BasicCSSButton label="Reload Course" onClickFunction={() => handleClick(state, setState, 'refresh', queryVariables)}/>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
