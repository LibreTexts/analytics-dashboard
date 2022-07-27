import {
  Grid,
  Box,
  Button,
  CheckBoxGroup,
  Notification,
  Spinner,
  Text
} from "grommet";
import Legend from "./legend.js";
import CourseDropdown from "./courseDropdown.js";
import Tabs from "./tabs.js";
import InfoBox from "./collapsible_info_box.js";
import DataFilters from "./dataFilters.js";
import ChosenFilters from "./chosenFilters.js";
import { menuCollapsible, handleFilterClick } from "./filterFunctions.js";

export default function HeaderGrid({
  state,
  setState,
  handleClick,
  queryVariables,
  realCourses,
  infoText,
  handleChange,
  changeColumns,
  data,
  click,
  initPage=false
}) {

  var gridAreas = [
    { name: "courses", start: [0, 0], end: [1, 0] },
    { name: "legend", start: [1, 0], end: [2, 0] },
    { name: "filters", start: [0, 1], end: [2, 1] },
    { name: "checks", start: [0, 2], end: [2, 2] }
  ]
  //work here
  var rows = ["auto", "auto", "auto"]
  var columns = ["77%", "23%"]
  if (state.tab !== "student" && !initPage) {
    gridAreas.splice(3, 1)
    rows.pop()
  } else if (initPage) {
    gridAreas = [
      { name: "courses", start: [0, 0], end: [2, 0] }
    ]
    rows = ["small"]
  }
  if (state.tab === "filters" && !(state.chosenPath || state.start || state.end || state.reset)) {
    columns = ["65%", "35%"]
    gridAreas = [
      { name: "courses", start: [0, 0], end: [2, 0] }
    ]
    rows = ["xsmall"]
  } else if (state.tab === "filters" && (state.chosenPath || state.start || state.end || state.reset)) {
    columns = ["65%", "35%"]
  }

  return (
    <>
      {!initPage &&
        <Tabs
          state={state}
          setState={setState}
          hasAdapt={state.hasAdapt}
          ltCourse={state.ltCourse}
        />
      }
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
        {realCourses && (
          <CourseDropdown
            state={state}
            setState={setState}
            infoText={infoText}
            realCourses={realCourses}
            handleChange={handleChange}
            handleClick={handleClick}
            queryVariables={queryVariables}
            initPage={initPage}
          />
        )}
        {!initPage && (state.tab === "filters") &&
          (state.chosenPath || state.start || state.end || state.reset) && (
          <ChosenFilters
            state={state}
            setState={setState}
            gridArea="legend"
          />
        )}
        {!initPage && data && (data.length > 1 || data === true) && (state.tab !== "filters") && (
          <>
            <Legend
              state={state}
              setState={setState}
              handleClick={handleClick}
              queryVariables={queryVariables}
            />
            {!initPage && state.tab === "student" && click && (
              <Box gridArea="checks">
                <Box width="100px" margin={{ top: "medium", left: "xsmall" }}>
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
                    direction="row"
                    margin={{ top: "medium", left: "xsmall" }}
                    options={Object.keys(state.tableColumns)}
                    value={state.checkedValues}
                    onChange={({ option, value }) =>
                      changeColumns(option, value, state, setState)
                    }
                  />
                )}
              </Box>
            )}
          </>
        )}
      </Grid>
      {false && state.courseId && initPage &&
        <Box width="30%" alignSelf="center" margin={{right: "xlarge", top: "large"}}>
          {state.ltCourse && !state.adaptCourse &&
            <Text weight="bold">This course only has LibreText data available.</Text>
          }
          {state.adaptCourse && !state.ltCourse &&
            <Text weight="bold">This course only has Adapt data available.</Text>
          }
          {state.ltCourse && state.adaptCourse &&
            <Text weight="bold">This course has LibreText and Adapt data available.</Text>
          }
        </Box>
      }
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
