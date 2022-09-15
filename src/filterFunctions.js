
export function sortData(option, state, setState, type, data) {
  //setState({...state, individualAssignmentSortLabel: option})

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
  } else if (option === "Adapt Unique Interaction Days") {
    setState({
      ...state,
      barXAxisLabel: option,
      barXAxis: "dateCount",
      adaptStudentChartVal: true,
    });
  } else if (option === "Adapt Unique Assignments") {
    setState({
      ...state,
      barXAxisLabel: option,
      barXAxis: "objectCount",
      adaptStudentChartVal: true,
    });
  } else if (option === "Adapt Most Recent Page Load") {
    setState({
      ...state,
      barXAxisLabel: option,
      barXAxis: "lastDate",
      adaptStudentChartVal: true,
    });
  }
}

export function changeBinVal(option, state, setState, type) {
  var tempState = JSON.parse(JSON.stringify(state));
  var courseData = JSON.parse(localStorage.getItem(state.courseId+"-filters"));
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
  localStorage.setItem(state.courseId+"-filters", JSON.stringify(courseData));
}

export function changeColumns(event, label, state, setState) {
  var columns = JSON.parse(JSON.stringify(state.tableColumns));
  var checked = JSON.parse(JSON.stringify(state.checkedValues));
  if (label === "All" && columns[label]) {
    columns[label] = false;
    checked.find((v, index) => {
      if (v === label) {
        checked.splice(index, 1);
      }
    });
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
      checked.find((v, index) => {
        if (v === label) {
          checked.splice(index, 1);
        }
      });
      checked.find((v, index) => {
        if (v === "All") {
          checked.splice(index, 1);
        }
      });
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

export function changeActivityFilter(option, data, state, setState) {
  setState({
    ...state,
    activityFilter: option,
  });
  // if (option === "No Recent LibreText Activity") {
  //   setActivityFilter(option)
  //   // data.sort((a, b) => {
  //   //   return a - b
  //   // })
  // } else if (option === "No Recent Adapt Activity") {
  //
  // } else if (option === "Low Adapt Performance") {
  //
  // }
}


export function changePropValue(state, setState, prop, option) {
  let tempState = JSON.parse(JSON.stringify(state));
  tempState[prop] = option;
  setState({
    ...tempState,
  });
}
