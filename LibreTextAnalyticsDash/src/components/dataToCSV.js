import React from "react";
import { CSVLink } from "react-csv";
import { Button, Box } from "grommet";
import { Download } from "grommet-icons";

//creates a csv download button
export default function DataToCSV({ data, filename, headers, separator, type }) {
  var margin = {bottom: "medium", left: "small"};
  // if (type === "chapterData") {
  //   margin = {bottom: "medium", left: "large"};
  // }
  return (
    <Box margin={margin} width="4%">
      {data && (
        <CSVLink data={data} headers={headers} filename={filename} separator={separator}>
          <Download />
        </CSVLink>
      )}
    </Box>
  );
}
