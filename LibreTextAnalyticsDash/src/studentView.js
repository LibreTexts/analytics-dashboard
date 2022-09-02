import HeaderGrid from "./headerGrid.js";
import { Grid, Box, Spinner } from "grommet";
import SelectWithApply from "./selectWithApply.js";
import AllAdaptAssignmentsChart from "./allAdaptAssignmentsChart.js";
import DataTable from "./dataTable.js";
import LayeredComponent from "./layeredComponent.js";
import StudentChart from "./studentChart.js";
import PageViewsChart from "./pageViewsChart.js";
import StudentTextbookEngagementChart from "./studentTextbookEngagementChart.js";
import { infoText } from "./allInfoText.js";
import { getStudentChartData, getStudentTextbookEngagementData } from "./ltDataQueries-individual.js";
import DataToCSV from "./dataToCSV.js";
import {
  changeBarXAxis,
  sortData,
  changeBinVal
} from "./filterFunctions.js";
import {
  handleIndividual,
  pageViewCharts
} from "./dataFetchingFunctions.js";
import { handleChange } from "./handleChangeFunction.js";
import {
  reactGrids,
  reactRows,
  getStudentChartFilters,
  generateHeaders
} from "./helperFunctions.js";
import InfoBox from "./infoBox.js";

export default function StudentView({ state, setState, queryVariables }) {
  return (
    <>
      {state.studentData && (
        <HeaderGrid
          state={state}
          setState={setState}
          queryVariables={queryVariables}
          data={state.studentData}
        />
      )}
      <Grid
        height={state.ltCourse && state.adaptCourse ? "2525px" : "2000px"}
        rows={reactRows(state)}
        columns={["19%", "79%"]}
        gap="small"
        areas={reactGrids(state)}
        flex={true}
        responsive={true}
        overflow="hidden"
        justifyContent="center"
      >
        {state.studentData && state.studentData.length > 0 && (
          <>
            {state.disable && (!state.studentData || !state.display) && (
              <Box gridArea="table" background="light-2">
                <InfoBox
                  infoText={infoText.loadingMessage}
                  showIcon={true}
                  icon={<Spinner />}
                />
              </Box>
            )}
            {state.studentData && queryVariables.click && state.display && (
              <Box
                gridArea="table"
                border={true}
                overflowY="scroll"
                responsive={true}
                width="100%"
              >
                {
                  // <Box direction="row">
                  //   <Box width="250px" height="85px">
                  //     <Select
                  //       options={['No Recent LibreText Activity', 'No Recent Adapt Activity', 'Low Adapt Performance']}
                  //       margin={{right: "medium", left: "medium"}}
                  //       value={activityFilter}
                  //       onChange={({ option }) => changeActivityFilter(option, studentData)}
                  //     />
                  //   </Box>
                  //   <Button primary label="Apply" onClick={() => {}}/>
                  // </Box>
                }
                <DataTable
                  tab={state.tab}
                  data={state.studentData}
                  hasAdapt={state.hasAdapt}
                  showColumns={state.tableColumns}
                  activityFilter={state.activityFilter}
                  showNonStudents={state.showNonEnrolledStudents}
                  ltCourse={state.ltCourse}
                  adaptCourse={state.adaptCourse}
                  displayMode={state.displayMode}
                  student={state.student}
                  disableStudent={state.disableStudent}
                />
              </Box>
            )}
            {state.studentData &&
              queryVariables.click &&
              state.display && (
                <LayeredComponent
                  gridArea="plots"
                  queryVariables={queryVariables}
                  title="Student Metrics"
                  infoText={infoText.studentMetricsBarChart}
                  filterLabel="Bar Chart Display Filters"
                  state={state}
                  setState={setState}
                  component={
                    <StudentChart
                      hasAdapt={state.hasAdapt}
                      showColumns={state.tableColumns}
                      allData={state.studentData.filter(
                        (o) => (o.isEnrolled === true || o.isEnrolled === "N/A")
                      )}
                      tab={state.tab}
                      data={state.studentChart}
                      xaxisLabel={state.barXAxisLabel}
                      width="100%"
                      displayMode={state.displayMode}
                      ltCourse={state.ltCourse}
                    />
                  }
                  data={state.studentChart}
                  label={state.barXAxisLabel}
                  loading={infoText.loadingMessage}
                  filterOptions={getStudentChartFilters(state)}
                  filterSelectLabel="Data:"
                  filterFunction={changeBarXAxis}
                  clickFunction={getStudentChartData}
                  type="barXAxisLabel"
                  axisType="barXAxisLabel"
                />
              )}
            {queryVariables.click &&
              state.allStudents &&
              (state.hasAdapt || state.adaptCourse) && (
                <LayeredComponent
                  gridArea="timeline"
                  queryVariables={queryVariables}
                  title="Individual Student Adapt Assignments"
                  infoText="This graph shows the percent earned on each assignment for one student."
                  loading={infoText.loadingMessage}
                  disable={state.disableStudent}
                  filterLabel="Bar Chart Display Filters"
                  state={state}
                  setState={setState}
                  csvName={state.student + "-adapt-assignments.csv"}
                  csvHeaders={generateHeaders("studentAssignments")}
                  component={
                    <AllAdaptAssignmentsChart
                      tab={state.tab}
                      xaxis="level_name"
                      xaxisLabel="Assignment"
                      yaxis="percent"
                      yaxisLabel="Percent Earned"
                      data={state.studentAssignments}
                      state={state}
                      allData={state.allAdaptAssignments}
                    />
                  }
                  data={state.allAdaptAssignments}
                  label={state.individualAssignmentSortLabel}
                  filterOptions={["Alphabetically", "By Due Date"]}
                  filterSelectLabel="Sort:"
                  filterFunction={sortData}
                  clickFunction={sortData}
                  type="studentAssignments"
                  downloadComponent={
                    <DataToCSV
                      data = {state.student ? state.studentAssignments : state.allAdaptAssignments}
                      filename={state.student ? state.student + "-assignment-views.csv" : "all-assignment-views.csv"}
                      headers = {state.student ?
                      [
                        {label: 'Level/Assignment', key: "level_name"},
                        {label: "Due Date", key: 'due'},
                        {label: "Submitted", key: 'submitted'},
                        {label: "Points Possible", key: 'levelpoints'},
                        {label: "Points Earned", key: 'Sum'},
                        {label: "Percent Score", key: 'percent'},
                      ] :
                      [
                        {label: 'Level/Assignment', key: "_id"},
                        {label: "Due Date", key: 'due'},
                        {label: "Average Percent Score", key: 'percent'},
                      ]
                    }
                    />
                  }
                />
              )}
              {state.pageData && queryVariables.click && state.display && (
                <LayeredComponent
                  gridArea="studentTextbookEngagement"
                  queryVariables={queryVariables}
                  title="Aggregate Page Views With Individual Student Activity"
                  infoText={
                    infoText.aggregatePageViewsChart1 +
                    state.courseName +
                    infoText.aggregatePageViewsChart2
                  }
                  filterLabel="Bar Chart Display Filters"
                  state={state}
                  setState={setState}
                  loading={infoText.loadingMessage}
                  component={
                    <StudentTextbookEngagementChart
                      data={state.pageViews}
                      individualData={state.textbookEngagementData}
                      type="aggregateStudent"
                      xaxis="_id"
                      yaxis="count"
                      binLabel={state.binLabel}
                      width={980}
                      student={state.studentForTextbookEngagement}
                    />
                  }
                  data={state.pageViews}
                  label={state.individualStudentBinLabel}
                  filterOptions={["Day", "Week", "2 Weeks", "Month"]}
                  filterSelectLabel="Unit of Time:"
                  filterFunction={changeBinVal}
                  clickFunction={pageViewCharts}
                  type="textbookEngagement"
                  axisType="binLabel"
                  downloadComponent={
                    <DataToCSV
                      data={state.textbookEngagementData ? state.textbookEngagementData : state.pageViews}
                      filename={state.textbookEngagementData ? state.studentForTextbookEngagement+"-individual-page-views.csv" : "aggregate-page-views.csv"}
                      headers={[
                        { label: "Date", key: "dateString" },
                        { label: "Number of Views", key: "count" },
                        { label: "Number of Unique Pages", key: "uniquePageCount" },
                      ]}
                    />
                  }
                />
              )}
          </>
        )}
      </Grid>
    </>
  );
}
