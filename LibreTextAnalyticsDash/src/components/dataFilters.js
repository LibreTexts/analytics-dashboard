import {
  Box,
  Button,
  Text,
  DateInput,
  CheckBox,
  Spinner,
  Select,
} from "grommet";
import { useState } from "react";
import { handleClick } from "../functions/dataFetchingFunctions.js";
import { handleChange } from "../functions/handleChangeFunction.js";
import { clearDates, clearTags, writeToLocalStorage } from "../functions/helperFunctions.js";
import ParseRoster from "./parseRoster.js";
import DataFilterText from "./dataFilterText.js";
import InfoBox from "./infoBox.js";
import infoText from "./allInfoText.js";
import "../css/index.css";

function updateDisplayMode(state, setState) {
  var display = state.displayMode;
  setState({
    ...state,
    displayMode: !display,
    student: null,
    studentAssignments: null,
    textbookEngagementData: null,
    individualAssignmentSubmissions: null,
    studentForChapterChart: null,
    individualChapterData: null
  });
  var courseData = JSON.parse(localStorage.getItem(state.courseId+"-"+state.start+"-filters"));
  courseData["displayMode"] = !display;
  writeToLocalStorage(state.courseId+"-"+state.start.toString()+"-filters", courseData);
}

//shows all of the possible filters that can be applied to the data
export default function DataFilters({
  state,
  setState,
  queryVariables,
  noEnrollmentData,
}) {
  const [options, setOptions] = useState(state.tagData);

  return (
    <Box gridArea="filters" direction="column">
      {!state.showTableFilters &&
        state.studentData &&
        state.pageData &&
        queryVariables.count === 0 && (
          <InfoBox
            count={queryVariables.count}
            setCount={queryVariables.setCount}
            queryVariables={queryVariables}
            infoText={infoText.dataFilter}
            color="#b0e0e6"
            height="150px"
          />
        )}
      <>
        <Box direction="column">
          <Box
            direction="column"
            height="1000px"
            width="600px"
            margin={{ left: "xlarge" }}
          >
            <Box direction="column">
              <Box
                margin={{ bottom: "medium", top: "xsmall" }}
                direction="column"
                border={true}
              >
                <Box>
                  <Text
                    size="large"
                    weight="bold"
                    textAlign="center"
                    margin={{ left: "small", top: "small" }}
                    id="data-filters"
                    tabIndex="0"
                  >
                    {" "}
                    Data Filters{" "}
                  </Text>
                </Box>
                {state.environment === "development" && (
                  <Box
                    pad="small"
                    direction="row"
                    width="550px"
                    alignSelf="center"
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
                    <Button
                      size="small"
                      margin={{
                        left: "medium",
                      }}
                      style={{ height: 50, width: 75 }}
                      label="Reset Dates"
                      onClick={() => clearDates(state, setState)}
                      color="#0047BA"
                    />
                  </Box>
                )}
                {state.tagData && (
                  <>
                    <Box
                      pad="small"
                      direction="row"
                      width="550px"
                      justify="center"
                    >
                      <Box direction="row">
                        <Text
                          size="medium"
                          textAlign="center"
                          margin={{ vertical: "medium", right: "small" }}
                        >
                          Metatags:
                        </Text>
                        <Select
                          style={{ height: 50 }}
                          margin={{ vertical: "small" }}
                          options={options}
                          value={state.chosenTag}
                          onChange={({ value }) => {
                            handleChange("chosenTag", value, state, setState);
                            setOptions(state.tagData);
                          }}
                          onClose={() => {
                            setOptions(state.tagData);
                          }}
                          onSearch={(text) => {
                            const escapedText = text.replace(
                              /[-\\^$*+?.()|[\]{}]/g,
                              "\\$&"
                            );
                            const exp = new RegExp(escapedText, "i");
                            setOptions(
                              state.tagData.filter((o) => exp.test(o))
                            );
                          }}
                        />
                        <Button
                          size="small"
                          margin={{
                            left: "medium",
                            vertical: "small",
                          }}
                          label="Clear Tag Filter"
                          onClick={() => clearTags(state, setState)}
                          color="#022851"
                        />
                      </Box>
                    </Box>
                    {state.environment === "development" && (
                      <Box width="100%" alignSelf="center">
                        <ParseRoster state={state} setState={setState} />
                      </Box>
                    )}
                  </>
                )}
                <Box direction="row" alignSelf="center" pad="small">
                  <Button
                    label="Apply"
                    margin={{ top: "small" }}
                    style={{ height: 35, width: 120 }}
                    primary
                    color="#0047BA"
                    disabled={state.disable}
                    onClick={() =>
                      handleClick(
                        state,
                        setState,
                        "filters",
                        queryVariables,
                        false,
                        true
                      )
                    }
                  />
                </Box>
              </Box>
              <Box border={true}>
                <InfoBox
                  infoText={infoText.toggleText}
                  color="#b0e0e6"
                  queryVariables={queryVariables}
                />
                <CheckBox
                  label={
                    state.accessibilityMode
                      ? "Toggle to Charts"
                      : "Toggle to Tables"
                  }
                  checked={state.accessibilityMode}
                  pad={{ left: "large", bottom: "small" }}
                  toggle={true}
                  onClick={() =>
                    setState({
                      ...state,
                      accessibilityMode: !state.accessibilityMode,
                    })
                  }
                />
                <CheckBox
                  label="Include Non-enrolled Students"
                  checked={state.showNonEnrolledStudents}
                  pad={{ left: "large", bottom: "small", top: "small" }}
                  toggle={true}
                  onClick={() =>
                    setState({
                      ...state,
                      showNonEnrolledStudents: !state.showNonEnrolledStudents,
                    })
                  }
                />
                <CheckBox
                  label="Hide Student Emails"
                  checked={state.displayMode}
                  pad={{ left: "large", top: "small" }}
                  toggle={true}
                  onClick={() => updateDisplayMode(state, setState) }
                />
                <Box margin={{ top: "medium" }}>
                  {state.disable && (!state.studentData || !state.display) && (
                    <InfoBox
                      infoText={infoText.loadingMessage}
                      queryVariables={queryVariables}
                      showIcon={true}
                      icon={<Spinner />}
                    />
                  )}
                  {state.display && (
                    <DataFilterText
                      data={state.studentData}
                      noEnrollmentData={noEnrollmentData}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </>
    </Box>
  );
}
