import { Grid, Box, Text } from "grommet";
import HeaderGrid from "./headerGrid.js";
import DataFilters from "./dataFilters.js";
import MultiSelect from "./multiSelect.js";
import { handleClick } from "../functions/dataFetchingFunctions.js";
import { handleChange } from "../functions/handleChangeFunction.js";
import TitleText from "./titleText.js";
import infoText from "./allInfoText.js";

// Key Components:
// Header: Course Dropdown, ChosenFilters
// DataFilters: Date/MetaTag/Class Roster
// (Course Structure Dropdown) MultiSelect: state.dataPath

export default function FilterView({ state, setState, queryVariables }) {
  var noEnrollmentData = false;
  if (state.studentData) {
    state.studentData.forEach((student) => {
      if (student.isEnrolled === "N/A") {
        noEnrollmentData = true;
      }
    });
  }
  return (
    <>
      <HeaderGrid
        state={state}
        setState={setState}
        queryVariables={queryVariables}
        data={true}
        noEnrollmentData={noEnrollmentData}
      />
      <Grid
        height="1000px"
        rows={["auto", "auto"]}
        columns={["50%", "50%"]}
        gap="small"
        areas={[
          { name: "filters", start: [0, 0], end: [0, 0] },
          { name: "dropdown", start: [1, 0], end: [1, 0] },
          { name: "metatag", start: [1, 1], end: [1, 1] },
        ]}
        flex={true}
        responsive={true}
        overflow="hidden"
        justifyContent="center"
        margin={{ bottom: "medium" }}
      >
        {queryVariables.click && (
          <>
            <DataFilters
              state={state}
              setState={setState}
              queryVariables={queryVariables}
              noEnrollmentData={noEnrollmentData}
            />
            {state.allChapters && state.ltCourse && (
              <Box
                width="500px"
                border={state.resetPath}
                margin={{ left: "xlarge" }}
                gridArea="dropdown"
              >
                { (
                  <TitleText
                    title="Course Structure Dropdown"
                    text={infoText.courseStructureDropdown}
                  />
                )}
                <MultiSelect
                  resetPath={state.resetPath}
                  pathLength={state.pathLength}
                  data={state.allChapters}
                  levels={state.courseLevel}
                  handleChange={handleChange}
                  filterClick={handleClick}
                  init={state.dataPath}
                  state={state}
                  setState={setState}
                  queryVariables={queryVariables}
                />
              </Box>
            )}
          </>
        )}
      </Grid>
    </>
  );
}
