import React from "react";
import { CSVLink } from "react-csv";
import { Button } from "grommet";
import { Download } from "grommet-icons";

//creates a csv download button
export default function DataToCSV({ data, filename, headers }) {
  return (
    <div>
      {data && (
        <CSVLink data={data} headers={headers} filename={filename}>
          <Button secondary icon={<Download />} />
        </CSVLink>
      )}
    </div>
  );
}
