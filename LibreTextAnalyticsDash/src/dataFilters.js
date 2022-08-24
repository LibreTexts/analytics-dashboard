import {
  Box,
  Button,
  Text,
  DateInput,
  CheckBox,
  Spinner,
  Select,
} from "grommet";
import InfoBox from "./infoBox.js";
import DataFilterText from "./dataFilterText.js";
import SelectWithApply from "./selectWithApply.js";
import {
  handleClick,
} from "./dataFetchingFunctions.js";
import { handleChange } from "./handleChangeFunction.js";
import {
  clearDates,
  clearTags
} from "./helperFunctions.js";
import { infoText } from "./allInfoText.js";
import "./index.css";

export default function DataFilters({ state, setState, queryVariables }) {
  let noEnrollmentData = false;

  if (state.studentData) {
    state.studentData.forEach(student => {
      if (student.isEnrolled === "N/A") {
        noEnrollmentData = true;
      }
    })
  }

  return (
    <Box gridArea="filters" direction="column">
      {!state.showTableFilters &&
        state.studentData &&
        state.pageData &&
        queryVariables.count === 0 && (
          <InfoBox
            count={queryVariables.count}
            setCount={queryVariables.setCount}
            infoText={infoText.dataFilter}
            color="#b0e0e6"
          />
        )}
      <>
        <Box direction="column">
          <Box
            direction="column"
            height="625px"
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
                  >
                    {" "}
                    Data Filters{" "}
                  </Text>
                </Box>
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
                <Box>
                  <Text
                    size="medium"
                    weight="bold"
                    textAlign="center"
                    margin={{ top: "small" }}
                  >
                    Metatag Filters
                  </Text>
                </Box>
                <Box
                  pad="small"
                  direction="row"
                  width="550px"
                  justify="center"
                >
                  {state.tagData &&
                    <Box direction="row">
                      <Select
                        style={{ height: 45 }}
                        margin={{ vertical: "small" }}
                        options={state.tagData}
                        value={state.chosenTag}
                        onChange={({ value }) =>
                          handleChange("chosenTag", value, state, setState)
                        }
                      />
                      <Button
                        size="small"
                        margin={{
                          left: "medium",
                          vertical: "small"
                        }}
                        label="Clear Tag Filter"
                        onClick={() => clearTags(state, setState)}
                        color="#022851"
                      />
                    </Box>

                  }
                </Box>
                <Box direction="row" alignSelf="center" pad="small">
                  <Button
                    label="Apply"
                    margin={{ top: "small" }}
                    style={{ height: 35, width: 120 }}
                    primary
                    color="#0047BA"
                    disabled={state.disable}
                    onClick={() => handleClick(state, setState, "filters", queryVariables, false, true)}
                  />
                </Box>
              </Box>
              <Box border={true}>
              <InfoBox
                infoText={infoText.toggleText}
                color="#b0e0e6"
              />
              <CheckBox
                label="Include Non-enrolled Students"
                checked={state.showNonEnrolledStudents}
                pad={{ left: "large", bottom: "small" }}
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
                onClick={() =>
                  setState({ ...state, displayMode: !state.displayMode })
                }
              />
              {(state.start || state.end || noEnrollmentData) && (
                <Box margin={{ top: "medium" }}>
                  {state.disable && (!state.studentData || !state.display) && (
                    <InfoBox
                      infoText={infoText.loadingMessage}
                      showIcon={true}
                      icon={<Spinner />}
                    />
                  )}
                  {state.display && <DataFilterText data={state.studentData} noEnrollmentData={noEnrollmentData} />}
                </Box>
              )}
              </Box>
            </Box>
          </Box>
        </Box>
      </>
    </Box>
  );
}
