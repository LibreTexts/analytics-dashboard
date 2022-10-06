import axios from "axios";
import { getStudentTextbookEngagementData } from "./ltDataQueries-individual.js";

//for the AlLAdaptAssignmentsChart on the Student View
export function getStudentAssignments(state, setState) {
  return axios({
    method: "post",
    url: state.homepage + "/studentassignments",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      courseId: state.courseId,
      individual: state.student,
      startDate: state.start,
      endDate: state.end,
      type: "pages",
    },
  });
}

export function getIndividualAssignmentSubmissions(
  state,
  setState,
  individualRequest = true
) {
  //if (!individualRequest) {
    return axios({
      method: "post",
      url: state.homepage + "/individualpageviews",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        courseId: state.courseId,
        individual: state.student,
        startDate: state.start,
        endDate: state.end,
        type: "assignments",
        unit: state.individualAdaptEngagementUnit,
        bin: state.individualAdaptEngagmentBin,
      },
    });
  //} //else {
  //   axios({
  //     method: "post",
  //     url: state.homepage + "/individualpageviews",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     data: {
  //       courseId: state.courseId,
  //       individual: state.student,
  //       startDate: state.start,
  //       endDate: state.end,
  //       type: "assignments",
  //       unit: state.individualAdaptEngagementUnit,
  //       bin: state.individualAdaptEngagmentBin,
  //     },
  //   }).then((response) => {
  //     setState({
  //       ...state,
  //       individualAssignmentSubmissions: JSON.parse(response.data)[
  //         "individualAssignmentSubmissions"
  //       ],
  //     });
  //   });
  // }
}

//for the GradesPageViewsChart
export function getGradesPageViewData(state, setState) {
  var tempState = JSON.parse(JSON.stringify(state));
  tempState = {
    ...tempState,
    gradesPageView: null,
  };
  setState({
    ...tempState,
  });
  var courseData = JSON.parse(localStorage.getItem(state.courseId + "-chart"));
  if (
    !Object.keys(courseData).includes(
      "grades" + state.gradeLevelGroup + state.gradeLevelName
    )
  ) {
    axios({
      method: "post",
      url: state.homepage + "/gradepageviews",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        courseId: state.courseId,
        levelGroup: state.gradeLevelGroup,
        levelName: state.gradeLevelName,
        startDate: state.start,
        endDate: state.end,
      },
    }).then((response) => {
      let grades = JSON.parse(response.data)["documents"];
      if (grades.length === 0) {
        tempState = {
          ...tempState,
          noChartData: true,
        };
      } else {
        tempState = {
          ...tempState,
          noChartData: false,
          gradesPageView: JSON.parse(response.data)["documents"],
        };
        courseData[
          "grades" + state.gradeLevelGroup + state.gradeLevelName
        ] = JSON.parse(response.data)["documents"];
        localStorage.setItem(
          state.courseId + "-chart",
          JSON.stringify(courseData)
        );
      }
      setState({
        ...tempState,
      });
    });
  } else {
    tempState["gradesPageView"] =
      courseData["grades" + state.gradeLevelGroup + state.gradeLevelName];
    setState({
      ...tempState,
      noChartData: false,
    });
  }
}
