import React from "react";
import { useEffect, useState, useRef } from "react";
import { Grommet, Spinner, Text, Box } from "grommet";
import axios from "axios";

import HeaderGrid from "./components/headerGrid.js";
import StudentView from "./components/studentView.js";
import TextbookView from "./components/textbookView.js";
import AdaptView from "./components/adaptView.js";
import FilterView from "./components/filterView.js";
import InfoBox from "./components/infoBox.js";
import "react-table-6/react-table.css";
import "./css/index.css";
import cookies from "js-cookie";
import { handleClick } from "./functions/dataFetchingFunctions.js";
import { setCourseFromConductor } from "./functions/helperFunctions.js";
import infoText from "./components/allInfoText.js";
import BasicCSSButton from "./components/basicCSSButton.js";

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
  button: {
    disabled: {
      opacity: 0.8,
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
    startDateString: null,
    tab: "initial",
    disable: true,
    disableCourse: false,
    disablePage: true,
    disableStudent: true,
    disableAssignment: true,
    disableStudentTextbookEngagement: true,
    disableChapterChart: true,
    course: null,
    courseId: null,
    adaptCourseID: null,
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
    homepage: "/analytics",
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
    noDataAvailable: false,
    gradesFromGradebook: false,
    loadingProgress: 0,
    environment: "production",
    reload: false,
    notInCommons: false,
  });
  //making a useRef so state can be used in useEffect without passing it to the dependency array & re-rendering constantly
  const stateRef = useRef(state);

  //state variables on their own to use right away/have easy access
  const [click, setClick] = useState(false);
  const [realCourses, setRealCourses] = useState(null);
  const [count, setCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loadingStart, setLoadingStart] = useState(null);

  //put into a single object to easily pass it onto other components
  var queryVariables = {
    click: click,
    setClick: setClick,
    count: count,
    setCount: setCount,
    realCourses: realCourses,
    setRealCourses: setRealCourses,
    progress: progress,
    setProgress: setProgress,
    loadingStart: loadingStart,
    setLoadingStart: setLoadingStart,
  };
  const queryRef = useRef(queryVariables);

  useEffect(() => {
    stateRef.current = state;
    queryRef.current = queryVariables;
  });

  var allCourses = sessionStorage.getItem("allCourses");
  var conductorCourseId = cookies.get("analytics_conductor_course_id");
  var courseInfo = JSON.parse(
    sessionStorage.getItem(conductorCourseId + "-info")
  )
    ? JSON.parse(sessionStorage.getItem(conductorCourseId + "-info"))
    : { start: null, end: null, textbookID: null, adaptCourseID: null };
  // var courseInfoAttributes = Object.keys(courseInfo);
  //pull the courses in useEffect so it happens right away on the initial page
  useEffect(() => {
    //grab the courses from session storage
    var courses = JSON.parse(sessionStorage.getItem("allCourses"));
    //check to see if there are libretext courses stored,
    //currently an error where libretext courses don't show up right away
    //if the courses aren't in session storage or it didn't grab them all the first time
    //pull the courses from the endpoint on the express node server
    if (!courses) {
      //libretext and adapt courses have two different queries because they
      //come from two different mongodb collections and have no direct variable to link them
      var request1 = axios(state.homepage + "/realcourses");
      var request2 = axios(state.homepage + "/adaptcourses");
      axios
        .all([request1, request2])
        .then(
          axios.spread((...responses) => {
            const responseOne = responses[0].data;
            const responseTwo = responses[1].data;
            var courses = responseOne.concat(responseTwo);
            let x = {};
            courses.forEach((course) => {
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
          })
        )
        .catch((errors) => {
          console.log(errors);
        });
    } else {
      setRealCourses(JSON.parse(sessionStorage.getItem("allCourses")));
    }
  }, [allCourses, state.homepage]);

  //need to add start and end dates to the dependency array
  useEffect(() => {
    if (state.environment === "production") {
      var course = cookies.get("analytics_conductor_course_id");
      var request1 = axios(state.homepage + "/courseinfo");
      var request2 = axios(state.homepage + "/conductorenrollment");
      var courseInfoAttributes = Object.keys(courseInfo);

      axios
        .all([request1, request2])
        .then(
          axios.spread((...responses) => {
            const responseOne = responses[0].data;
            const responseTwo = responses[1].data;
            var dataChanged = false;
            if (
              courseInfo.start !== null &&
              responseOne.course.start !== courseInfo.start
            ) {
              dataChanged = true;
            }
            if (
              courseInfo.end !== null &&
              responseOne.course.end !== courseInfo.end
            ) {
              dataChanged = true;
            }
            sessionStorage.setItem(
              course + "-info",
              JSON.stringify(responseOne.course)
            );
            sessionStorage.setItem(
              course + "-enrollment",
              JSON.stringify(responseTwo.students)
            );
            var courses = JSON.parse(sessionStorage.getItem("allCourses"));
            var id = null;
            var adaptId = null;
            var hasData = false;
            if (
              courseInfoAttributes.includes("textbookID") &&
              courseInfoAttributes.includes("adaptCourseID")
            ) {
              id = courseInfo.textbookID;
              adaptId = courseInfo.adaptCourseID;
              hasData = Object.values(courses).find(
                (obj) => obj.courseId === id
              );
            } else if (
              courseInfoAttributes.includes("textbookID") &&
              !courseInfoAttributes.includes("adaptCourseID")
            ) {
              id = courseInfo.textbookID;
              hasData = Object.values(courses).find(
                (obj) => obj.courseId === id
              );
            } else if (
              !courseInfoAttributes.includes("textbookID") &&
              courseInfoAttributes.includes("adaptCourseID")
            ) {
              adaptId = courseInfo.adaptCourseID;
              hasData = Object.values(courses).find(
                (obj) => obj.courseId === adaptId
              );
            }
            if (hasData !== undefined) { //change to checking if it's true instead
              var tempState = setCourseFromConductor(
                stateRef.current,
                setState,
                id,
                adaptId,
                courses,
                queryRef.current
              );
              //noDataAvailable now being set to false in the above function
              tempState["conductorCourseInfo"] = responseOne.course;
              tempState["conductorEnrollmentData"] = responseTwo.students;
              tempState["notInCommons"] = false;
              if (dataChanged) {
                handleClick(tempState, setState, "refresh", queryRef.current);
              } else {
                handleClick(tempState, setState, "courseId", queryRef.current);
              }
            } else {
              //functional update of state without needing state in the dependency array
              setState((s) => ({
                ...s,
                noDataAvailable: true,
                notInCommons: false,
              }));
            }
          })
        )
        .catch((errors) => {
          setState((s) => ({
            ...s,
            noDataAvailable: true,
            notInCommons: true,
          }));
          console.log(errors);
        });
    }
  }, [
    conductorCourseId,
    state.environment,
    state.homepage,
    courseInfo.start,
    courseInfo.end,
    state.reload,
    courseInfo.textbookID,
    courseInfo.adaptCourseID,
  ]);

  return (
    <>
      {
        //each view component corresponds to a different tab on the dashboard
        //the HeaderGrid component has the dropdown for the courses
      }
      <Grommet theme={theme} full style={{ overflowX: "hidden" }}>
        {state.environment === "development" &&
          realCourses &&
          !state.studentData &&
          !state.noDataAvailable && (
            <HeaderGrid
              state={state}
              setState={setState}
              queryVariables={queryVariables}
              data={state.studentData}
              initPage={true}
            />
          )}
        {state.environment === "production" &&
          realCourses &&
          !state.studentData &&
          !state.noDataAvailable && (
            <InfoBox
              infoText={infoText.loadingMessage}
              showProgress={true}
              state={state}
              setState={setState}
              ltCourse={state.ltCourse}
              adaptCourse={state.adaptCourse}
              queryVariables={queryVariables}
              showIcon={true}
              icon={<Spinner />}
            />
          )}
        {state.noDataAvailable && !state.notInCommons && (
          <Box align="center" width="100%" direction="row" justify="center">
            <Box direction="column" margin={{ right: "medium" }}>
              <Text size="large" margin={{ top: "large" }} role="alert">
                There is no LibreTexts or ADAPT data available for this course.
              </Text>
              <Text size="large" margin={{ top: "medium" }} role="alert">
                If you think there should be data, please use the button to
                refresh the page.
              </Text>
            </Box>
            <BasicCSSButton
              label="Refresh"
              onClickFunction={() => {
                sessionStorage.clear();
                window.location.reload();
              }}
            />
          </Box>
        )}
        {state.noDataAvailable && state.notInCommons && (
          <Box align="center" width="100%">
            <Text size="large" margin={{ top: "large" }} role="alert">
              An error has occurred. Please use the dashboard inside of Commons
              or refresh the page.
            </Text>
          </Box>
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
