import { Grid, Box, Spinner } from "grommet";
import AllAdaptAssignmentsChart from "./allAdaptAssignmentsChart.js";
import infoText from "./allInfoText.js";
import { getFilteredChartData } from "../functions/dataFetchingFunctions.js";
import { getIndividualAssignmentSubmissions } from "../functions/adaptDataQueries.js";
import DataTable from "./dataTable.js";
import DataToCSV from "./dataToCSV.js";
import {
  changeBarXAxis,
  sortData,
  changeBinVal,
} from "../functions/filterFunctions.js";
import HeaderGrid from "./headerGrid.js";
import {
  reactGrids,
  reactRows,
  getStudentChartFilters,
  generateHeaders,
} from "../functions/helperFunctions.js";
import InfoBox from "./infoBox.js";
import LayeredComponent from "./layeredComponent.js";
import {
  getPageViewConfig,
  getAssignmentSubmissionsConfig,
} from "../functions/ltDataQueries.js";
import {
  getStudentTextbookEngagementData,
  studentChartAxiosCall,
} from "../functions/ltDataQueries-individual.js";
import StudentChart from "./studentChart.js";
import StudentTextbookEngagementChart from "./studentTextbookEngagementChart.js";
import PageViewsChart from "./pageViewsChart.js";

// Key Components:
// Header: Course Selection, Search Student, Legend
// Datatable: state.studentData
// StudentChart: state.studentChart --> automatically filters out non-enrolled students
// (ADAPT) AllAdaptAssignmentsChart: state.allAdaptAssignments; state.studentAssignments
// (LibreText) StudentTextbookEngagementChart: state.pageViews; state.textbookEngagementData

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
        height={
          state.ltCourse && state.adaptCourse
            ? "3230px"
            : state.ltCourse && !state.adaptCourse
            ? "1900px"
            : "2500px"
        }
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
            {state.studentData && queryVariables.click && state.display && (
              <LayeredComponent
                gridArea="plots"
                queryVariables={queryVariables}
                title="Interaction Distribution"
                selectedInfoText={infoText.studentMetricsBarChart}
                filterLabel="Bar Chart Display Filters"
                state={state}
                setState={setState}
                component={
                  <StudentChart
                    hasAdapt={state.hasAdapt}
                    showColumns={state.tableColumns}
                    allData={state.studentData.filter(
                      (o) => o.isEnrolled === true || o.isEnrolled === "N/A"
                    )}
                    tab={state.tab}
                    data={state.studentChart}
                    xaxisLabel={state.barXAxisLabel}
                    width="100%"
                    displayMode={state.displayMode}
                    ltCourse={state.ltCourse}
                    accessibilityMode={state.accessibilityMode}
                  />
                }
                data={state.studentChart}
                label={state.barXAxisLabel}
                loading={infoText.loadingMessage}
                filterOptions={getStudentChartFilters(state)}
                filterSelectLabel="Data:"
                filterFunction={changeBarXAxis}
                clickFunction={getFilteredChartData}
                clickFunctionAttributes={{
                  aggregateFunction: studentChartAxiosCall,
                  individualFunction: null,
                  key: "studentChart",
                  isConfig: false,
                  individual: null,
                }}
                type="barXAxisLabel"
                axisType="barXAxisLabel"
                downloadComponent={
                  <DataToCSV
                    data={state.studentChart}
                    filename={state.barXAxisLabel + "-studentChart.csv"}
                    headers={[
                      { label: state.barXAxisLabel, key: "_id" },
                      { label: "Students", key: "students" },
                      { label: "Count", key: "count" },
                    ]}
                    separator="; "
                  />
                }
              />
            )}
            {queryVariables.click &&
              state.allStudents &&
              (state.hasAdapt || state.adaptCourse) && (
                <LayeredComponent
                  gridArea="timeline"
                  queryVariables={queryVariables}
                  title="Student ADAPT Scores"
                  selectedInfoText={infoText.allAdaptAssignmentsChart}
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
                      allData={state.allAdaptAssignments.filter(
                        (o) => o.due !== "Not Found"
                      )}
                      student={state.student}
                      accessibilityMode={state.accessibilityMode}
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
                      data={
                        state.student && state.studentAssignments
                          ? state.studentAssignments.filter(
                              (o) => o.due !== "Not Found"
                            )
                          : state.allAdaptAssignments.filter(
                              (o) => o.due !== "Not Found"
                            )
                      }
                      filename={
                        state.student
                          ? state.student + "-assignment-views.csv"
                          : "all-assignment-views.csv"
                      }
                      headers={
                        state.student
                          ? [
                              {
                                label: "Level/Assignment",
                                key: "_id.level_name",
                              },
                              { label: "Due Date", key: "due" },
                              { label: "Submitted", key: "submitted" },
                              { label: "Percent Score", key: "percent" },
                            ]
                          : [
                              { label: "Level/Assignment", key: "_id" },
                              { label: "Due Date", key: "due" },
                              {
                                label: "Average Percent Score",
                                key: "percent",
                              },
                            ]
                      }
                    />
                  }
                />
              )}
            {state.pageData &&
              queryVariables.click &&
              state.display &&
              state.ltCourse && (
                <LayeredComponent
                  gridArea="studentTextbookEngagement"
                  queryVariables={queryVariables}
                  title="Textbook Activity"
                  selectedInfoText={
                    infoText.aggregatePageViewsChart1 +
                    infoText.studentTextbookEngagement +
                    state.courseName +
                    infoText.aggregatePageViewsChart2
                  }
                  filterLabel="Bar Chart Display Filters"
                  state={state}
                  setState={setState}
                  loading={infoText.loadingMessage}
                  component={
                    <StudentTextbookEngagementChart
                      data={state.aggregateTextbookEngagement}
                      individualData={state.textbookEngagementData}
                      type="aggregateStudent"
                      xaxis="_id"
                      yaxis="count"
                      binLabel={state.individualStudentBinLabel}
                      width={980}
                      student={state.studentForTextbookEngagement}
                      accessibilityMode={state.accessibilityMode}
                    />
                  }
                  data={state.aggregateTextbookEngagement}
                  label={state.individualStudentBinLabel}
                  filterOptions={["Day", "Week", "2 Weeks", "Month"]}
                  filterSelectLabel="Unit of Time:"
                  filterFunction={changeBinVal}
                  clickFunction={getFilteredChartData}
                  clickFunctionAttributes={{
                    aggregateFunction: getPageViewConfig,
                    individualFunction: getStudentTextbookEngagementData,
                    key: "aggregateTextbookEngagement",
                    isConfig: true,
                    individual: state.student,
                    bin: state.individualStudentBin,
                    unit: state.individualStudentUnit,
                  }}
                  type="textbookEngagement"
                  axisType="binLabel"
                  downloadComponent={
                    <DataToCSV
                      data={
                        state.textbookEngagementData
                          ? state.textbookEngagementData
                          : state.pageViews
                      }
                      filename={
                        state.textbookEngagementData
                          ? state.student + "-individual-page-views.csv"
                          : "aggregate-page-views.csv"
                      }
                      headers={[
                        { label: "Date", key: "dateString" },
                        { label: "Number of Views", key: "count" },
                        {
                          label: "Number of Unique Pages",
                          key: "uniquePageCount",
                        },
                      ]}
                    />
                  }
                />
              )}
            {state.aggregateAssignmentViews &&
              (state.hasAdapt || state.adaptCourse) && (
                <LayeredComponent
                  gridArea="studentAdaptEngagement"
                  queryVariables={queryVariables}
                  disable={state.disableAssignment}
                  loading={infoText.loadingMessage}
                  title="ADAPT Engagement"
                  selectedInfoText={infoText.individualAssignmentsChart}
                  filterLabel="Bar Chart Display Filters"
                  state={state}
                  setState={setState}
                  component={
                    <PageViewsChart
                      data={state.aggregateAdaptEngagement}
                      individualData={state.individualAssignmentSubmissions}
                      state={state}
                      type="individualStudent"
                      xaxis="_id"
                      yaxis="count"
                      binLabel={state.individualAdaptEngagementBinLabel}
                      width={980}
                      height={500}
                      accessibilityMode={state.accessibilityMode}
                    />
                  }
                  data={state.aggregateAdaptEngagement}
                  label={state.individualAdaptEngagementBinLabel}
                  filterOptions={["Day", "Week", "2 Weeks", "Month"]}
                  filterSelectLabel="Unit of Time:"
                  filterFunction={changeBinVal}
                  clickFunction={getFilteredChartData}
                  clickFunctionAttributes={{
                    aggregateFunction: getAssignmentSubmissionsConfig,
                    individualFunction: getIndividualAssignmentSubmissions,
                    key: "aggregateAdaptEngagement",
                    isConfig: true,
                    individual: state.student,
                    bin: state.individualAdaptEngagmentBin,
                    unit: state.individualAdaptEngagementUnit,
                  }}
                  type="adaptEngagement"
                  axisType="individualAdaptEngagementBinLabel"
                  topMargin="large"
                  downloadComponent={
                    <DataToCSV
                      data={
                        state.individualAssignmentSubmissions
                          ? state.individualAssignmentSubmissions
                          : state.aggregateAdaptEngagement
                      }
                      filename={
                        state.individualAssignmentSubmissions
                          ? state.student + "-submissions.csv"
                          : "aggregate-assignment-submissions.csv"
                      }
                      headers={
                        state.individualAssignmentSubmissions
                          ? [
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
                            ]
                      }
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
