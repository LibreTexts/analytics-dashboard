import HeaderGrid from "./headerGrid.js";
import { Grid, Box, Spinner } from "grommet";
import SelectWithApply from "./selectWithApply.js";
import DataTable from "./dataTable.js";
import LayeredComponent from "./layeredComponent.js";
import PageViewsChart from "./pageViewsChart.js";
import { infoText } from "./allInfoText.js";
import DataToCSV from "./dataToCSV.js";
import {
  handleIndividual,
  changeBinVal,
  handleChange,
  pageViewCharts,
} from "./filterFunctions.js";
import InfoBox from "./infoBox.js";

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
        rows={["2/3", "2/3", "1/3"]}
        columns={["15%", "79%"]}
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
                title="Aggregate Page Views"
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
                  <PageViewsChart
                    data={state.pageViews}
                    type="aggregate"
                    xaxis="_id"
                    yaxis="count"
                    binLabel={state.binLabel}
                    width={980}
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
                downloadComponent={
                  <DataToCSV
                    data = {state.pageViews}
                    filename="aggregate-page-views.csv"
                    headers = {[
                      {label: 'Date', key: "dateString"},
                      {label: "Number of Views", key: 'count'},
                      {label: "Unique Pages", key: "uniquePages"}
                    ]}
                  />
                }
              />
            )}
            {state.pageData &&
              queryVariables.click &&
              state.display &&
              state.allPages && (
                <LayeredComponent
                  gridArea="timeline"
                  queryVariables={queryVariables}
                  disable={state.disablePage}
                  loading={infoText.loadingMessage}
                  title="Individual Page Metrics"
                  infoText={infoText.individualPageViewsChart}
                  filterLabel="Bar Chart Display Filters"
                  state={state}
                  setState={setState}
                  component={
                    <PageViewsChart
                      data={state.individualPageViews}
                      type="individual"
                      xaxis="_id"
                      yaxis="count"
                      binLabel={state.individualPageBinLabel}
                      width={980}
                      height={500}
                    />
                  }
                  data={state.individualPageViews}
                  label={state.individualPageBinLabel}
                  filterOptions={["Day", "Week", "2 Weeks", "Month"]}
                  filterSelectLabel="Unit of Time:"
                  filterFunction={changeBinVal}
                  clickFunction={pageViewCharts}
                  type="individualPageViews"
                  axisType="individualPageBinLabel"
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
                      data = {state.individualPageViews}
                      filename={state.page + "-views.csv"}
                      headers = {[
                        {label: 'Date', key: "dateString"},
                        {label: "Number of Views", key: 'count'},
                        {label: "Number of Unique Students", key: "uniqueStudents.length"}
                      // {label: "Unique Students", key: "uniqueStudents"}
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
