import {
  Grid,
  Box,
  Button,
  Notification,
  Spinner,
  Text,
  Select
} from "grommet";
import Legend from "./legend.js";
import CourseDropdown from "./courseDropdown.js";
import Tabs from "./tabs.js";
import InfoBox from "./infoBox.js";
import ChosenFilters from "./chosenFilters.js";
import CheckBoxGroup from "./checkBoxGroup.js";
import SelectWithApply from "./selectWithApply.js";
import { handleChange } from "./handleChangeFunction.js";
import { handleIndividual, getAllStudentData } from "./dataFetchingFunctions.js";
import { infoText } from "./allInfoText.js";
import {
  changeColumns,
} from "./filterFunctions.js";

export default function HeaderGrid({
  state,
  setState,
  queryVariables,
  data,
  initPage = false,
}) {
  var gridAreas = [
    { name: "courses", start: [0, 0], end: [1, 0] },
    { name: "legend", start: [1, 0], end: [2, 0] },
    { name: "filters", start: [0, 1], end: [2, 1] },
    { name: "checks", start: [0, 2], end: [2, 2] },
  ];
  //work here
  var rows = ["auto", "auto", "auto"];
  var columns = ["77%", "23%"];
  if (state.tab !== "student" && !initPage) {
    gridAreas.splice(3, 1);
    rows.pop();
  } else if (initPage) {
    gridAreas = [{ name: "courses", start: [0, 0], end: [2, 0] }];
    rows = ["small"];
  }
  // if (
  //   state.tab === "filters" &&
  //   !(state.chosenPath || state.start || state.end || state.reset || state.chosenTag)
  // ) {
  //   columns = ["65%", "35%"];
  //   gridAreas = [{ name: "courses", start: [0, 0], end: [2, 0] }];
  //   rows = ["xsmall"];
  // } else
   if (
    state.tab === "filters"
  ) {
    columns = ["65%", "35%"];
  }

  return (
    <>
      {!initPage && (
        <Tabs
          state={state}
          setState={setState}
        />
      )}
      <Box>
        <Grid
          rows={rows}
          columns={columns}
          areas={gridAreas}
          flex={true}
          responsive={true}
          margin="medium"
          overflow="hidden"
        >
          {queryVariables.realCourses && (
            <CourseDropdown
              state={state}
              setState={setState}
              queryVariables={queryVariables}
              initPage={initPage}
            />
          )}
          {!initPage &&
            state.tab === "filters" && (
              <ChosenFilters
                state={state}
                setState={setState}
                gridArea="legend"
                queryVariables={queryVariables}
              />
            )}
          {!initPage &&
            data &&
            (data.length > 1 || data === true) &&
            state.tab !== "filters" && (
              <>
                <Legend
                  state={state}
                  setState={setState}
                  queryVariables={queryVariables}
                />
                {!initPage && state.tab === "student" && queryVariables.click && (
                  <>
                  <Box align="center">
                  <Box direction="column" style={{width: "350px"}} align="center">
                    <Text weight="bold">Student: </Text>
                    <Select
                      options={state.allStudents}
                      margin={{ vertical: "small" }}
                      dropAlign={{
                        top: "bottom",
                        left: "left",
                        right: "right",
                      }}
                      dropHeight={"medium"}
                      value={state.student}
                      onChange={({ option }) =>
                        handleChange(
                          "studentAssignments",
                          option,
                          state,
                          setState,
                          queryVariables.realCourses,
                          queryVariables
                        )
                      }
                    />
                    <Button
                      primary
                      label="Apply"
                      disabled={state.disableStudent}
                      onClick={() => getAllStudentData(state, setState, "studentAssignments")}
                      margin={{
                        bottom: "small",
                      }}
                      style={{width: "175px"}}
                    />
                      <Button
                        secondary
                        size="small"
                        label="Clear Student"
                        onClick={() => setState({ ...state, student: null, studentAssignments: null, textbookEngagementData: null })}
                        style={{width: "125px"}}
                      />
                  </Box>
                  </Box>
                  <Box gridArea="checks">
                    <Box
                      width="100px"
                      margin={{ top: "medium", left: "xsmall" }}
                    >
                      <Button
                        label="Choose Columns"
                        secondary
                        color="#0047BA"
                        size="small"
                        onClick={() =>
                          setState({
                            ...state,
                            showCheckboxes: !state.showCheckboxes,
                          })
                        }
                      />
                    </Box>
                    {state.showCheckboxes && (
                      <CheckBoxGroup
                        tableColumns={state.tableColumns}
                        changeColumns={changeColumns}
                        state={state}
                        setState={setState}
                      />
                    )}
                  </Box>
                  </>
                )}
              </>
            )}
        </Grid>
        {!state.disableCourse && state.courseId && (
          <Box
            width="30%"
            alignSelf="center"
            margin={{ right: "large", top: "large" }}
          >
            {state.ltCourse && !state.adaptCourse && (
              <Text weight="bold">
                This course has LibreText data available.
              </Text>
            )}
            {state.adaptCourse && !state.ltCourse && (
              <Text weight="bold">
                This course has Adapt data available.
              </Text>
            )}
            {state.ltCourse && state.adaptCourse && (
              <Text weight="bold">
                This course has LibreText and Adapt data available.
              </Text>
            )}
          </Box>
        )}
      </Box>
      {state.disableCourse && !data && (
        <InfoBox
          infoText={infoText.loadingMessage}
          showIcon={true}
          icon={<Spinner />}
        />
      )}
      {data && data.length < 1 && (
        <Notification title={infoText.noDataMessage} onClose={() => {}} />
      )}
    </>
  );
}
