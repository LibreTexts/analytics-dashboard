//functions used in the filters on the charts

// Used to sort horizontal axis bars in a chart
export function sortData(option, state, setState, type, data) {
  if (option === "Alphabetically") {
    data = data.sort((a, b) => {
      return ("" + a._id).localeCompare(b._id);
    });
    setState({
      ...state,
      individualAssignmentSortLabel: option,
      allAdaptAssignments: data,
    });
  } else if (option === "By Due Date") {
    data = data.sort((a, b) => {
      return new Date(a.due) - new Date(b.due);
    });
    setState({
      ...state,
      individualAssignmentSortLabel: option,
      allAdaptAssignments: data,
    });
  }
}

//change the variable used for the student chart x axis
export function changeBarXAxis(option, state, setState) {
  if (option === "LT Unique Interaction Days") {
    setState({
      ...state,
      barXAxisLabel: option,
      barXAxis: "dateCount",
      adaptStudentChartVal: false,
    });
  } else if (option === "LT Unique Pages Accessed") {
    setState({
      ...state,
      barXAxisLabel: option,
      barXAxis: "objectCount",
      adaptStudentChartVal: false,
    });
  } else if (option === "LT Most Recent Page Load") {
    setState({
      ...state,
      barXAxisLabel: option,
      barXAxis: "lastDate",
      adaptStudentChartVal: false,
    });
  } else if (option === "LT Hours on Site") {
    setState({
      ...state,
      barXAxisLabel: option,
      barXAxis: "timeStudied",
      adaptStudentChartVal: false,
    });
  } else if (option === "ADAPT Unique Interaction Days") {
    setState({
      ...state,
      barXAxisLabel: option,
      barXAxis: "dateCount",
      adaptStudentChartVal: true,
    });
  } else if (option === "ADAPT Unique Assignments") {
    setState({
      ...state,
      barXAxisLabel: option,
      barXAxis: "objectCount",
      adaptStudentChartVal: true,
    });
  } else if (option === "ADAPT Most Recent Page Load") {
    setState({
      ...state,
      barXAxisLabel: option,
      barXAxis: "lastDate",
      adaptStudentChartVal: true,
    });
  }
}
// Used to change bin numbers for histogram
export function changeBinVal(option, state, setState, type) {
  var tempState = JSON.parse(JSON.stringify(state));
  var courseData = JSON.parse(
    localStorage.getItem(state.courseId + "-filters")
  );
  var bin = "bin";
  var binLabel = "binLabel";
  var unit = "unit";

  if (type === "individualPageViews") {
    bin = "individualPageBin";
    binLabel = "individualPageBinLabel";
    unit = "individualPageUnit";
  } else if (type === "individualAssignmentViews") {
    bin = "individualAssignmentBin";
    binLabel = "individualAssignmentBinLabel";
    unit = "individualAssignmentUnit";
  } else if (type === "adaptEngagement") {
    bin = "individualAdaptEngagmentBin";
    binLabel = "individualAdaptEngagementBinLabel";
    unit = "individualAdaptEngagementUnit";
  } else if (type === "textbookEngagement") {
    bin = "individualStudentBin";
    binLabel = "individualStudentBinLabel";
    unit = "individualStudentUnit";
  }
  if (option === "Day") {
    tempState[bin] = 1;
    tempState[binLabel] = option;
    tempState[unit] = "day";
    setState({
      ...tempState,
    });
  } else if (option === "Week") {
    tempState[bin] = 1;
    tempState[binLabel] = option;
    tempState[unit] = "week";
    setState({
      ...tempState,
    });
  } else if (option === "2 Weeks") {
    tempState[bin] = 2;
    tempState[binLabel] = option;
    tempState[unit] = "week";
    setState({
      ...tempState,
    });
  } else if (option === "Month") {
    tempState[bin] = 1;
    tempState[binLabel] = option;
    tempState[unit] = "month";
    setState({
      ...tempState,
    });
  }
  courseData[bin] = tempState[bin];
  courseData[binLabel] = tempState[binLabel];
  courseData[unit] = tempState[unit];
  localStorage.setItem(state.courseId + "-filters", JSON.stringify(courseData));
}

// Used to toggle display of columns in a datatable
export function changeColumns(event, label, state, setState) {
  var columns = JSON.parse(JSON.stringify(state.tableColumns));
  var checked = JSON.parse(JSON.stringify(state.checkedValues));
  if (label === "All" && columns[label]) {
    columns[label] = false;
    checked.filter((v, index) => v !== label);
  } else if (label === "All" && !columns[label]) {
    Object.keys(columns).forEach((v) => {
      columns[v] = true;
    });
    checked = Object.keys(columns);
  } else {
    if (columns[label]) {
      columns[label] = false;
      columns["All"] = false;
    } else {
      columns[label] = true;
    }
    if (checked.includes(label)) {
      checked.filter((v, index) => v !== label && v !== "All");
    } else {
      checked.push(label);
    }
  }
  setState({
    ...state,
    checkedValues: checked,
    tableColumns: columns,
  });
}

// Used to change bin numbers for histogram
export function changePropValue(state, setState, prop, option) {
  let tempState = JSON.parse(JSON.stringify(state));
  tempState[prop] = option;
  setState({
    ...tempState,
  });
}
