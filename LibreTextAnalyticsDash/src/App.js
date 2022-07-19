import React from "react";
import { useEffect, useState, useRef } from "react";
import "react-table-6/react-table.css";
import {
  Grommet,
  Heading,
  Box,
  Button,
  CheckBox,
  CheckBoxGroup,
  Collapsible,
  DateInput,
  Grid,
  Layer,
  Notification,
  Select,
  Spinner,
  Tabs,
  Tab,
  Text,
} from "grommet";
import { Close, Filter } from "grommet-icons";
import "./index.css";
import StudentChart from "./studentChart.js";
import GradesPageView from "./gradesPageViewsChart.js"
import PageViews from "./totalPageViewsChart.js";
import TitleText from "./titleWithInfo.js";
import DataTable from "./data_table.js";
import AdaptTable from "./adaptTable.js";
import InfoBox from "./collapsible_info_box.js";
import MultiSelect from "./multiSelect.js";
import LayeredComponent from "./componentWithLayer.js";
import SelectWithApply from "./selectWithApply.js";
import {
  getAggregateData,
  getObjectList,
  getStudentChartData,
  getPageViewData,
  getIndividualPageViewData,
  getChapters,
  getTagInfo,
} from "./ltDataQueries.js";
import {
  getAdaptLevels,
  getAdaptData,
  getStudentAssignments,
} from "./adaptDataQueries.js";
import {
  handleClick,
  handleFilterClick,
  handleIndividual,
  handleGrade,
  changeBarXAxis,
  changeBarYAxis,
  changeBinVal,
  filterDates,
  handleChange,
  handleTabs,
  clearDates,
  menuCollapsible,
  clearPath,
  filterReset,
  applyReset,
  changeColumns,
  changeActivityFilter,
  pageViewCharts,
  changePropValue,
  reactGrids,
  reactRows
} from "./filterFunctions.js";
import { infoText } from "./allInfoText.js";
import BarGraph from "./bargraph.js";
import axios from "axios";
import useResizeObserver from "@react-hook/resize-observer";

const theme = {
  global: {
    colors: {
      brand: "#0047BA",
    },
    font: {
      family: "Roboto",
      size: "18px",
      height: "20px",
    },
  },
};

const useSize = (target) => {
  const [size, setSize] = React.useState();
  React.useLayoutEffect(() => {
    //if (target.current && target.current.clientHeight !== null) {
    //setSize(target.current.getBoundingClientRect())
    //}
  }, [target]);
  useResizeObserver(target, (entry) => setSize(entry.contentRect));
  return size;
};

