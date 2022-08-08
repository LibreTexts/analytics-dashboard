import { CheckBox, Box } from "grommet";

export default function CheckBoxGroup({ tableColumns, changeColumns, state, setState }) {
  function getChecks(data, startIndex, endIndex) {
    var checks = [];
    //use function here to not remake checkboxes each time
    Object.keys(data).forEach((c) => {
      checks.push(
        <CheckBox
          label={c}
          pad="small"
          checked={data[c]}
          onChange={(event) =>
            changeColumns(event, c, state, setState)
          }
        />
      );
    });
    return <>{checks.splice(startIndex, endIndex)}</>;
  }

  return (
    <Box direction="column" height="100%" width="95%" alignSelf="end" margin={{top: "small"}}>
      <Box direction="row">{getChecks(tableColumns, 0, 5)}</Box>
      {Object.keys(tableColumns).length > 6 && (
        <Box direction="row">{getChecks(tableColumns, 6, 10)}</Box>
      )}
    </Box>
  );
}
