import { Box, Button, Text, DateInput, Collapsible, CheckBox, Spinner } from "grommet";
import InfoBox from "./collapsible_info_box.js";
import MultiSelect from "./multiSelect.js";
import TitleText from "./titleWithInfo.js";
import DataFilterText from "./dataFilterText.js";
import { clearDates } from "./filterFunctions.js";
import {
  filterReset,
  applyReset
} from "./filterFunctions.js";
import "./index.css";

export default function DataFilters({
  state,
  setState,
  handleChange,
  handleClick,
  infoText,
  queryVariables,
  handleFilterClick,
  menuCollapsible
}) {

  return (
    <Box gridArea="filters" direction="column">
    {
    //   state.studentData && (
    //   <Box>
    //     <Button
    //       margin="medium"
    //       color="#022851"
    //       label="Data Filters"
    //       onClick={() => setState({...state, showTableFilters: !state.showTableFilters})}
    //     />
    //   </Box>
    // )
  }
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
            border={true}
            direction="column"
            height="500px"
            width="600px"
            margin={{ left: "xlarge" }}
          >
          <Box
            direction="column"
          >
            <Box
              margin={{ bottom: "medium", top: "xsmall" }}
              direction="column"
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
                margin={{ top: "small" }}
                width="500px"
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
              </Box>
              <Box direction="row" alignSelf="center" pad="small">
                <Button
                  size="small"
                  margin={{
                    bottom: "small",
                    top: "medium",
                    horizontal: "medium",
                  }}
                  label="Clear Dates"
                  onClick={clearDates}
                  color="#022851"
                />
                <Button
                  label="Apply"
                  margin={{ top: "small" }}
                  style={{ height: 45 }}
                  primary
                  color="#0047BA"
                  disabled={state.disable}
                  onClick={() => handleFilterClick(state, setState)}
                />
              </Box>
            </Box>
            <CheckBox
              label="Include Non-enrolled Students"
              checked={state.showNonEnrolledStudents}
              pad={{left: "large", bottom: "small"}}
              onClick={() => setState({...state, showNonEnrolledStudents: !state.showNonEnrolledStudents})}
            />
            <CheckBox
              label="Hide Student Emails"
              checked={state.displayMode}
              pad={{left: "large", top: "small"}}
              onClick={() => setState({...state, displayMode: !state.displayMode})}
            />
            {((state.start || state.end)) && (
              <Box margin={{top: "medium"}}>
                {state.disable && (!state.studentData || !state.display) && (
                  <InfoBox
                    infoText={infoText.loadingMessage}
                    showIcon={true}
                    icon={<Spinner />}
                  />
                )}
                {state.display && (
                  <DataFilterText
                    data={state.studentData}
                  />
                )}
              </Box>
            )}
            </Box>
          </Box>
        </Box>
      </>
    </Box>
  )
}
