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
import DataFilterText from "./dataFilterText";
import CourseDropdown from "./courseDropdown.js";
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
  reactRows,
  sortData
} from "./filterFunctions.js";
import { infoText } from "./allInfoText.js";
import Legend from "./legend.js";
import BarGraph from "./bargraph.js";
import Tabs from "./tabs.js";
import HeaderGrid from "./headerGrid.js";
import DataFilters from "./dataFilters.js";
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
    studentTab: true,
    pageTab: false,
    assignmentTab: false,
    filterTab: false,
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
    studentData: null,
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
    unit: "day",
    individualPageBin: 1,
    individualPageBinLabel: "Day",
    individualPageUnit: "day",
    individualAssignmentBin: 1,
    individualAssignmentBinLabel: "Day",
    individualAssignmentUnit: "day",
    individualAssignmentSortLabel: "By Due Date",
    sliderValue: 10,
    numBinsGrades: 10,
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
    displayMode: false,
    filters: []
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
    var courses = JSON.parse(localStorage.getItem("allCourses"))
    if (courses) {
      var success = Object.keys(courses).find(key => courses[key].ltCourse === true)
    } else {
      var success = false
    }

    if (!localStorage.getItem("allCourses") || !success) {
      let realCourses = {};
      axios(state.homepage+"/realcourses").then((response) => {
        let x = {};
        response.data.forEach((course) => {
          x[course.course] = {courseId: course._id, ltCourse: course.ltCourse, adaptCourse: course.adaptCourse};
        });
        realCourses = x;
        //setRealCourses(realCourses);
      });

      //let ltCourses = JSON.parse(JSON.stringify(realCourses));
      axios(state.homepage+"/adaptcourses").then((response) => {
        Object.keys(response.data).forEach((course) => {
          realCourses[course] = {courseId: response.data[course], ltCourse: false, adaptCourse: true}
        })
        setRealCourses(realCourses)
        localStorage.setItem("allCourses", JSON.stringify(realCourses))
      })
    } else {
      setRealCourses(JSON.parse(localStorage.getItem("allCourses")))
    }
  }, []);

  return (
    <>
    <Grommet theme={theme} full fill={true} style={{overflowX: "hidden"}}>
      {realCourses && !state.studentData &&
        <HeaderGrid
          state={state}
          setState={setState}
          handleClick={handleClick}
          queryVariables={queryVariables}
          realCourses={realCourses}
          infoText={infoText}
          handleChange={handleChange}
          changeColumns={changeColumns}
          data={state.studentData}
          initPage={true}
        />
      }
      {state.filterTab &&
        <>
          <HeaderGrid
            state={state}
            setState={setState}
            handleClick={handleClick}
            queryVariables={queryVariables}
            realCourses={realCourses}
            infoText={infoText}
            handleChange={handleChange}
            changeColumns={changeColumns}
            data={true}
          />
          <Grid
            fill={true}
            rows={["auto"]}
            columns={["50%", "50%"]}
            gap="small"
            areas={[
              { name: "filters", start: [0, 0], end: [0, 0] },
              { name: "dropdown", start: [1, 0], end: [1, 0] }
            ]}
            flex={true}
            responsive={true}
            overflow="hidden"
            justifyContent="center"
          >
          {click &&
            <>
            <DataFilters
              state={state}
              setState={setState}
              handleChange={handleChange}
              handleClick={handleClick}
              infoText={infoText}
              queryVariables={queryVariables}
              handleFilterClick={handleFilterClick}
              menuCollapsible={menuCollapsible}
            />
            {state.allChapters && state.ltCourse &&
              <Box width="500px" border={state.resetPath} margin={{left: "xlarge"}} gridArea="dropdown">
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
            }
            </>
          }
          </Grid>
        </>
      }
        {state.studentTab && (
          <>
              {state.studentData &&
                <HeaderGrid
                  state={state}
                  setState={setState}
                  handleClick={handleClick}
                  queryVariables={queryVariables}
                  realCourses={realCourses}
                  infoText={infoText}
                  handleChange={handleChange}
                  changeColumns={changeColumns}
                  data={state.studentData}
                  click={click}
                />
              }
                  <Grid
                    fill={true}
                    rows={reactRows(state)}
                    columns={["15%", "79%"]}
                    gap="small"
                    areas={reactGrids(state)}
                    flex={true}
                    responsive={true}
                    overflow="hidden"
                    justifyContent="center"
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
                        {click && state.allStudents && (state.hasAdapt || state.adaptCourse) && (
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
                            label={state.individualAssignmentSortLabel}
                            filterOptions={["Alphabetically", "By Due Date"]}
                            filterSelectLabel="Sort:"
                            filterFunction={sortData}
                            clickFunction={sortData}
                            type="studentAssignments"
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
                </>
        )}
        {click && state.ltCourse && state.pageTab && (
          <>
            <Grommet theme={theme} full fill="true" overflowY="scroll">
            {state.pageData &&
              <HeaderGrid
                state={state}
                setState={setState}
                handleClick={handleClick}
                queryVariables={queryVariables}
                realCourses={realCourses}
                infoText={infoText}
                handleChange={handleChange}
                changeColumns={changeColumns}
                data={state.pageData}
              />
            }
                  <Grid
                    fill={true}
                    rows={["2/3", "2/3", "1/3"]}
                    columns={["15%", "79%"]}
                    gap="small"
                    areas={[
                      { name: "table", start: [0, 0], end: [1, 0] },
                      { name: "horizontal-chart", start: [0, 1], end: [1, 1] },
                      { name: "timeline", start: [0, 2], end: [1, 2] }
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
                            loading={infoText.loadingMessage}
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
                            type="aggregatePageViews"
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
            </Grommet>
            </>
        )}
        {click && state.hasAdapt && state.assignmentTab && (
          <>
            <Grommet theme={theme}>
            {state.hasAdapt &&
              <HeaderGrid
                state={state}
                setState={setState}
                handleClick={handleClick}
                queryVariables={queryVariables}
                realCourses={realCourses}
                infoText={infoText}
                handleChange={handleChange}
                changeColumns={changeColumns}
                data={state.hasAdapt}
              />
            }
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
                overflow="hidden"
                justifyContent="center"
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
                        binLabel={state.individualAssignmentBinLabel}
                        width={980}
                        height={500}
                      />
                    }
                    data={state.individualAssignmentViews}
                    label={state.individualAssignmentBinLabel}
                    filterOptions={["Day", "Week", "2 Weeks", "Month"]}
                    filterSelectLabel="Unit of Time:"
                    filterFunction={changeBinVal}
                    clickFunction={handleIndividual}
                    type="individualAssignmentViews"
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
                    type="numBinsGrades"
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
          </>
        )}
        {
        // {realCourses && !state.studentData && (
        //   <Box fill>
        //     <Box width="100%" responsive={true} margin={{ bottom: "small" }}>
        //       {state.showInfoBox && (
        //         <InfoBox
        //           show={state.showInfoBox}
        //           infoText={infoText.courseText}
        //           color="#b0e0e6"
        //           main={true}
        //         />
        //       )}
        //     </Box>
        //     <Box direction="row">
        //       <Box
        //         gridArea="courses"
        //         alignContent="center"
        //         align="center"
        //         alignSelf="center"
        //         fill
        //       >
        //         <Box>
        //           <SelectWithApply
        //             selectOptions={Object.keys(realCourses)}
        //             value={state.courseName}
        //             dropdownFunction={handleChange}
        //             clickFunction={handleClick}
        //             state={state}
        //             setState={setState}
        //             type="courseId"
        //             disable={state.disableCourse}
        //             width="300px"
        //             dropSize="medium"
        //             realCourses={realCourses}
        //             queryVariables={queryVariables}
        //           />
        //         </Box>
        //       </Box>
        //     </Box>
        //   </Box>
        // )}
      }
        {false && state.courseId &&
          <Box border={true}>
            {state.ltCourse && !state.adaptCourse &&
              <Text>This course only has LibreText data.</Text>
            }
            {state.adaptCourse && !state.ltCourse &&
              <Text>This course only has Adapt data.</Text>
            }
            {state.ltCourse && state.adaptCourse &&
              <Text>This course has LibreText and Adapt data.</Text>
            }
          </Box>
        }


      </Grommet>
    </>
  );
}

export default App;
