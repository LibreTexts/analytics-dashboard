import { Text, Box } from "grommet";
export default function DataFilterText({
    data,
    noEnrollmentData
}) {
    let s_with_data = 0;
    let s_without_data = 0;

    data.forEach(s => {
        if (s.hasData === true) {
            s_with_data += 1;
        } else {
            s_without_data += 1;
        }
    })

    return(
        <Box
            border={true}
            pad={"small"}
            alignSelf={"center"}
        >
            <Text>
                If the table appears empty, try sorting by Most Recent Page Load
            </Text>
            <Text>
                Number of Students with Data: {s_with_data}
            </Text>
            <Text>
                Number of Students without Data: {s_without_data}
            </Text>
            {false && noEnrollmentData &&
              <Text weight="bold">
                This course has no enrollment data available.
              </Text>
            }
        </Box>
    )
}
