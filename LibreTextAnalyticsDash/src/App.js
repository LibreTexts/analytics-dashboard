import React from "react";
import { useEffect, useState } from "react";
import "react-table-6/react-table.css";
import { Grommet } from "grommet";
import "./index.css";
import HeaderGrid from "./headerGrid.js";
import StudentView from "./studentView.js";
import TextbookView from "./textbookView.js";
import AdaptView from "./adaptView.js";
import FilterView from "./filterView.js";
import axios from "axios";
import { getTagInfo } from "./ltDataQueries";

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
    disableStudentTextbookEngagement: false,
    course: null,
    courseId: null,
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
    allPageIds: null,
    chosenTag: null,
    barXAxis: "dateCount",
    barXAxisLabel: "LT Unique Interaction Days",
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
    individualStudentBin: 1,
    individualStudentBinLabel: "Day",
    individualStudentUnit: "day",
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
    activityFilter: "",
    tableColumns: {
      All: true,
      "LT Unique Pages Accessed": true,
      "LT Total Page Views": true,
      "LT Most Recent Page Load": true,
      "LT Unique Interaction Days": true,
      "LT Hours on Site": true
    },
    gridHeight: "small",
    homepage: "/analytics/api",
    showNonEnrolledStudents: false,
    ltCourse: false,
    adaptCourse: false,
    displayMode: false,
    filters: [],
    adaptStudentChartVal: false,
    noChartData: false,
    chosenChapter: null,
    disableCourseStructureButton: false,
    disableFilterReset: false
  });

  const [click, setClick] = useState(false);
  const [realCourses, setRealCourses] = useState(null);
  const [count, setCount] = useState(0);

  var queryVariables = {
    click: click,
    setClick: setClick,
    count: count,
    setCount: setCount,
    realCourses: realCourses,
    setRealCourses: setRealCourses,
  };

  useEffect(() => {
    var courses = JSON.parse(sessionStorage.getItem("allCourses"));
    if (courses) {
      var success = Object.keys(courses).find(
        (key) => courses[key].ltCourse === true
      );
    } else {
      success = false;
    }

    if (!sessionStorage.getItem("allCourses") || !success) {
      let realCourses = {};
      axios(state.homepage + "/realcourses").then((response) => {
        let x = {};
        response.data.forEach((course) => {
          x[course.course] = {
            courseId: course._id,
            ltCourse: course.ltCourse,
            adaptCourse: course.adaptCourse,
            startDate: course.startDate,
            endDate: course.endDate,
          };
        });
        realCourses = x;
      });

      axios(state.homepage + "/adaptcourses").then((response) => {
        let x = JSON.parse(JSON.stringify(realCourses));
        response.data.forEach((course) => {
          x[course.course] = {
            courseId: course._id,
            ltCourse: course.ltCourse,
            adaptCourse: course.adaptCourse,
            startDate: course.startDate,
            endDate: course.endDate,
          };
        });
        setRealCourses(x);
        sessionStorage.setItem("allCourses", JSON.stringify(x));
      });
    } else {
      setRealCourses(JSON.parse(sessionStorage.getItem("allCourses")));
    }
  }, [state]);

  return (
    <>
      <Grommet theme={theme} full fill={true} style={{ overflowX: "hidden" }}>
        {realCourses && !state.studentData && (
          <HeaderGrid
            state={state}
            setState={setState}
            queryVariables={queryVariables}
            data={state.studentData}
            initPage={true}
          />
        )}
        {state.filterTab && (
          <FilterView
            state={state}
            setState={setState}
            queryVariables={queryVariables}
          />
        )}
        {state.studentTab && (
          <StudentView
            state={state}
            setState={setState}
            queryVariables={queryVariables}
          />
        )}
        {click && state.ltCourse && state.pageTab && (
          <TextbookView
            state={state}
            setState={setState}
            queryVariables={queryVariables}
          />
        )}
        {click && state.hasAdapt && state.assignmentTab && (
          <AdaptView
            state={state}
            setState={setState}
            queryVariables={queryVariables}
            theme={theme}
          />
        )}
      </Grommet>
    </>
  );
}

export default App;
