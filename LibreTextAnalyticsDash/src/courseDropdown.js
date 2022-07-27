import { Box, Button } from "grommet";
import InfoBox from "./collapsible_info_box.js";
import SelectWithApply from "./selectWithApply.js";

export default function CourseDropdown({
  state,
  setState,
  infoText,
  realCourses,
  handleChange,
  handleClick,
  queryVariables,
  initPage=false
}) {

  return (
    <Box gridArea="courses" height="175px" margin={{top: "small"}}>
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
              selectOptions={Object.keys(realCourses)}
              value={state.courseName}
              dropdownFunction={handleChange}
              clickFunction={handleClick}
              state={state}
              setState={setState}
              type="courseId"
              disable={state.disableCourse}
              width="300px"
              dropSize="medium"
              realCourses={realCourses}
              queryVariables={queryVariables}
            />
            {!initPage &&
              <Button
                label="Reload Course"
                secondary
                color="#0047BA"
                size="small"
                style={{height: "30px"}}
                margin={{top: "small"}}
                onClick={() => handleClick(state, setState, "refresh", queryVariables)}
              />
            }
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
