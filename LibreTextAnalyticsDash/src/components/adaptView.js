import { Grid, Grommet } from "grommet";
import infoText from "./allInfoText.js";
import { getFilteredChartData } from "../functions/dataFetchingFunctions.js";
import DataToCSV from "./dataToCSV.js";
import { changeBinVal, changePropValue } from "../functions/filterFunctions.js";
import GradesPageView from "./gradesPageViewsChart.js";
import HeaderGrid from "./headerGrid.js";
import LayeredComponent from "./layeredComponent.js";
import PageViewsChart from "./pageViewsChart.js";

// Key Components:
// Header: Legend?
// PageViewsChart: state.aggregateAssignmentViews, state.individualAssignmentViews
// GradesPageView: state.allAssignmentGrades, state.gradesPageView

//this view only shows if there is adapt data available
export default function AdaptView({ state, setState, queryVariables, theme }) {
  var height = "1500px";
  var rows = ["50%", "50%"];
  //handling cases if some data is not there, mostly out of use with aggregate views showing
  if (!state.aggregateAssignmentViews && !state.allAssignmentGrades) {
    height = "500px";
  } else if (!state.aggregateAssignmentViews && state.allAssignmentGrades) {
    height = "1000px";
    rows = ["25%", "75%"];
  } else if (!state.allAssignmentGrades && state.aggregateAssignmentViews) {
    height = "1000px";
    rows = ["75%", "25%"];
  }

  return (
    <>
      <Grommet theme={theme}>
        {state.hasAdapt && (
          <HeaderGrid
            state={state}
            setState={setState}
            queryVariables={queryVariables}
            data={state.hasAdapt}
          />
        )}
        <Grid
          fill={true}
          height={height}
          rows={rows}
          columns={["19%", "79%"]}
          gap="small"
          areas={[
            { name: "timeline", start: [0, 0], end: [1, 0] },
            { name: "gradesChart", start: [0, 1], end: [1, 1] },
          ]}
          flex={true}
          responsive={true}
          overflow="hidden"
          justifyContent="center"
        >
          {state.adaptLevels && (
            <LayeredComponent
              gridArea="timeline"
              queryVariables={queryVariables}
              disable={state.disableAssignment}
              loading={infoText.loadingMessage}
              title="ADAPT Activity"
              selectedInfoText={infoText.individualAssignmentsChart}
              filterLabel="Bar Chart Display Filters"
              state={state}
              setState={setState}
              component={
                <PageViewsChart
                  data={state.aggregateAssignmentViews}
                  individualData={state.individualAssignmentViews}
                  type="individualAssignment"
                  xaxis="_id"
                  yaxis="count"
                  binLabel={state.individualAssignmentBinLabel}
                  width={980}
                  height={500}
                  accessibilityMode={state.accessibilityMode}
                />
              }
              data={state.aggregateAssignmentViews}
              label={state.individualAssignmentBinLabel}
              filterOptions={["Day", "Week", "2 Weeks", "Month"]}
              filterSelectLabel="Unit of Time:"
              filterFunction={changeBinVal}
              clickFunction={getFilteredChartData}
              clickFunctionAttributes={{
                payloadAttributes: {
                  bin: state.individualAssignmentBin,
                  unit: state.individualAssignmentUnit,
                },
                path: "/aggregateassignmentviews",
                individualPayloadAttributes: {
                  bin: state.individualAssignmentBin,
                  unit: state.individualAssignmentUnit,
                  path: state.dataPath,
                  levelGroup: state.levelGroup,
                  levelName: state.levelName,
                  tagFilter: state.chosenTag,
                  type: "pages",
                },
                individualPath: "/individualpageviews",
                key: "aggregateAssignmentViews",
                individual: state.levelName,
              }}
              type="individualAssignmentViews"
              axisType="individualAssignmentBinLabel"
              optionalLoadingTest={state.levelName}
              topMargin="large"
              downloadComponent={
                <DataToCSV
                  data={
                    state.individualAssignmentViews
                      ? state.individualAssignmentViews
                      : state.aggregateAssignmentViews
                  }
                  accessibilityMode={state.accessibilityMode}
                  filename={
                    state.individualAssignmentViews
                      ? state.levelGroup + "-" + state.levelName + "-submissions.csv"
                      : "aggregate-assignment-submissions.csv"
                  }
                  headers={state.individualAssignmentViews ?
                    [
                      { label: "Date", key: "dateString" },
                      { label: "Number of Submissions", key: "count" },
                      { label: "Number of Unique Students", key: "uniqueStudents.length" }
                    ]
                    : [
                      { label: "Date", key: "dateString" },
                      { label: "Number of Submissions", key: "count" },
                      {
                        label: "Number of Unique Assignments",
                        key: "assignmentCount",
                      },
                      {
                        label: "Number of Unique Questions",
                        key: "uniqueQuestions.length",
                      },
                      {
                        label: "Number of Students",
                        key: "studentCount",
                      },
                    ]}
                />
              }
            />
          )}
          {state.adaptLevels && (
            <LayeredComponent
              gridArea="gradesChart"
              queryVariables={queryVariables}
              loading={infoText.loadingMessage}
              title="Assignment Performance"
              selectedInfoText={
                state.gradesFromGradebook
                  ? infoText.assignmentGradesChart
                  : infoText.assignmentGradesChart +
                    " " +
                    state.course +
                    " has no gradebook data available. Data is being pulled from ADAPT. The grades are unweighted and may be inaccurate."
              }
              filterLabel="Grades Histogram Filters"
              filterType="slider"
              state={state}
              setState={setState}
              component={
                <GradesPageView
                  data={state.allAssignmentGrades}
                  range={[0, 1]}
                  numberOfBins={state.numBinsGrades}
                  height={500}
                  individualData={state.gradesPageView}
                  accessibilityMode={state.accessibilityMode}
                  assignmentGroup={state.levelGroup}
                  assignmentName={state.levelName}
                />
              }
              data={state.allAssignmentGrades}
              label={state.sliderValue}
              filterOptions={[1, state.allAssignmentGrades]}
              filterSelectLabel="Number of bins:"
              filterFunction={changePropValue}
              clickFunction={changePropValue}
              type="numBinsGrades"
              axisType="sliderValue"
              optionalLoadingTest={state.gradeLevelName}
              topMargin="large"
            />
          )}
        </Grid>
      </Grommet>
    </>
  );
}
