import React from "react";
import { CSVLink } from "react-csv";
import { Box } from "grommet";
import { Download } from "grommet-icons";

//creates a csv download button
export default function DataToCSV({ data, filename, headers, separator, type, accessibilityMode=false }) {
  var margin = {bottom: "medium", left: "small"};
  if (type === "chapterData") {
    margin = {top: "large", left: "small"};
  }
  return (
    <Box margin={margin} width={!accessibilityMode ? "4%" : "6%"} border={accessibilityMode}>
      {data && (
        <CSVLink data={data} headers={headers} filename={filename}>
          {!accessibilityMode ? <Download /> : "Download"}
        </CSVLink>
      )}
    </Box>
  );
}
