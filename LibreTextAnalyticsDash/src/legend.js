import { Box, CheckBox, Text, Button } from "grommet";

export default function Legend({
  state,
  setState,
  handleClick,
  queryVariables
}) {
  return (
    <Box
      direction="column"
      alignSelf="start"
      border={true}
      width="325px"
      height="180px"
      gridArea="legend"
      margin={{ bottom: "small"}}
    >
      <Box direction="row">
        <Box
          margin={{ left: "small", bottom: "small", top: "small" }}
          border={true}
          height="30px"
          width="40px"
          background="rgb(255, 255, 158, .5)"
        />
        <Text
          margin={{ left: "small", bottom: "small", top: "small" }}
        >
          LibreText Data
        </Text>
      </Box>
      <Box direction="row">
        <Box
          margin={{ left: "small", bottom: "small" }}
          border={true}
          height="30px"
          width="40px"
          background="rgb(171, 247, 177, .5)"
        />
        <Text margin={{ left: "small", bottom: "small" }}>
          Adapt Data
        </Text>
      </Box>
      <Box direction="row">
        <Box
          margin={{ left: "small", bottom: "small" }}
          border={true}
          height="30px"
          width="40px"
          background="gainsboro"
        />
        <Text margin={{ left: "small", bottom: "small" }}>
          Not Enrolled in Course
        </Text>
      </Box>
      <Box direction="row">
        <Text weight="bold" margin={{ left: "small", bottom: "small"}}>
          Enrolled with No Data
        </Text>
      </Box>
    </Box>
  )
}
