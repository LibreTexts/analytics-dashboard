import {
  Box,
  Button,
  Text,
  DateInput,
  Collapsible,
  CheckBox,
  Spinner,
} from "grommet";
import {
  handleClick,
  clearTags,
} from "./filterFunctions.js";
import SelectWithApply from "./selectWithApply.js";

export default function MetaTagFilter({ state, setState, queryVariables }) {
  function setTag(type, option, state, setState, courses, queryVariables) {
    setState({...state, chosenTag: option})
  }
  return (
    <Box 
      gridArea="metatag" 
      direction="column"
      margin={{ left: "xlarge" }}
    >
      <Box>
        <Text
          size="large"
          weight="bold"
          textAlign="center"
          margin={{ left: "small", top: "small" }}
        >
          {" "}
          Metatag Filters{" "}
        </Text>
      </Box>
      {state.tagData && 
        <SelectWithApply
          selectOptions={state.tagData}
          value={state.chosenTag}
          dropdownFunction={setTag}
          clickFunction={handleClick}
          type="refresh"
          state={state}
          setState={setState}
          queryVariables={queryVariables}
        />
      }
      <Button
        size="small"
        margin={{
          bottom: "small",
          top: "medium",
          horizontal: "medium",
        }}
        label="Clear Tag Filter"
        onClick={() => clearTags(state, setState)}
        color="#022851"
      />
    </Box>
  )
}
