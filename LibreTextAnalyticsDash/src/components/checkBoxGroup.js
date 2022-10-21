import { CheckBox, Box } from "grommet";

//component to format checkboxes so they can be horizonal and spaced out
export default function CheckBoxGroup({
  tableColumns,
  changeColumns,
  state,
  setState,
}) {
  function getChecks(data, startIndex, endIndex) {
    var checks = [];
    Object.keys(data).forEach((c) => {
      checks.push(
        <CheckBox
          key={c}
          label={c}
          a11yTitle={c}
          pad="small"
          checked={data[c]}
          onChange={(event) => changeColumns(event, c, state, setState)}
        />
      );
    });
    return <>{checks.splice(startIndex, endIndex + 1)}</>;
  }
  var index = 5;
  if (!state.ltCourse) {
    index = 4;
  }
  return (
    <Box
      direction="column"
      height="100%"
      width="95%"
      alignSelf="end"
      margin={{ top: "small" }}
    >
      <Box direction="row">{getChecks(tableColumns, 0, index)}</Box>
      {Object.keys(tableColumns).length > index && (
        <Box direction="row">{getChecks(tableColumns, index + 1, 10)}</Box>
      )}
    </Box>
  );
}
