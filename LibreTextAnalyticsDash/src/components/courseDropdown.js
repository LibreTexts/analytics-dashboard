import { Box, Button } from "grommet";
import SelectWithApply from "./selectWithApply.js";
import { handleChange } from "../functions/handleChangeFunction.js";
import { handleClick } from "../functions/dataFetchingFunctions.js";
import InfoBox from "./infoBox.js";
import infoText from "./allInfoText.js";

// Used to load all courses to select from
export default function CourseDropdown({
  state,
  setState,
  queryVariables,
  initPage = false,
}) {
  return (
    <Box gridArea="courses" height="200px" margin={{ top: "small" }}>
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
          alignContent="center"
          align="center"
          alignSelf="center"
          fill
        >
          <Box direction="row">
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
            {!initPage && (
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
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
