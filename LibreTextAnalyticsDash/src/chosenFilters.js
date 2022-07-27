import { Box, Text, Button } from "grommet";
import {
  filterReset,
  applyReset
} from "./filterFunctions.js";

export default function ChosenFilters({
  state,
  setState,
  gridArea
}) {

  return (
      <Box
        gridArea={gridArea}
        direction="column"
        border={true}
        width={{ min: "500px" }}
        height={{min: "150px"}}
        margin={{right: "xlarge"}}
      >
        {state.chosenPath && (
          <Text margin="small">
            Current chosen path:{" "}
            {state.chosenPath.split("/").map((a) => (
              <li>{a.replaceAll("_", " ")}</li>
            ))}
          </Text>
        )}
        {state.start && (
          <Text margin="small">
            Start Date: {new Date(state.start.split("T")[0]).toString()}
          </Text>
        )}
        {state.end && (
          <Text margin="small">
            End Date: {new Date(state.end.split("T")[0]).toString()}
          </Text>
        )}
        {!state.reset && (
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
            <Text margin="medium">
              Please hit apply for the changes to take effect.
            </Text>
            <Button
              primary
              label="Apply"
              onClick={() => applyReset(state, setState)}
              color="#022851"
              margin={{
                bottom: "small",
                top: "small",
                horizontal: "large",
              }}
            />
          </Box>
        )}
      </Box>
    )
}
