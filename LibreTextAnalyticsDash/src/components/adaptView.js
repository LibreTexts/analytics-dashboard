import { Grid, Grommet, Select } from "grommet";
import infoText from "./allInfoText.js";
import { handleIndividual, handleGrade, getFilteredChartData } from "../functions/dataFetchingFunctions.js";
import { getAssignmentSubmissionsConfig } from "../functions/ltDataQueries.js";
import { getSubmissionsByAssignment } from "../functions/ltDataQueries-individual.js";
import DataToCSV from "./dataToCSV.js";
import { changeBinVal, changePropValue } from "../functions/filterFunctions.js";
import GradesPageView from "./gradesPageViewsChart.js";
import { handleChange } from "../functions/handleChangeFunction.js";
import HeaderGrid from "./headerGrid.js";
import LayeredComponent from "./layeredComponent.js";
import PageViewsChart from "./pageViewsChart.js";
import SelectWithApply from "./selectWithApply.js";

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
                aggregateFunction: getAssignmentSubmissionsConfig,
                individualFunction: getSubmissionsByAssignment,
                key: "aggregateAssignmentViews",
                isConfig: true,
                individual: state.levelName,
                bin: state.individualAssignmentBin,
                unit: state.individualAssignmentUnit
              }}
              type="individualAssignmentViews"
              axisType="individualAssignmentBinLabel"
              optionalLoadingTest={state.levelName}
              topMargin="large"
              downloadComponent={
                <DataToCSV
                  data={state.aggregateAssignmentViews}
                  filename={
                    state.levelGroup + "-" + state.levelName + "-views.csv"
                  }
                  headers={[
                    { label: "Date", key: "dateString" },
                    { label: "Number of Views", key: "count" },
                    {
                      label: "Number of Unique Students",
                      key: "uniqueStudents.length",
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
              disable={state.disableGradesAssignment}
              loading={infoText.loadingMessage}
              title="Assignment Performance"
              selectedInfoText={infoText.assignmentGradesChart}
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
              downloadComponent={
                <DataToCSV
                  data={state.allAssignmentGrades}
                  filename={
                    state.gradeLevelGroup +
                    "-" +
                    state.gradeLevelName +
                    "-views.csv"
                  }
                  headers={[
                    { label: "Student", key: "_id.student" },
                    { label: "Points Possible", key: "levelpoints" },
                    { label: "Points Earned", key: "Sum" },
                    { label: "Percent Score", key: "score" },
                  ]}
                />
              }
            />
          )}
        </Grid>
      </Grommet>
    </>
  );
}