function App() {
  const [state, setState] = useState({
    start: null,
    end: null,
    showFilter: false,
    tab: "student",
    disable: false,
    disableCourse: false,
    disablePage: false,
    disableStudent: false,
    disableAssignment: false,
    disableGradesAssignment: false,
    course: null,
    courseId: null,
    //click: false,
    allPages: null,
    totalPageViews: null,
    individualPageViews: null,
    individualAssignmentViews: null,
    gradesPageView: null,
    studentAssignments: null,
    studentDates: null,
    student: null,
    studentdata: null,
    pageResult: null,
    page: null,
    pageId: null,
    barXAxis: "dateCount",
    barYAxis: "objectCount",
    barXAxisLabel: "Unique Interaction Days",
    barYAxisLabel: "Unique Pages Accessed",
    index: 0,
    display: true,
    bin: 1,
    binLabel: "Day",
    sliderValue: 10,
    numBinsGrades: 10,
    unit: "day",
    allData: {},
    pathLength: 0,
    allChapters: null,
    courseLevel: null,
    chosenPath: null,
    dataPath: null,
    openFilter: false,
    reset: false,
    resetPath: false,
    adaptData: null,
    tagData: null,
    tagTypes: [],
    tagType: null,
    tagTitle: null,
    realCourses: null,
    courseName: null,
    allStudents: null,
    adaptLevels: {},
    levelGroup: null,
    levelName: null,
    gradeLevelGroup: null,
    gradeLevelName: null,
    hasAdapt: false,
    showInfoBox: true,
    showTableFilters: false,
    showCheckboxes: false,
    filterInfoBox: true,
    //count: 0,
    activityFilter: "",
    tableColumns: {
      "All": true,
      "LT Unique Pages Accessed": true,
      "LT Total Page Views": true,
      "LT Most Recent Page Load": true,
      "LT Unique Interaction Days": true,
    },
    gridHeight: "small",
    homepage: "/analytics/api",
    showNonEnrolledStudents: true,
    ltCourse: false,
    adaptCourse: false,
    displayMode: false
  })

   const [click, setClick] = useState(false);
   const [realCourses, setRealCourses] = useState(null);
   const [count, setCount] = useState(0);

  var queryVariables = {
    click: click,
    setClick: setClick,
    count: count,
    setCount: setCount,
    realCourses: realCourses,
    setRealCourses: setRealCourses
  }

  useEffect(() => {
    let realCourses = {};
    axios(state.homepage+"/realcourses").then((response) => {
      let x = {};
      response.data.forEach((course) => {
        x[course.course] = {courseId: course._id, ltCourse: course.ltCourse, adaptCourse: course.adaptCourse};
      });
      realCourses = x;
      setRealCourses(realCourses);
    });

    // //let ltCourses = JSON.parse(JSON.stringify(realCourses));
    // axios(state.homepage+"/adaptcourses").then((response) => {
    //   Object.keys(response.data).forEach((course) => {
    //     realCourses[course] = {courseId: response.data[course], ltCourse: false, adaptCourse: true}
    //   })
    //   setRealCourses(realCourses)
    // })
  }, []);

  return (
    <>
    <Grommet theme={theme} full fill={true} overflowY="scroll">
      <Tabs
        justify="start"
        margin="medium"
        activeIndex={state.index}
        onActive={(value) => handleTabs(value, state, setState, queryVariables)}
        style={{ overflowY: "scroll" }}
      >
        {click && (
          <Tab title="By Student" overflowY="scroll">
            {state.disableCourse && !state.studentData && (
              <InfoBox
                infoText={infoText.loadingMessage}
                showIcon={true}
                icon={<Spinner />}
              />
            )}
            {state.studentData && state.studentData && state.studentData.length < 1 && (
                <Notification
                  title={infoText.noDataMessage}
                  onClose={() => {}}
                />
              )}
            <Grommet theme={theme} full fill={true} overflowY="scroll">
              <Box fill={true}>
                <Box direction="row">
                  {state.studentData && (
                    <Box>
                      <Box
                        width="100px"
                        margin={{ top: "medium", left: "xsmall" }}
                      >
                        <Button
                          label="Choose Columns"
                          secondary
                          color="#0047BA"
                          size="small"
                          onClick={() => setState({...state, showCheckboxes: !state.showCheckboxes})}
                        />
                      </Box>
                      {state.showCheckboxes && (
                        <CheckBoxGroup
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
                  <Grid
                    fill={true}
                    rows={reactRows(state)}
                    columns={["15%", "79%"]}
                    gap="small"
                    areas={reactGrids(state)}
                    flex={true}
                    responsive={true}
                    margin="medium"
                    overflowY="scroll"
                  >
                    {
                      // {tagTypes &&
                      //   <Select value={tagType} options={Object.keys(tagTypes)} onChange={({option}) => setTagType(option)}/>
                      // }
                      //   {tagType && tagTypes[tagType] &&
                      //     <Select value={tagTitle} options={tagTypes[tagType]} onChange={({option}) => setTagTitle(option)}/>
                      //   }
                    }
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
                        {state.studentData && click && state.display && (
                          <Box
                            gridArea="table"
                            border={true}
                            overflowY="scroll"
                            responsive={true}
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
                            />
                          </Box>
                        )}
                        {state.studentData && click && state.display && state.ltCourse && (
                          <LayeredComponent
                            gridArea="plots"
                            title="Student Metrics Bar Chart"
                            infoText={infoText.studentMetricsBarChart}
                            filterLabel="Bar Chart Display Filters"
                            state={state}
                            setState={setState}
                            component={
                              <StudentChart
                                hasAdapt={state.hasAdapt}
                                showColumns={state.tableColumns}
                                allData={state.studentData.filter(
                                  (o) => o.isEnrolled === true
                                )}
                                tab={state.tab}
                                data={state.studentChart}
                                xaxis="_id"
                                xaxisLabel={state.barXAxisLabel}
                                yaxis={state.barYAxis}
                                yaxisLabel={state.barYAxisLabel}
                                width={1000}
                                displayMode={state.displayMode}
                              />
                            }
                            data={state.studentChart}
                            label={state.barXAxisLabel}
                            loading={infoText.loadingMessage}
                            filterOptions={[
                              "Unique Pages Accessed",
                              "Unique Interaction Days",
                              "Most Recent Page Load",
                            ]}
                            filterSelectLabel="Data:"
                            filterFunction={state.changeBarXAxis}
                            clickFunction={state.getStudentChartData}
                          />
                        )}
                        {state.allStudents && (state.hasAdapt || state.adaptCourse) && (
                          <LayeredComponent
                            gridArea="timeline"
                            title="Individual Student Adapt Assignments"
                            infoText="This graph shows the percent earned on each assignment for one student."
                            loading={infoText.loadingMessage}
                            disable={state.disableStudent}
                            filterLabel="Bar Chart Display Filters"
                            state={state}
                            setState={setState}
                            component={
                              <BarGraph
                                tab={state.tab}
                                xaxis="level_name"
                                xaxisLabel="Assignment"
                                yaxis="percent"
                                yaxisLabel="Percent Earned"
                                data={state.studentAssignments}
                                state={state}
                              />
                            }
                            data={state.studentAssignments}
                            label={state.binLabel}
                            filterOptions={["Day", "Week", "2 Weeks", "Month"]}
                            filterSelectLabel="Unit of Time:"
                            filterFunction={changeBinVal}
                            clickFunction={state.pageViewCharts}
                            selectComponent={<SelectWithApply
                                selectOptions={state.allStudents}
                                value={state.student}
                                disable={state.disableStudent}
                                dropdownFunction={handleChange}
                                clickFunction={handleIndividual}
                                state={state}
                                setState={setState}
                                type="studentAssignments"
                              />}
                          />
                        )}
                          </>
                    )}
                  </Grid>
                </Box>
              </Box>
            </Grommet>
          </Tab>
        )}
        {click && state.ltCourse && (
          <Tab title="By Page" overflowY="scroll">
            {state.disableCourse && !state.pageData && (
              <InfoBox
                infoText={infoText.loadingMessage}
                showIcon={true}
                icon={<Spinner />}
              />
            )}
            {state.pageData && state.pageData.length < 1 && (
              <Notification title={infoText.noDataMessage} onClose={() => {}} />
            )}
            <Grommet theme={theme} full fill="true" overflowY="scroll">
              <Box fill={true}>
                <Box direction="row">
                  <Grid
                    fill={true}
                    rows={["2/3", "2/3", "auto"]}
                    columns={["15%", "79%"]}
                    gap="small"
                    areas={[
                      { name: "table", start: [0, 0], end: [1, 0] },
                      { name: "horizontal-chart", start: [0, 1], end: [1, 1] },
                      { name: "timeline", start: [0, 2], end: [1, 2] }
                    ]}
                    flex={true}
                    responsive={true}
                    margin="medium"
                    overflowY="scroll"
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
                        {state.pageData && click && state.display && (
                          <Box gridArea="table" border={true}>
                            <DataTable tab={state.tab} data={state.pageData} />
                          </Box>
                        )}
                        {state.pageData && click && state.display && (
                          <LayeredComponent
                            gridArea="horizontal-chart"
                            title="Aggregate Page Views Bar Chart"
                            infoText={
                              infoText.aggregatePageViewsChart1 +
                              state.courseName +
                              infoText.aggregatePageViewsChart2
                            }
                            filterLabel="Bar Chart Display Filters"
                            state={state}
                            setState={setState}
                            component={
                              <PageViews
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
                          />
                        )}
                        {state.pageData && click && state.display && state.allPages && (
                          <LayeredComponent
                            gridArea="timeline"
                            disable={state.disablePage}
                            loading={infoText.loadingMessage}
                            title="Individual Page Metrics Bar Chart"
                            infoText={infoText.individualPageViewsChart}
                            filterLabel="Bar Chart Display Filters"
                            state={state}
                            setState={setState}
                            component={
                              <PageViews
                                 data={state.individualPageViews}
                                 type="individual"
                                 xaxis="_id"
                                 yaxis="count"
                                 binLabel={state.binLabel}
                                 width={980}
                                 height={500}
                               />
                            }
                            data={state.individualPageViews}
                            label={state.binLabel}
                            filterOptions={["Day", "Week", "2 Weeks", "Month"]}
                            filterSelectLabel="Unit of Time:"
                            filterFunction={changeBinVal}
                            clickFunction={pageViewCharts}
                            selectComponent={<SelectWithApply
                                selectOptions={state.allPages}
                                value={state.page}
                                dropdownFunction={handleChange}
                                clickFunction={handleIndividual}
                                state={state}
                                setState={setState}
                                type="page"
                                disable={state.disablePage}
                              />}
                          />
                        )}
                  </>
                )}
                  </Grid>
                </Box>
              </Box>
            </Grommet>
          </Tab>
        )}
        {click && state.hasAdapt && (
          <Tab title="By Assignment">
            <Grommet theme={theme}>
              <Grid
                fill={true}
                rows={["auto", "auto"]}
                columns={["15%", "79%"]}
                gap="small"
                areas={[
                  { name: "timeline", start: [0, 0], end: [1, 0] },
                  { name: "gradesChart", start: [0, 1], end: [1, 1]},
                ]}
                flex={true}
                responsive={true}
                margin="medium"
                overflowY="scroll"
              >
                {state.adaptLevels && (
                  <LayeredComponent
                    gridArea="timeline"
                    disable={state.disableAssignment}
                    loading={infoText.loadingMessage}
                    title="Individual Assignment Metrics Bar Chart"
                    infoText={infoText.individualAssignmentsChart}
                    filterLabel="Bar Chart Display Filters"
                    state={state}
                    setState={setState}
                    component={
                      <PageViews
                        data={state.individualAssignmentViews}
                        type="individual"
                        xaxis="_id"
                        yaxis="count"
                        binLabel={state.binLabel}
                        width={980}
                        height={500}
                      />
                    }
                    data={state.individualAssignmentViews}
                    label={state.binLabel}
                    filterOptions={["Day", "Week", "2 Weeks", "Month"]}
                    filterSelectLabel="Unit of Time:"
                    filterFunction={changeBinVal}
                    clickFunction={handleIndividual}
                    selectComponent={<SelectWithApply
                        selectOptions={Object.keys(state.adaptLevels)}
                        value={state.levelGroup}
                        dropdownFunction={handleChange}
                        clickFunction={handleIndividual}
                        state={state}
                        setState={setState}
                        type="pageLevelGroup"
                        disable={state.disableAssignment}
                        optionalSelect={<Select
                          options={state.adaptLevels[state.levelGroup]}
                          margin={{
                            right: "medium",
                            left: "medium",
                            vertical: "xsmall",
                          }}
                          value={state.levelName}
                          onChange={({ option }) =>
                            handleChange(
                              "pageLevelName",
                              option,
                              state, setState
                            )
                          }
                        />}
                        renderSelect={state.levelGroup}
                      />}
                  />
                )}
                {state.adaptLevels && (
                  <LayeredComponent
                    gridArea="gradesChart"
                    disable={state.disableGradesAssignment}
                    loading={infoText.loadingMessage}
                    title="Grades by Assignment Histogram"
                    infoText={infoText.assignmentGradesChart}
                    filterLabel="Grades Histogram Filters"
                    filterType="slider"
                    state={state}
                    setState={setState}
                    component={
                      <GradesPageView
                        data={state.gradesPageView}
                        range={[0,1]}
                        numberOfBins={state.numBinsGrades}
                        height={500}
                      />
                    }
                    data={state.gradesPageView}
                    label={state.sliderValue}
                    filterOptions={[1, state.gradesPageView]}
                    filterSelectLabel="Number of bins:"
                    filterFunction={changePropValue}
                    clickFunction={changePropValue}
                    selectComponent={<SelectWithApply
                        selectOptions={Object.keys(state.adaptLevels)}
                        value={state.gradeLevelGroup}
                        dropdownFunction={handleChange}
                        clickFunction={handleGrade}
                        state={state}
                        setState={setState}
                        type="gradesPageLevelGroup"
                        disable={state.disableGradesAssignment}
                        optionalSelect={<Select
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
                              state, setState
                            )
                          }
                        />}
                        renderSelect={state.gradeLevelGroup}
                      />}
                  />
                )}
              </Grid>
            </Grommet>
          </Tab>
        )}
        {realCourses && (
          <Box fill>
            <Box width="100%" responsive={true} margin={{ bottom: "small" }}>
              {state.showInfoBox && (
                <InfoBox
                  show={state.showInfoBox}
                  infoText={infoText.courseText}
                  color="#b0e0e6"
                  main={true}
                />
              )}
            </Box>
            <Box direction="row">
              <Box
                gridArea="courses"
                alignContent="center"
                align="center"
                alignSelf="center"
                fill
              >
                <Box>
                  <SelectWithApply
                    selectOptions={Object.keys(realCourses)}
                    value={state.courseName}
                    dropdownFunction={handleChange}
                    clickFunction={handleClick}
                    state={state}
                    setState={setState}
                    type="courseId"
                    disable={state.disableCourse}
                    width="300px"
                    dropSize="medium"
                    realCourses={realCourses}
                    queryVariables={queryVariables}
                  />
                </Box>
              </Box>
              {state.studentData && (
                <Box
                  direction="column"
                  alignSelf="start"
                  border={true}
                  width="375px"
                  height="225px"
                >
                  <CheckBox
                    label="Display Mode"
                    checked={state.displayMode}
                    pad={{left: "medium", top: "small"}}
                    onClick={() => setState({...state, displayMode: !state.displayMode})}
                  />
                  <Box direction="row">
                    <Box
                      margin={{ left: "small", bottom: "small", top: "small" }}
                      border={true}
                      height="30px"
                      width="40px"
                      background="rgb(255, 255, 158, .5)"
                    />
                    <Text
                      margin={{ left: "small", bottom: "small", top: "small" }}
                    >
                      LibreText Data
                    </Text>
                  </Box>
                  <Box direction="row">
                    <Box
                      margin={{ left: "small", bottom: "small" }}
                      border={true}
                      height="30px"
                      width="40px"
                      background="rgb(171, 247, 177, .5)"
                    />
                    <Text margin={{ left: "small", bottom: "small" }}>
                      Adapt Data
                    </Text>
                  </Box>
                  <Box direction="row">
                    <Box
                      margin={{ left: "small", bottom: "small" }}
                      border={true}
                      height="30px"
                      width="40px"
                      background="gainsboro"
                    />
                    <Text margin={{ left: "small", bottom: "small" }}>
                      Not Enrolled in Course
                    </Text>
                  </Box>
                  <Box direction="row">
                    <Text weight="bold" margin={{ left: "small", bottom: "small"}}>
                      Enrolled with No Data
                    </Text>
                  </Box>
                  <Button
                    label="Refresh Course"
                    secondary
                    color="#0047BA"
                    size="small"
                    margin={{horizontal: "large"}}
                    onClick={() => handleClick(state, setState, "refresh", queryVariables)}
                  />
                </Box>
              )}
            </Box>
          </Box>
        )}

        <Box
          gridArea="header"
          background="#022851"
          fill={true}
          contentAlign="center"
          margin={{ top: "small" }}
        >
          <Heading
            level="3"
            alignSelf="start"
            responsive={true}
            gridArea="header"
            margin="small"
          >
            LibreTexts Activity Dashboard
          </Heading>
        </Box>

        {state.studentData && state.pageData && (
          <Box>
            <Button
              margin="medium"
              color="#022851"
              label="Data Filters"
              onClick={() => setState({...state, showTableFilters: !state.showTableFilters})}
            />
          </Box>
        )}
        {!state.showTableFilters &&
          state.studentData &&
          state.pageData &&
          count === 0 && (
            <InfoBox
              count={count}
              setCount={setCount}
              infoText={infoText.dataFilter}
              color="#b0e0e6"
            />
          )}
        {state.showTableFilters && (
          <>
            <Box direction="row">
              <Box
                gridArea="filters"
                border={true}
                direction="row"
                height="175px"
                margin={{ bottom: "medium" }}
              >
              <Box
                direction="column"
              >
                <Box
                  margin={{ bottom: "medium", top: "xsmall" }}
                  direction="row"
                  height="100px"
                >
                  <Box>
                    <Text
                      size="large"
                      weight="bold"
                      textAlign="center"
                      margin={{ left: "small" }}
                    >
                      {" "}
                      Data Filters{" "}
                    </Text>
                  </Box>
                  <Box
                    pad="small"
                    direction="row"
                    margin={{ top: "medium" }}
                  >
                    <Text margin={{ vertical: "small", right: "xsmall" }}>
                      Start:
                    </Text>
                    <DateInput
                      format="mm/dd/yyyy"
                      value={state.start}
                      onChange={({ value }) => {
                        handleChange("start", value, state, setState);
                      }}
                    />
                    <Text
                      margin={{
                        vertical: "small",
                        right: "xsmall",
                        left: "xsmall",
                      }}
                    >
                      End:
                    </Text>
                    <DateInput
                      format="mm/dd/yyyy"
                      value={state.end}
                      onChange={({ value }) => {
                        handleChange("end", value, state, setState);
                      }}
                    />
                  </Box>
                  <Box direction="row" alignSelf="center" pad="small">
                    <Button
                      size="small"
                      margin={{
                        bottom: "small",
                        top: "medium",
                        horizontal: "medium",
                      }}
                      label="Clear Dates"
                      onClick={clearDates}
                      color="#022851"
                    />
                    <Button
                      label="Apply"
                      margin={{ top: "small" }}
                      style={{ height: 45 }}
                      primary
                      color="#0047BA"
                      disabled={state.disable}
                      onClick={() => handleFilterClick(state, setState)}
                    />
                  </Box>
                </Box>
                <CheckBox
                  label="Include Non-enrolled Students"
                  checked={state.showNonEnrolledStudents}
                  pad={{left: "large", bottom: "small"}}
                  onClick={() => setState({...state, showNonEnrolledStudents: !state.showNonEnrolledStudents})}
                />
                </Box>
              </Box>
              {state.allChapters && (
                <Box margin={{ bottom: "medium" }}>
                  <Button
                    alignSelf="start"
                    margin={{ horizontal: "xlarge" }}
                    label="Course Structure Menu"
                    onClick={() => menuCollapsible(state, setState)}
                    color="#022851"
                  />
                  <Collapsible open={state.openFilter}>
                    <Box width="350px" border={state.resetPath} margin="large">
                      {!state.resetPath && (
                        <TitleText
                          title="Course Structure Dropdown"
                          text={infoText.courseStructureDropdown}
                        />
                      )}
                      {state.resetPath && (
                        <Text margin="medium">
                          Please hit apply for the changes to take effect.
                        </Text>
                      )}
                      <MultiSelect
                        resetPath={state.resetPath}
                        pathLength={state.pathLength}
                        data={state.allChapters}
                        levels={state.courseLevel}
                        handleChange={() => handleChange(state, setState)}
                        filterClick={() => handleFilterClick(state, setState)}
                        init={state.dataPath}
                        clearPath={state.clearPath}
                      />
                    </Box>
                  </Collapsible>
                </Box>
              )}
            </Box>
          </>
        )}
        {(state.chosenPath || state.start || state.end || state.reset) && !state.showTableFilters && (
          <Box
            direction="column"
            border={true}
            margin={{ top: "small", right: "medium" }}
            width={{ min: "500px" }}
          >
            {state.chosenPath && (
              <Text margin="small">
                Current chosen path:{" "}
                {state.chosenPath.split("/").map((a) => (
                  <li>{a.replaceAll("_", " ")}</li>
                ))}
              </Text>
            )}
            {state.start && (
              <Text margin="small">
                Start Date: {new Date(state.start.split("T")[0]).toString()}
              </Text>
            )}
            {state.end && (
              <Text margin="small">
                End Date: {new Date(state.end.split("T")[0]).toString()}
              </Text>
            )}
            {!state.reset && (
              <Button
                secondary
                size="small"
                label="Clear All Filters"
                alignSelf="center"
                color="#022851"
                margin={{ vertical: "small" }}
                onClick={() => filterReset(state, setState)}
                type="reset"
              />
            )}
            {state.reset && (
              <Box direction="column">
                <Text margin="medium">
                  Please hit apply for the changes to take effect.
                </Text>
                <Button
                  primary
                  label="Apply"
                  onClick={() => applyReset(state, setState)}
                  color="#022851"
                  margin={{
                    bottom: "small",
                    top: "small",
                    horizontal: "large",
                  }}
                />
              </Box>
            )}
          </Box>
        )}
      </Tabs>
      </Grommet>
    </>
  );
}

export default App;
