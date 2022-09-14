import { Grid, Box, Spinner } from "grommet";
import infoText from "./allInfoText.js";
import { handleIndividual, pageViewCharts } from "../functions/dataFetchingFunctions.js";
import DataToCSV from "./dataToCSV.js";
import DataTable from "./dataTable.js";
import { changeBinVal } from "../functions/filterFunctions.js";
import { handleChange } from "../functions/handleChangeFunction.js";
import HeaderGrid from "./headerGrid.js";
import InfoBox from "./infoBox.js";
import { getIndividualChapterData } from "../functions/ltDataQueries-individual.js";
import LayeredComponent from "./layeredComponent.js";
import PageViewsChart from "./pageViewsChart.js";
import SelectWithApply from "./selectWithApply.js";
import TextbookChapterChart from "./textbookChapterChart.js";

// Key Components:
// Header: Course Selection, Legend
// Datatable: state.pageData
// PageViewsChart: state.pageViews, state.individualPageViews
// TextbookChapterChart: state.aggregateChapterData, state.individualChapterData

//this view will only show up in courses that have LibreText data
export default function TextbookView({ state, setState, queryVariables }) {
  return (
    <>
      {state.pageData && (
        <HeaderGrid
          state={state}
          setState={setState}
          queryVariables={queryVariables}
          data={state.pageData}
        />
      )}
      <Grid
        fill={true}
        height="2250px"
        rows={["24%", "33%", "45%"]}
        columns={["19%", "79%"]}
        gap="small"
        areas={[
          { name: "table", start: [0, 0], end: [1, 0] },
          { name: "horizontal-chart", start: [0, 1], end: [1, 1] },
          { name: "timeline", start: [0, 2], end: [1, 2] },
        ]}
        flex={true}
        responsive={true}
        overflow="hidden"
        justifyContent="center"
      >
        {state.pageData && state.pageData.length > 0 && (
          <>
            {state.disable && (!state.pageData || !state.display) && (
              <Box gridArea="table" background="light-2">
                <InfoBox
                  infoText={infoText.loadingMessage}
                  showIcon={true}
                  icon={<Spinner />}
                />
              </Box>
            )}
            {state.pageData && queryVariables.click && state.display && (
              <Box gridArea="table" border={true}>
                <DataTable tab={state.tab} data={state.pageData} />
              </Box>
            )}
            {state.pageData && queryVariables.click && state.display && (
              <LayeredComponent
                gridArea="horizontal-chart"
                queryVariables={queryVariables}
                title="Specific Page Activity"
                selectedInfoText={
                  infoText.aggregatePageViewsChart1 +
                  infoText.pageActivity +
                  state.courseName +
                  infoText.aggregatePageViewsChart2
                }
                filterLabel="Bar Chart Display Filters"
                state={state}
                setState={setState}
                loading={infoText.loadingMessage}
                component={
                  <PageViewsChart
                    data={state.pageViews}
                    individualData={state.individualPageViews}
                    type="aggregate"
                    xaxis="_id"
                    yaxis="count"
                    binLabel={state.binLabel}
                    width={980}
                    page={state.page}
                  />
                }
                data={state.pageViews}
                label={state.binLabel}
                filterOptions={["Day", "Week", "2 Weeks", "Month"]}
                filterSelectLabel="Unit of Time:"
                filterFunction={changeBinVal}
                clickFunction={pageViewCharts}
                type="aggregatePageViews"
                axisType="binLabel"
                selectComponent={
                  <SelectWithApply
                    selectOptions={state.allPages}
                    value={state.page}
                    dropdownFunction={handleChange}
                    clickFunction={handleIndividual}
                    state={state}
                    setState={setState}
                    type="page"
                    disable={state.disablePage}
                    queryVariables={queryVariables}
                  />
                }
                downloadComponent={
                  <DataToCSV
                    data={
                      state.individualPageViews
                        ? state.individualPageViews
                        : state.pageViews
                    }
                    filename={
                      state.individualPageViews
                        ? state.page + "-individual-page-views.csv"
                        : "aggregate-page-views.csv"
                    }
                    headers={[
                      { label: "Date", key: "dateString" },
                      { label: "Number of Views", key: "count" },
                      {
                        label: state.individualPageViews
                          ? "Number of Unique Students"
                          : "Number of Unique Pages",
                        key: state.individualPageViews
                          ? "uniqueStudentCount"
                          : "uniquePageCount",
                      },
                    ]}
                  />
                }
              />
            )}
            {state.pageData &&
              queryVariables.click &&
              state.display &&
              state.allChapters && (
                <LayeredComponent
                  gridArea="timeline"
                  queryVariables={queryVariables}
                  disable={state.disableChapterChart}
                  loading={infoText.loadingMessage}
                  title="Textbook Chapter Metrics"
                  selectedInfoText={infoText.textbookChapterChart}
                  filterLabel="Bar Chart Display Filters"
                  state={state}
                  setState={setState}
                  component={
                    <TextbookChapterChart
                      allData={state.aggregateChapterData}
                      data={state.individualChapterData}
                      type="individual"
                      binLabel={state.individualPageBinLabel}
                      width={980}
                      height={500}
                      state={state}
                    />
                  }
                  data={state.aggregateChapterData}
                  label={state.individualPageBinLabel}
                  filterOptions={["Day", "Week", "2 Weeks", "Month"]}
                  filterSelectLabel="Unit of Time:"
                  filterFunction={changeBinVal}
                  clickFunction={pageViewCharts}
                  type="chapterData"
                  axisType="individualPageBinLabel"
                  selectComponent={
                    <SelectWithApply
                      selectOptions={state.allStudents}
                      value={state.studentForChapterChart}
                      dropdownFunction={handleChange}
                      clickFunction={getIndividualChapterData}
                      state={state}
                      setState={setState}
                      type="studentForChapterChart"
                      disable={state.disableChapterChart}
                      queryVariables={queryVariables}
                    />
                  }
                  downloadComponent={
                    <DataToCSV
                      data={
                        state.individualChapterData
                          ? state.individualChapterData
                          : state.aggregateChapterData
                      }
                      filename={
                        state.individualChapterData
                          ? state.studentForChapterChart +
                            "-individual-chapter-views.csv"
                          : "aggregate-chapter-views.csv"
                      }
                      headers={[
                        { label: "Chapter", key: "_id" },
                        { label: "Number of Views", key: "viewCount" },
                        {
                          label: "Number of Unique Pages",
                          key: "uniqueViewCount",
                        },
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
