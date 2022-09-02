import HeaderGrid from "./headerGrid.js";
import { Grid, Grommet, Select } from "grommet";
import SelectWithApply from "./selectWithApply.js";
import LayeredComponent from "./layeredComponent.js";
import PageViewsChart from "./pageViewsChart.js";
import GradesPageView from "./gradesPageViewsChart.js";
import { infoText } from "./allInfoText.js";
import DataToCSV from "./dataToCSV.js";
import {
  changeBinVal,
  changePropValue,
} from "./filterFunctions.js";
import {
  handleIndividual,
  handleGrade
} from "./dataFetchingFunctions.js";
import {
  handleChange
} from "./handleChangeFunction.js";

export default function AdaptView({ state, setState, queryVariables, theme }) {
  var height = "1500px";
  var rows = ["50%", "50%"];
  if (!state.aggregateAssignmentViews && !state.allAssignmentGrades) {
    height = "500px"
  } else if (!state.aggregateAssignmentViews && state.allAssignmentGrades) {
    height = "1000px"
    rows = ["25%", "75%"]
  } else if (!state.allAssignmentGrades && state.aggregateAssignmentViews) {
    height = "1000px"
    rows = ["75%", "25%"]
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
              title="Individual Assignment Metrics"
              infoText={infoText.individualAssignmentsChart}
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
                />
              }
              data={state.aggregateAssignmentViews}
              label={state.individualAssignmentBinLabel}
              filterOptions={["Day", "Week", "2 Weeks", "Month"]}
              filterSelectLabel="Unit of Time:"
              filterFunction={changeBinVal}
              clickFunction={handleIndividual}
              type="individualAssignmentViews"
              axisType="individualAssignmentBinLabel"
              optionalLoadingTest={state.levelName}
              topMargin="large"
              selectComponent={
                <SelectWithApply
                  selectOptions={Object.keys(state.adaptLevels)}
                  value={state.levelGroup}
                  dropdownFunction={handleChange}
                  clickFunction={handleIndividual}
                  queryVariables={queryVariables}
                  state={state}
                  setState={setState}
                  type="pageLevelGroup"
                  disable={state.disableAssignment}
                  optionalSelect={
                    <Select
                      options={state.adaptLevels[state.levelGroup]}
                      margin={{
                        right: "medium",
                        left: "medium",
                        vertical: "xsmall",
                      }}
                      value={state.levelName}
                      onChange={({ option }) =>
                        handleChange("pageLevelName", option, state, setState)
                      }
                    />
                  }
                  renderSelect={state.levelGroup}
                  queryVariables={queryVariables}
                />
              }
              downloadComponent={
                <DataToCSV
                  data = {state.individualAssignmentViews}
                  filename={state.levelGroup + "-" + state.levelName + "-views.csv"}
                  headers = {[
                    {label: 'Date', key: "dateString"},
                    {label: "Number of Views", key: 'count'},
                    {label: "Number of Unique Students", key: "uniqueStudents.length"}
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
              title="Grades by Assignment"
              infoText={infoText.assignmentGradesChart}
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
              selectComponent={
                <SelectWithApply
                  selectOptions={Object.keys(state.adaptLevels)}
                  value={state.gradeLevelGroup}
                  dropdownFunction={handleChange}
                  clickFunction={handleGrade}
                  queryVariables={queryVariables}
                  state={state}
                  setState={setState}
                  type="gradesPageLevelGroup"
                  disable={state.disableGradesAssignment}
                  optionalSelect={
                    <Select
                      options={state.adaptLevels[state.gradeLevelGroup]}
                      margin={{
                        right: "medium",
                        left: "medium",
                        vertical: "xsmall",
                      }}
                      value={state.gradeLevelName}
                      onChange={({ option }) =>
                        handleChange(
                          "gradesPageLevelName",
                          option,
                          state,
                          setState
                        )
                      }
                    />
                  }
                  renderSelect={state.gradeLevelGroup}
                  queryVariables={queryVariables}
                  />
              }
              downloadComponent={
                <DataToCSV
                  data = {state.gradesPageView}
                  filename={state.gradeLevelGroup + "-" + state.gradeLevelName + "-views.csv"}
                  headers = {[
                    {label: 'Student', key: "_id.student"},
                    {label: "Points Possible", key: 'levelpoints'},
                    {label: "Points Earned", key: 'Sum'},
                    {label: "Percent Score", key: "score"}
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
