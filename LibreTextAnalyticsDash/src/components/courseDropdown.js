import { Box, Button } from "grommet";
import SelectWithApply from "./selectWithApply.js";
import { handleChange } from "../functions/handleChangeFunction.js";
import { handleClick } from "../functions/dataFetchingFunctions.js";
import InfoBox from "./infoBox.js";
import infoText from "./allInfoText.js";
import "../css/index.css";
import BasicCSSButton from "./basicCSSButton.js";

// Used to load all courses to select from
export default function CourseDropdown({
  state,
  setState,
  queryVariables,
  initPage = false,
  height = "150px",
}) {
  return (
    <Box gridArea="courses" height={height} margin={{ top: "small" }}>
      <Box width="100%" responsive={true}>
        {state.showInfoBox && (
          <InfoBox
            show={state.showInfoBox}
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
