import { Box, Text, Button, Spinner } from "grommet";
import {
  filterReset
} from "./helperFunctions.js";
import { handleClick } from "./dataFetchingFunctions.js";
import InfoBox from "./infoBox.js";
import { infoText } from "./allInfoText.js";
import moment from "moment";

export default function ChosenFilters({
  state,
  setState,
  gridArea,
  queryVariables
}) {
  var hasFilter = state.chosenPaths || state.start || state.end || state.chosenTag

  return (
      <Box
        gridArea={gridArea}
        direction="column"
        border={true}
        width={{ min: "500px" }}
        height={{min: "150px"}}
        margin={{right: "xlarge"}}
      >
      {state.studentData &&
        <>
        {state.chosenPaths && (
          <Text margin="small">
            Current chosen paths:{" "}
            {(state.chosenPaths).map((a) => (
              a.split("/").map((b, idx) => {
                var item = (
                  <li>
                    {b.replaceAll("_", " ")}
                  </li>
                )
                for(var i = 0; i < idx; i++) {
                  item = (
                    <ul>
                      {item}
                    </ul>
                  )
                }
                return item
              })
            ))}
            {/* {state.chosenPaths.split("/").map((a) => (
              <li>{a.replaceAll("_", " ")}</li>
            ))} */}
          </Text>
        )}
        {state.start && (
          <Text margin="small">
            Start Date: {moment(state.start).format("MMM Do YYYY")}
          </Text>
        )}
        {state.end && (
          <Text margin={{horizontal: "small", bottom: "small"}}>
            End Date: {moment(state.end).format("MMM Do YYYY")}
          </Text>
        )}
        {state.chosenTag && (
          <Text margin={{horizontal: "small", bottom: "small"}}>
            Metatag: {state.chosenTag}
          </Text>
        )}
        {!hasFilter && !state.chosenPaths &&
          <Text alignSelf="center" margin={{top: "large"}} size="medium">
            No filters have been chosen.
          </Text>
        }
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
            <Text margin="medium">
              Please hit apply for the changes to take effect.
            </Text>
            <Button
              primary
              label="Apply"
              disabled={state.disableFilterReset}
              onClick={() => handleClick(state, setState, "filterReset", queryVariables)}
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
      }
        {state.disable && (!state.studentData || !state.display) && (
          <InfoBox
            infoText={infoText.loadingMessage}
            showIcon={true}
            icon={<Spinner />}
          />
        )}
      </Box>
    )
}
