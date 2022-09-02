import HeaderGrid from "./headerGrid.js";
import { Grid, Box, Text } from "grommet";
import DataFilters from "./dataFilters.js";
import TitleText from "./titleText.js";
import MultiSelect from "./multiSelect.js";
import { infoText } from "./allInfoText.js";
import {
  handleClick
} from "./dataFetchingFunctions.js";
import {
  handleChange
} from "./handleChangeFunction.js";

export default function FilterView({ state, setState, queryVariables }) {
  return (
    <>
      <HeaderGrid
        state={state}
        setState={setState}
        queryVariables={queryVariables}
        data={true}
      />
      <Grid
        fill={true}
        rows={["auto", "auto"]}
        columns={["50%", "50%"]}
        gap="small"
        areas={[
          { name: "filters", start: [0, 0], end: [0, 0] },
          { name: "dropdown", start: [1, 0], end: [1, 0] },
          { name: "metatag", start: [1, 1], end: [1, 1] },
        ]}
        flex={true}
        responsive={true}
        overflow="hidden"
        justifyContent="center"
      >
        {queryVariables.click && (
          <>
            <DataFilters
              state={state}
              setState={setState}
              queryVariables={queryVariables}
            />
            {state.allChapters && state.ltCourse && (
              <Box
                width="500px"
                border={state.resetPath}
                margin={{ left: "xlarge" }}
                gridArea="dropdown"
              >
                {!state.resetPath && (
                  <TitleText
                    title="Course Structure Dropdown"
                    text={infoText.courseStructureDropdown}
                  />
                )}
                {state.resetPath && (
                  <Text margin="medium">
                    Please hit apply for the changes to take effect.
                  </Text>
                )}
                <MultiSelect
                  resetPath={state.resetPath}
                  pathLength={state.pathLength}
                  data={state.allChapters}
                  levels={state.courseLevel}
                  handleChange={handleChange}
                  filterClick={handleClick}
                  init={state.dataPath}
                  state={state}
                  setState={setState}
                  queryVariables={queryVariables}
                />
              </Box>
            )}
          </>
        )}
      </Grid>
    </>
  );
}
