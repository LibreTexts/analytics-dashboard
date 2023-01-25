import React, { useState } from "react";
import Papa from "papaparse";
import { Box, Button, FileInput, Text } from "grommet";
import { Checkmark, FormClose, Upload } from "grommet-icons";

// Allowed extensions for input file
const allowedExtensions = ["csv", "numbers"];

export default function ParseRoster({ state, setState }) {
  // This state will store the parsed data
  const [data, setData] = useState([]);

  // It state will contain the error when
  // correct file extension is not used
  const [error, setError] = useState("");

  // It will store the file uploaded by the user
  const [file, setFile] = useState(state.rosterFile ? state.rosterFile : "");

  const [label, setLabel] = useState("Upload");
  const [icon, setIcon] = useState(<Upload />);
  const [removeFileLabel, setRemoveFileLabel] = useState(false);

  // This function will be called when
  // the file input changes
  const handleFileChange = (e) => {
    setError("");
    var courseData = JSON.parse(
      localStorage.getItem(state.courseId + "-"+state.start.getTime()+"-filters")
    );

    // Check if user has entered the file
    if (e.target.files.length) {
      const inputFile = e.target.files[0];

      // Check the file extensions, if it not
      // included in the allowed extensions
      // we show the error
      const fileExtension = inputFile?.name.split(".")[1];
      if (!allowedExtensions.includes(fileExtension)) {
        setError("Please input a csv file");
        return;
      }

      setState({
        ...state,
        rosterFilterApplied: false,
        roster: null,
        rosterFile: null,
      });
      // If input type is correct set the state
      setFile(inputFile);
      setLabel("Upload");
      setIcon(<Upload />);
      setRemoveFileLabel(false);
    } else if (e.type === "input") {
      setState({
        ...state,
        roster: null,
        rosterFile: null,
        rosterFilterApplied: false,
      });
      setFile(null);
      setLabel("Upload");
      setIcon(<Upload />);
      setRemoveFileLabel(false);
      courseData["roster"] = null;
      courseData["rosterFile"] = null;
      localStorage.setItem(
        state.courseId + "-"+state.start.getTime()+"-filters",
        JSON.stringify(courseData)
      );
    }
  };

  //need to parse the file data after it's been uploaded
  function handleParse(state, setState) {
    // If user clicks the parse button without
    // a file we show a error
    if (!file) return setError("Enter a valid file");

    // Initialize a reader which allows user
    // to read any file or blob.
    const reader = new FileReader();
    var courseData = JSON.parse(
      localStorage.getItem(state.courseId + "-"+state.start.getTime()+"-filters")
    );

    // Event listener on reader when the file
    // loads, we parse it and set the data.
    reader.onload = async ({ target }) => {
      const csv = Papa.parse(target.result, {
        header: true,
        transformHeader: function (h) {
          return h.toLowerCase();
        },
      });
      const parsedData = csv?.data;
      //we only need the emails from the roster file to check against the lt and adapt data
      var emails = [];
      parsedData.forEach((row) => {
        emails.push(row.email);
      });
      setState({
        ...state,
        roster: emails,
        rosterFile: file.name,
        disable: false,
      });
      courseData["roster"] = emails;
      courseData["rosterFile"] = file.name;
      localStorage.setItem(
        state.courseId + "-"+state.start.getTime()+"-filters",
        JSON.stringify(courseData)
      );
      const columns = Object.keys(parsedData[0]);
      setData(columns);
      setLabel("Success");
      setIcon(<Checkmark />);
    };
    reader.readAsText(file);
  }

  //removing the roster data so the data can be reloaded without it
  function removeFile(state, setState) {
    setData(null);
    setFile(null);
    setLabel("Upload");
    setIcon(<Upload />);
    setRemoveFileLabel(true);
    setState({
      ...state,
      roster: null,
      rosterFile: null,
      disable: false,
    });
  }

  return (
    <Box direction="column">
      <Text
        margin={{ right: "medium", bottom: "small" }}
        size="medium"
        weight="bold"
        textAlign="center"
      >
        Upload Class Roster
      </Text>
      <Box direction="row" justify="center">
        <FileInput name="file" multiple={false} onChange={handleFileChange} disabled={state.rosterFilterApplied}/>
        <Button
          onClick={() => handleParse(state, setState)}
          margin={{ left: "medium" }}
          icon={icon}
          label={label}
          color="black"
        />
      </Box>
      {state.rosterFile && !state.rosterFilterApplied && (
        <Text textAlign="center">
          {state.rosterFile +
            " has been successfully uploaded. Please click apply."}
        </Text>
      )}
      {state.rosterFile && state.rosterFilterApplied && (
        <Box direction="column" margin={{ top: "small" }}>
          <Box direction="row" align="center" justify="center">
            <Button
              icon={<FormClose />}
              onClick={() => removeFile(state, setState)}
            />
            <Text textAlign="center">{state.rosterFile}</Text>
          </Box>
          <Text textAlign="center">
            {state.rosterFile +
              " has been successfully connected to the student activity data."}
          </Text>
        </Box>
      )}
      {removeFileLabel && (
        <Text textAlign="center" margin={{ top: "small" }}>
          Hit apply to remove the roster file from the student data.
        </Text>
      )}
    </Box>
  );
}
