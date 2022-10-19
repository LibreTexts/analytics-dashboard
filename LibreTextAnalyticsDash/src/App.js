import React from "react";
import { useEffect, useState } from "react";
import { Grommet } from "grommet";
import axios from "axios";

import HeaderGrid from "./components/headerGrid.js";
import StudentView from "./components/studentView.js";
import TextbookView from "./components/textbookView.js";
import AdaptView from "./components/adaptView.js";
import FilterView from "./components/filterView.js";
import "react-table-6/react-table.css";
import "./css/index.css";
import cookies from "js-cookie";
import { handleClick } from "./functions/dataFetchingFunctions.js";
import { setCourseFromConductor } from "./functions/helperFunctions.js";

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
  //initial state
  const [state, setState] = useState({
    studentTab: false,
    pageTab: false,
    assignmentTab: false,
    filterTab: false,
    start: null,
    end: null,
    showFilter: false,
    tab: "initial",
    disable: true,
    disableCourse: false,
    disablePage: true,
    disableStudent: true,
    disableAssignment: true,
    disableGradesAssignment: true,
    disableStudentTextbookEngagement: true,
    disableChapterChart: true,
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
    individualAdaptEngagmentBin: 1,
    individualAdaptEngagementBinLabel: "Day",
    individualAdaptEngagementUnit: "day",
    sliderValue: 10,
    numBinsGrades: 10,
    allData: {},
    pathLength: 0,
    allChapters: null,
    courseLevel: null,
    chosenPaths: null,
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
      "LT Hours on Site": true,
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
    disableFilterReset: false,
    aggregateAssignmentViews: null,
    allAssignmentGrades: null,
    roster: null,
    rosterFile: null,
    rosterFilterApplied: false,
    accessibilityMode: false,
    conductorRoster: false,
    environment: "production"
  });

  //state variables on their own to use right away/have easy access
  const [click, setClick] = useState(false);
  const [realCourses, setRealCourses] = useState(null);
  const [count, setCount] = useState(0);
  const [courseInfo, setCourseInfo] = useState(null);
  const [enrollmentData, setEnrollmentData] = useState(null);

  //put into a single object to easily pass it onto other components
  var queryVariables = {
    click: click,
    setClick: setClick,
    count: count,
    setCount: setCount,
    realCourses: realCourses,
    setRealCourses: setRealCourses,
  };

  //pull the courses in useEffect so it happens right away on the initial page
  useEffect(() => {
    if (state.homepage !== "") {
      var course = cookies.get("analytics_conductor_course_id");
      axios(state.homepage + "/courseinfo").then((response) => {
        setCourseInfo(response.data.course);
        sessionStorage.setItem(
          course + "-info",
          JSON.stringify(response.data.course)
        );
      });
      axios(state.homepage + "/conductorenrollment").then((response) => {
        setEnrollmentData(response.data.students);
        sessionStorage.setItem(
          course + "-enrollment",
          JSON.stringify(response.data.students)
        );
      });
    }

    //grab the courses from session storage
    var courses = JSON.parse(sessionStorage.getItem("allCourses"));
    //check to see if there are libretext courses stored,
    //currently an error where libretext courses don't show up right away
    if (courses) {
      var success = Object.keys(courses).find(
        (key) => courses[key].ltCourse === true
      );
    } else {
      success = false;
    }

    //if the courses aren't in session storage or it didn't grab them all the first time
    //pull the courses from the endpoint on the express node server
    if (!sessionStorage.getItem("allCourses") || !success) {
      let realCourses = {};
      //libretext and adapt courses have two different queries because they
      //come from two different mongodb collections and have no direct variable to link them
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
  }, [state.homepage, state.courseId, state.start, state.end, state.roster]);

    useEffect(() => {
      if (state.environment === "production") {
        var textbookID = JSON.parse(sessionStorage.getItem(cookies.get("analytics_conductor_course_id")+"-info")).textbookID;
        var tempState = setCourseFromConductor(state, setState, textbookID, realCourses, queryVariables);
        handleClick(tempState, setState, "courseId", queryVariables);
      }
    }, [cookies.get("analytics_conductor_course_id")])

  return (
    <>
      {
        //each view component corresponds to a different tab on the dashboard
        //the HeaderGrid component has the dropdown for the courses
      }
      <Grommet theme={theme} full style={{ overflowX: "hidden" }}>
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
