import { Box, Text, Button, Spinner } from "grommet";
import moment from "moment";

import { handleClick } from "../functions/dataFetchingFunctions.js";
import { filterReset } from "../functions/helperFunctions.js";
import InfoBox from "./infoBox.js";
import infoText from "./allInfoText.js";

//on the filter tab, displays the filters chosen by the user
export default function ChosenFilters({
  state,
  setState,
  gridArea,
  queryVariables,
  noEnrollmentData = false,
}) {
  var hasFilter =
    (state.chosenPaths && state.chosenPaths.length > 0) ||
    state.start ||
    state.end ||
    state.chosenTag;

  var enrollmentMessage = state.conductorRoster
    ? "This course is using enrollment data from Conductor."
    : state.rosterFilterApplied
    ? "This course is using enrollment data from a roster."
    : noEnrollmentData
    ? "This course has no enrollment data available."
    : "This course is using enrollment data from ADAPT.";
  /* Create a path tree (object) using the chosenPaths */

  // Current node search for child named i
  function getIndex(obj, i) {
    if (obj["title"] === i) {
      return -2;
    }
    return obj["children"].findIndex((childObj) => childObj["title"] === i);
  }
  // Driver function: takes each string in chosen path
  // Each string is split by the '/'
  // Path (as a list) is turned into a branch of the pathTree (an object)
  function formatPathList(chosenPaths) {
    var pathTree = {};
    chosenPaths.forEach((path) => {
      createBranch(pathTree, path.split("/"));
    });
    // console.log(JSON.stringify(pathTree, null, 2))
    return pathTree;
  }
  // For each section in the path, check if it exists
  // Then traverse the pathTree in sequential order,
  // inserting a new empty attribute if we cannot get the index
  function createBranch(obj, path) {
    let pathHistory = [];
    let curr;
    while (typeof (curr = path.shift()) !== "undefined") {
      let formatCurr = curr.replaceAll("_", " ");
      pathHistory.push(formatCurr);
      // A reference to pathTree, to edit/view contents of pathTree at specific point
      let pointer = obj;
      pathHistory.forEach((p, idx) => {
        if (idx === 0 && Object.keys(obj).length === 0) {
          // The first node insert
          pointer["title"] = p;
          pointer["children"] = [];
        } else if (getIndex(pointer, p) === -1) {
          // Creating a node's child
          let newChild = {
            title: p,
            children: [],
          };
          pointer["children"].push(newChild);
        }
        const indexChild = getIndex(pointer, p);
        if (indexChild > -1) {
          pointer = pointer["children"][indexChild];
        }
      });
    }
  }

  /* Render the pathTree object as an unordered list */
  function ListItem({ item }) {
    let title = item["title"];
    let children = item["children"];
    return (
      <li role='alert'>
        {title}
        {children &&
          children.map((childObj) => {
            return (
              <ul style={{ marginTop: 5, marginBottom: 5 }} role='alert'>
                <ListItem item={childObj} />
              </ul>
            );
          })}
      </li>
    );
  }

  return (
    <Box
      gridArea={gridArea}
      direction="column"
      border={true}
      width={{ min: "500px" }}
      height={{ min: "150px" }}
      margin={{ right: "xlarge" }}
    >
      {state.studentData && (
        <>
          <Text margin={{ top: "small" }} textAlign="center" weight="bold" role='alert'>
            {enrollmentMessage}
          </Text>
          {state.chosenPaths && state.chosenPaths.length > 0 && (
            <Box margin="small">
              Current chosen paths:{" "}
              <ListItem item={formatPathList(state.chosenPaths)} />
            </Box>
          )}
          {state.environment === "development" && (
            <>
              {state.start && (
                <Text margin="small" role='alert'>
                  Start Date: {moment(state.start).format("MMM Do YYYY")}
                </Text>
              )}
              {state.end && (
                <Text margin={{ horizontal: "small", bottom: "small" }} role='alert'>
                  End Date: {moment(state.end).format("MMM Do YYYY")}
                </Text>
              )}
            </>
          )}
          {state.chosenTag && (
            <Text margin={{ horizontal: "small", bottom: "small" }} role='alert'>
              Metatag: {state.chosenTag}
            </Text>
          )}
          {!hasFilter && (
            <Text alignSelf="center" margin={{ top: "large" }} size="medium" role='alert'>
              No filters have been chosen.
            </Text>
          )}
          {!state.reset && hasFilter && (
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
              <Text margin="medium" role='alert'>
                Please hit apply for the changes to take effect.
              </Text>
              <Button
                primary
                label="Apply"
                disabled={state.disableFilterReset}
                onClick={() =>
                  handleClick(state, setState, "filterReset", queryVariables)
                }
                color="#022851"
                margin={{
                  bottom: "small",
                  top: "small",
                  horizontal: "large",
                }}
              />
            </Box>
          )}
        </>
      )}
      {state.disable && (!state.studentData || !state.display) && (
        <InfoBox
          infoText={infoText.loadingMessage}
          queryVariables={queryVariables}
          showIcon={true}
          icon={<Spinner />}
        />
      )}
    </Box>
  );
}
