
import React from 'react';
import {useEffect, useState, useRef} from 'react';
import "react-table-6/react-table.css";
import { Grommet, Heading, Box, Button, CheckBox, CheckBoxGroup, Collapsible, DateInput, Grid, Layer, Notification, Select, Spinner, Tabs, Tab, Text } from 'grommet';
import { Close, Filter, Menu} from "grommet-icons";
import ScatterPlot from "./scatterplot.js";
import './index.css';
import BarGraph from './bargraph.js';
import StudentChart from './studentChart.js';
import PageViews from './totalPageViewsChart.js';
import TitleText from './titleWithInfo.js';
import DataTable from './data_table.js';
import AdaptTable from "./adaptTable.js";
import IndividualTimeline from "./individual_student_timeline.js";
import InfoBox from "./collapsible_info_box.js";
import MultiSelect from "./multiSelect.js";
import axios from 'axios';
import useResizeObserver from '@react-hook/resize-observer'

const theme = {
  global: {
   colors: {
     brand: '#022851',
   },
    font: {
      family: 'Roboto',
      size: '18px',
      height: '20px',
    },
  },
}

const useSize = (target) => {
  const [size, setSize] = React.useState()
  //console.log(target)
    React.useLayoutEffect(() => {
      //if (target.current && target.current.clientHeight !== null) {
        //setSize(target.current.getBoundingClientRect())
      //}
    }, [target])
    useResizeObserver(target, (entry) => setSize(entry.contentRect))
  return size
}

function App() {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [show, setShow] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [tab, setTab] = useState("student");
  const [individualStart, setIndividualStart] = useState(null);
  const [individualEnd, setIndividualEnd] = useState(null);
  const [disable, setDisable] = useState(false);
  const [disableCourse, setDisableCourse] = useState(false);
  const [disableStudent, setDisableStudent] = useState(false);
  const [disablePage, setDisablePage] = useState(false);
  const [disableAssignment, setDisableAssignment] = useState(false);
  const [allCourses, setAllCourses] = useState(null);
  const [allCourseNames, setAllCourseNames] = useState(null);
  const [course, setCourse] = useState(null);
  const [courseId, setCourseId] = useState(null);
  const [click, setClick] = useState(false);
  const [allPages, setAllPages] = useState(null);
  const [totalPageViews, setTotalPageViews] = useState(null);
  const [individualPageViews, setIndividualPageViews] = useState(null);
  const [individualAssignmentViews, setIndividualAssignmentViews] = useState(null);
  const [oneStudent, setOneStudent] = useState(null);
  const [onePage, setOnePage] = useState(null);
  const [studentDates, setStudentDates] = useState(null);
  const [pageDates, setPageDates] = useState(null);
  const [student, setStudent] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [result, setResult] = useState(null);
  const [studentResult, setStudentResult] = useState(null);
  const [pageResult, setPageResult] = useState(null);
  const [page, setPage] = useState(null);
  const [pageId, setPageId] = useState(null);
  const [value, setValue] = React.useState('Average Duration');
  const [valueY, setValueY] = React.useState('Unique Pages Accessed');
  const [xaxis, setXAxis] = React.useState('duration', 'Average Duration')
  const [classValue, setClassValue] = React.useState();
  const [scatterXAxis, setScatterXAxis] = React.useState('durationInMinutes');
  const [scatterYAxis, setScatterYAxis] = React.useState('objectCount');
  const [scatterXAxisLabel, setScatterXAxisLabel] = React.useState('Average Duration');
  const [scatterYAxisLabel, setScatterYAxisLabel] = React.useState('Unique Pages Accessed');
  const [barXAxis, setBarXAxis] = React.useState('dateCount');
  const [barYAxis, setBarYAxis] = React.useState('objectCount');
  const [barXAxisLabel, setBarXAxisLabel] = React.useState('Unique Interaction Days');
  const [barYAxisLabel, setBarYAxisLabel] = React.useState('Unique Pages Accessed');
  const [open, setOpen] = useState(true);
  const [index, setIndex] = useState(0);
  const [display, setDisplay] = useState(true);
  const [bin, setBin] = useState(1);
  const [binLabel, setBinLabel] = useState('Day');
  const [unit, setUnit] = useState('day');
  const [allData, setAllData] = useState({});
  const [width, setWidth] = useState();
  const [heigth, setHeight] = useState();
  const [pathLength, setPathLength] = useState();
  const [chapters, setChapters] = useState([]);
  const [chapterLabel, setChapterLabel] = useState(null);
  const [courseChapter, setCourseChapter] = useState(null);
  const [allChapters, setAllChapters] = useState(null);
  const [courseLevel, setCourseLevel] = useState(null);
  const [chosenPath, setChosenPath] = useState(null);
  const [dataPath, setDataPath] = useState(null);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [subject, setSubject] = useState(null);
  const [openFilter, setOpenFilter] = useState(false);
  const [studentChartData, setStudentChartData] = useState(null);
  const [reset, setReset] = useState(false);
  const [resetPath, setResetPath] = useState(false);
  const [adaptData, setAdaptData] = useState(null);
  const [tagData, setTagData] = useState(null);
  const [tagTypes, setTagTypes] = useState([]);
  const [tagType, setTagType] = useState(null);
  const [tagTitle, setTagTitle] = useState(null);
  const [realCourses, setRealCourses] = useState(null);
  const [courseName, setCourseName] = useState(null);
  const myRef = useRef();
  const target = React.useRef(null)
  const size = useSize(target)
  const [adaptCode, setAdaptCode] = useState(null)
  const [adaptLevels, setAdaptLevels] = useState({});
  const [levelGroup, setLevelGroup] = useState(null);
  const [levelName, setLevelName] = useState(null);
  const [hasAdapt, setHasAdapt] = useState(false)
  const [showInfoBox, setShowInfoBox] = useState(true)
  const [showTableFilters, setShowTableFilters] = useState(false)
  const [showCheckboxes, setShowCheckboxes] = useState(false)
  const [filterInfoBox, setFilterInfoBox] = useState(true)
  const [count, setCount] = useState(0)
  const [activityFilter, setActivityFilter] = useState("")
  const [tableColumns, setTableColumns] = useState({
    "All": true,
    "LT Unique Pages Accessed": true,
    "LT Total Page Views": true,
    "LT Most Recent Page Load": true,
    "LT Unique Interaction Days": true
  })
  const [checkedValues, setCheckedValues] = useState(Object.keys(tableColumns))
  var homepage = '/analytics/api'

  useEffect(() => {

     let realCourses = {}
     axios(homepage+'/realcourses')
       .then(response => {
         let x = {}
         response.data.forEach(course => {
           x[course.course] = course._id
         })
         realCourses = x
         setRealCourses(realCourses)
       })

    }, []);

  function getAggregateData() {
    var d = JSON.parse(JSON.stringify(allData)) // deep copy

    console.log(tab)
    if (tab === "student") {
      var group = "$actor.id"
    } else if (tab === "page") {
      var group = "$object.id"
    }
    axios({
      method: 'post',
      url: homepage+'/data',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        startDate: start,
        endDate: end,
        course: course,
        courseId: courseId,
        path: dataPath,
        groupBy: "$actor.id",
        tagType: tagType,
        tagTitle: tagTitle
      }
    }).then(response => {
      d['student'] = JSON.parse(response.data)['documents']
      setStudentResult(JSON.parse(response.data)['documents'])
      setDisplay(true);
      if ((Object.keys(d['student'][0])).includes("adapt") && d['student'][0]['adapt'] !== false) {
        setHasAdapt(true)
        var columns = {
          "All": true,
          "LT Unique Pages Accessed": true,
          "LT Total Page Views": true,
          "LT Most Recent Page Load": true,
          "LT Unique Interaction Days": true,
          "Adapt Unique Interaction Days": true,
          "Adapt Unique Assignments": true,
          "Adapt Most Recent Page Load": true
        }
        var checks = Object.keys(columns)
        setTableColumns(columns)
        setCheckedValues(checks)
      } else {
        var columns = {
          "All": true,
          "LT Unique Pages Accessed": true,
          "LT Total Page Views": true,
          "LT Most Recent Page Load": true,
          "LT Unique Interaction Days": true
        }
        var checks = Object.keys(columns)
        setTableColumns(columns)
        setCheckedValues(checks)
      }
    })

    axios({
      method: 'post',
      url: homepage+'/data',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        startDate: start,
        endDate: end,
        course: course,
        courseId: courseId,
        path: dataPath,
        groupBy: "$object.id",
        tagType: tagType,
        tagTitle: tagTitle
      }
    }).then(response => {
      d['page'] = JSON.parse(response.data)['documents']
      setPageResult(JSON.parse(response.data)['documents'])
      setDisplay(true);
    })
    setAllData(d)
  }

  function getIndividualData() {
    if (tab === "student") {
      var indiv = student
      var type = "student"
      var group = "$object.id"
    } else if (tab === "page") {
      var indiv = pageId
      var type = "page"
      var group = "$actor.id"
    }
    console.log(indiv)
    axios({
      method: 'post',
      url: homepage+'/individual',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        type: type,
        individual: indiv,
        startDate: individualStart,
        endDate: individualEnd,
        course: course,
        courseId: courseId,
        groupBy: group,
        path: dataPath
      }
    }).then(response => {
      if (tab === "student") {
        console.log("STUDENT")
        console.log(student)
        setStudentData(JSON.parse(response.data))
      } else if (tab === "page") {
        console.log("PAGE")
        console.log(page)
        //console.log(response.data)
        setPageData(JSON.parse(response.data))
      }
    })
  }

  function getObjectList() {
    let students = [];
    let pages = [];
    let pageWithTitle = [];
    var obj = {}
    if (tab === "student") {
      var group = "$actor.id"
    } else if (tab === "page") {
      var group = "$object.id"
    }
    axios({
      method: 'post',
      url: homepage+'/timelineData',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        course: course,
        courseId: courseId,
        groupBy: "$actor.id",
        path: dataPath
      }
    })
      .then(response => {
        var d = JSON.parse(response.data)['documents']

          setStudentDates(d);
          d.forEach(s => students.push(s._id))
          //setAllStudents(students);
          setStudentData(null);
        obj['allStudents'] = students
        setClick(true);
      })
      axios({
        method: 'post',
        url: homepage+'/timelineData',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          course: course,
          courseId: courseId,
          groupBy: "$object.id",
          path: dataPath
        }
      })
        .then(response => {
          var d = JSON.parse(response.data)['documents']
            setPageDates(d);
            d.forEach((s) => {
              if (s.pageTitle !== undefined) {
                pages.push(s.pageTitle);
              } else {
                pages.push(s._id);
              }
            })
            obj['allPages'] = pages
            setAllPages(pages)
            setPageData(null);
          setClick(true);
        })
  }

  function getStudentChartData() {
    setStudentChartData(null)
      axios({
        method: 'post',
        url: homepage+'/studentchart',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          course: course,
          courseId: courseId,
          groupBy: barXAxis,
          start: start,
          end: end,
          path: dataPath
        }
      })
        .then(response => {
          setStudentChartData(JSON.parse(response.data))
        })
  }

  function getAdaptLevels() {
    var levels = {}
    axios({
      method: 'post',
      url: homepage+'/adaptlevels',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        courseId: courseId
      }
    })
      .then(response => {
        JSON.parse(response.data).forEach(a => {
          var names = []
          a.level_name.forEach(o => names.push(o.replaceAll("\"", "")))
          levels[a._id.replaceAll("\"", "")] = names
        })
        //console.log(levels)
        setAdaptLevels(levels)
      })
  }

  function getPageViewData() {
    setTotalPageViews(null)
      axios({
        method: 'post',
        url: homepage+'/pageviews',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          bin: bin,
          unit: unit,
          course: course,
          courseId: courseId,
          start: start,
          end: end,
          path: dataPath
        }
      })
        .then(response => {
          console.log("PAGE VIEWS")
          setTotalPageViews(response.data)
        })
  }

  function getIndividualPageViewData() {
    setIndividualPageViews(null)
    if (tab == "page") {
      var p = page
      var lgroup = null
      var lname = null
    } else if (tab === "assignment") {
      var lgroup = levelGroup
      var lname = levelName
      var p = null
    }
      axios({
        method: 'post',
        url: homepage+'/individualpageviews',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          bin: bin,
          unit: unit,
          courseId: courseId,
          start: start,
          end: end,
          path: dataPath,
          individual: p,
          levelGroup: lgroup,
          levelName: lname
        }
      })
        .then(response => {
          if (tab === "page") {
            setIndividualPageViews(response.data)
          } else if (tab === "assignment") {
            setIndividualAssignmentViews(response.data)
          }
        })
  }

  function getChapters() {
    setChapters(null)
    let allChapters = []
    let chapter = {}
    let tree = []
      axios({
        method: 'post',
        url: homepage+'/chapters',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          course: course,
          courseId: courseId
        }
      })
        .then(response => {
          var d = []
          d = JSON.parse(response.data)
          var longestPath = d[0]['count']
          setPathLength(longestPath)
          d.forEach((element, index) => {
            element['chapter'].forEach((e, i) => {
              if (i !== element['chapter'].length-1 && !(i in chapter)) {
                chapter[i] = {}
              }
              if (i < element['chapter'].length-1) {
                if (!(e in chapter[i])) {
                  if (element['chapter'][i+1] !== {}) {
                    chapter[i][e] = [element['chapter'][i+1]]
                  }
                } else if (!chapter[i][e].includes(element['chapter'][i+1])){
                  if (element['chapter'][i+1] !== {}) {
                    chapter[i][e].push(element['chapter'][i+1])
                  }
                }
              }
            })
          })

          var levels = {}
          Object.keys(chapter).forEach(key => {
            Object.keys(chapter[key]).forEach(c => {
              levels[c] = key
            })
          })
          setCourseLevel(levels)
          setAllChapters(chapter)
          setChapters(allChapters.filter((v, i, a) => a.indexOf(v) === i))
        })

  }

  function getAdaptData() {
      axios({
        method: 'post',
        url: homepage+'/adapt',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          course: adaptCode,
          start: start,
          end: end,
          path: dataPath
        }
      })
        .then(response => {
          // console.log("ADAPT DATA")
          // console.log(response.data)
          allData['adapt'] = JSON.parse(response.data)['documents']
          //mergeLTAdaptData(allData['student'], JSON.parse(response.data)['documents'])
          //setAdaptData(JSON.parse(response.data)['documents'])
        })
  }

  function getTagInfo() {
      axios({
        method: 'post',
        url: homepage+'/tags',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          course: course,
          courseId: courseId,
          start: start,
          end: end,
          path: dataPath
        }
      })
        .then(response => {
          var data = JSON.parse(response.data)['documents']
          setTagData(data)
          var types = []
          var linkedData = {}
          data.forEach(d => {
            linkedData[d['_id']] = d['title']
          })
          if (data.length > 1) {
            data.forEach(d => {
              types.push(d['_id'])
            })
            //setTagTypes(types)
          } else {
            //setTagTypes(data[0]['_id'])
            types.push(data[0]['_id'])
          }
          setTagTypes(linkedData)
          console.log(linkedData)
        })
  }

  function handleClick(event) {
    event.preventDefault();
    if ((course || courseId) && !(course && courseId)) {
      setShowTableFilters(false)
      setShowInfoBox(false)
      setHasAdapt(false)
      setDisableCourse(true);
      setResult(null);
      setStudentResult(null);
      setPageResult(null);
      //setTab("student")
      // setIndividualStart(null);
      // setIndividualEnd(null);
      // setDisableStudent(false);
      //setTab("student");
      setStudent(null);
      setPage(null);
      setIndividualPageViews(null);
      setAdaptLevels(null);
      setAllChapters(null);
      setChosenPath(null);
      setDataPath(null);

      getAggregateData();
      getAdaptLevels();
      //getTagInfo();
      // if (course) {
      //   getAdaptData()
      // }
      //getAdaptData();
      getObjectList();
      getStudentChartData();
      getPageViewData();
      getChapters();
      // mergeLTAdaptData(allData['student'], allData['adapt'])
    } else if (course && courseId) {
      alert("Please choose either a course or a course Id.")
      setSubject(null)
      setCourse(null)
      setCategory(null)
      setCourseId(null)
    } else {
      alert("Please choose a course.")
    }
  }

  function handleFilterClick(event, path=false) {
    console.log("EVENT")
    console.log(event)
    console.log(path)

    event.preventDefault();
    setOpenFilter(false)
    if (path) {
      setChosenPath(path)
    }
    setShowTableFilters(false)
    setResetPath(false)
    setDisable(true);
    setDisplay(false);
    setStudentResult(null);
    setPageResult(null);
    setStudent(null);
    setPage(null);
    setStudentData(null);
    setPageData(null);
    setDisable((state) => {
      return state
    })
    setDisplay((state) => {
      return state
    })
    setStudentResult((state) => {
      return state
    })
    setPageResult((state) => {
      return state
    })
    console.log(chosenPath)
    //console.log(disable, display, studentResult)
    getAggregateData();
    getPageViewData();
    getStudentChartData();
    getObjectList();
  }

  function handleIndividual(event) {
    event.preventDefault();
    if (tab === "student") {
      if (!student) {
        alert("Please choose a student.")
      }
      setDisableStudent(true);
      setStudentData(null);
      studentDates.forEach(s => {
        if (s['_id'] === student) {
          setOneStudent(s);
        }
      })
    } else if (tab === "page") {
      // if (!pageId) {
      //   alert("Please choose a page.")
      // } else {
      //   setDisablePage(true);
      //   setPageData(null);
      //   console.log(pageId)
      //   pageDates.forEach(s => {
      //     if (s['_id'] === pageId) {
      //       setOnePage(s);
      //     }
      //   })
      // }
      setDisablePage(true)
    } else if (tab === "assignment") {
      setDisableAssignment(true)
    }
    //getIndividualData();
    getIndividualPageViewData()
  }

  function changeScatterXAxis(option) {
    setScatterXAxisLabel(option)
    if (option === 'Average Duration') {
      setScatterXAxis('durationInMinutes')
    } else if (option === 'Unique Pages Accessed') {
      setScatterXAxis('objectCount')
    } else if (option === 'Average Percent Scrolled') {
      setScatterXAxis('percentAvg')
    }
  }

  function changeScatterYAxis(option) {
    setScatterYAxisLabel(option)
    if (option === 'Average Duration') {
      setScatterYAxis('durationInMinutes')
    } else if (option === 'Unique Pages Accessed') {
      setScatterYAxis('objectCount')
    } else if (option === 'Average Percent Scrolled') {
      setScatterYAxis('percentAvg')
    }
  }

  function changeBarXAxis(option) {
    setBarXAxisLabel(option)
    if (option === 'Unique Interaction Days') {
      setBarXAxis('dateCount')
    } else if (option === 'Unique Pages Accessed') {
      setBarXAxis('objectCount')
    } else if (option === 'Most Recent Page Load') {
      setBarXAxis('lastDate')
    }
  }

  function changeBarYAxis(option) {
    setBarYAxisLabel(option)
    if (option === 'Unique Interaction Days') {
      setBarYAxis('dateCount')
    } else if (option === 'Unique Pages Accessed') {
      setBarYAxis('objectCount')
    } else if (option === 'Most Recent Page Load') {
      setBarYAxis('max')
    }
  }

  function changeBinVal(option) {
    setBinLabel(option)
    if (option === 'Day') {
      setUnit('day')
      setBin(1)
    } else if (option === 'Week') {
      setUnit('week')
      setBin(1)
    } else if (option === '2 Weeks') {
      setUnit('week')
      setBin(2)
    } else if (option === 'Month') {
      setUnit('month')
      setBin(1)
    }
  }

  function filterDates(allDates, date, type) {
    if (date) {
      return date
    } else if (type === "start" && allDates !== null) {
      allDates = allDates.filter(d => d !== undefined);
      (allDates.sort((a, b) => new Date(a).getTime()-new Date(b).getTime()))
      return allDates[0];
    } else if (type === "end" && allDates !== null) {
      allDates = allDates.filter(d => d !== undefined);
      (allDates.sort((a, b) => new Date(b)-new Date(a)))
      return allDates[0];
    }
  }

  function handleChange(type, value) {
    if (type === "start") {
      setStart(value);
      setDisable(false);
    }
    if (type === "end") {
      setEnd(value);
      setDisable(false);
    }
    if (type === "category") {
      setSubject(null)
      setCourse(null)
      setCourseId(null)
      setCategory(value)
    }
    if (type === "subject") {
      setCourse(null)
      setSubject(value)
    }
    if (type === "courseId") {
      setPage(null);
      setStudent(null);
      setDisableStudent(false);
      setDisablePage(false);
      setCourseName(value);
      setCourseId(realCourses[value]);
      setCategory(null)
      setSubject(null)
      setCourse(null)
      setDisableCourse(false)
      setChosenPath(null);
      setDataPath(null);
      setStart(null);
      setEnd(null);
    }
    if (type === "student") {
      setStudent(value);
      //setStudentData(null);
      // setIndividualStart(null);
      // setIndividualEnd(null);
      setDisableStudent(false);
    }
    if (type === "page") {
      // pagesWithTitles.forEach(p => {
      //   if (p[value] !== undefined) {
      //     setPage(p[value])
      //     console.log(p[value])
      //   }
      // })
      setPage(value);
      // setLevelGroup(null);
      // setLevelName(null);
      console.log(value)
      //allData['page'].map(obj => console.log(obj.pageTitle))
      var temp = (allData['page']).find(id => (id.pageTitle === value))
      console.log(temp)
      var pageId = temp._id
      setPageId(pageId)
      setPageData(null);
      // setIndividualStart(null);
      // setIndividualEnd(null);
      setDisablePage(false);
    } else if (type === "pageLevelGroup") {
      setLevelGroup(value);
      setLevelName(null);
      // setPage(null);
      // setPageId(null);
    } else if (type === "pageLevelName") {
      setIndividualAssignmentViews(null)
      setLevelName(value);
      setDisableAssignment(false);
    }
    if (type === "individual start") {
      setStudentData(null); //to avoid changing the date before pressing apply
      setPageData(null);
      setIndividualStart(value);
      if (tab === "student") {
        setDisableStudent(false);
      } else if (tab === "page") {
        setDisablePage(false)
      }
    }
    if (type === "individual end") {
      setStudentData(null);
      setPageData(null);
      setIndividualEnd(value);
      if (tab === "student") {
        setDisableStudent(false);
      } else if (tab === "page") {
        setDisablePage(false)
      }
    }
    if (type === "chapter") {
      setChapterLabel(value)
      setCourseChapter(value)
      setDisable(false)
    }
    if (type === "path") {
      setDataPath(value)
      //setDisableMenu(false)
      //setChosenPath(value)
    }
  }

    function getStudentDates() {
      studentDates.forEach(s => {
        if (s['_id'] === student) {
          setOneStudent(s);
        }
      })
    }

    function handleTabs(value) {
      if (course && click) { //change when tabs can be switched
        //setResult(null);
        //setDisableCourse(false);
        setDisableStudent(false);
        //console.log(value)
        if (value === 0) {
          console.log("student")
          setTab("student");
          setIndex(0)
        } else if (value === 1) {
          console.log("page")
          setTab("page");
          setIndex(1)
        } else if (value === 2) {
          setTab("assignment")
          setIndex(2)
        }
      } else if (!course || !click) {
        if (value === 0) {
          //console.log("student")
          setTab("student");
          setIndex(0)
        } else if (value === 1) {
          //console.log("page")
          setTab("page");
          setIndex(1)
        } else if (value === 2) {
          setTab("assignment")
          setIndex(2)
        }
      } else {
        alert("Please choose a course and hit Apply.")
      }
    }

    function clearDates(event) {
      event.preventDefault();
      setStart(null);
      setEnd(null);
      setDisable(false);
    }

    function clearTimelineDates(event) {
      event.preventDefault();
      setIndividualStart(null);
      setIndividualEnd(null);
      setDisableStudent(false);
      setDisablePage(false);
      if (tab === "student") {
        setStudentData(null);
      } else if (tab === "page") {
        setPageData(null);
      }
    }

    function menuCollapsible(event) {
      setOpenFilter(!openFilter)
      //setChosenPath(null)
    }

    function clearPath(event) {
      event.preventDefault();
      setChosenPath(null);
      setDataPath(null);
      setResetPath(true);
    }

    function filterReset(event) {
      event.preventDefault();
      setReset(true)
      //setAllChapters(null);
      setChosenPath(null);
      setDataPath(null);
      setStart(null);
      setEnd(null);
    }

    function applyReset(event) {
      event.preventDefault();
      setOpenFilter(false)
      setDisableCourse(true);
      setResult(null);
      setStudentResult(null);
      setPageResult(null);
      setStudent(null);
      setPage(null);

      getAggregateData();
      getObjectList();
      getStudentChartData();
      getPageViewData();
      setReset(false)
    }

    function changeColumns(option, value) {
      // console.log(value)
      // console.log(option['label'])
      var val = option['label']
      var columns = JSON.parse(JSON.stringify(tableColumns))
      var checked = JSON.parse(JSON.stringify(checkedValues))
      if (val === "All" && columns[val]) {
        columns[val] = false
        checked.find((v, index) => {
          if (v === val) {
            checked.splice(index, 1)
          }
        })
      } else if (val === "All" && !columns[val]) {
        Object.keys(columns).forEach(v => {
          columns[v] = true
        })
        checked = Object.keys(columns)
      } else {
        if (columns[val]) {
          columns[val] = false
          columns['All'] = false
        } else {
          columns[val] = true
        }
        if (checked.includes(val)) {
          checked.find((v, index) => {
            if (v === val) {
              checked.splice(index, 1)
            }
          })
            checked.find((v, index) => {
              if (v === 'All') {
                checked.splice(index, 1)
              }
            })
        } else {
          checked.push(val)
        }
      }
      setCheckedValues(checked)
      setTableColumns(columns)
      //console.log(checked)
    }

    function changeActivityFilter(option, data) {
      setActivityFilter(option)
      // if (option === "No Recent LibreText Activity") {
      //   setActivityFilter(option)
      //   // data.sort((a, b) => {
      //   //   return a - b
      //   // })
      // } else if (option === "No Recent Adapt Activity") {
      //
      // } else if (option === "Low Adapt Performance") {
      //
      // }
    }

    function pageViewCharts() {
      getPageViewData();
      getIndividualPageViewData();
    }

  return (
    <>
    <Tabs justify="start" margin="medium" activeIndex={index} onActive={value => handleTabs(value)} style={{overflowY: "scroll"}}>

      {click &&
        <Tab title="By Student" overflowY="scroll">
        {disableCourse && !studentResult &&
          <InfoBox infoText="Loading, please wait" showIcon={true} icon={<Spinner/>} />
        }
          {studentResult && allData["student"] && allData["student"].length < 1 &&
            <Notification title="No data to display." onClose={() => {}}/>
          }
            <Grommet theme={theme} full fill={true} overflowY="scroll">
              <Box fill={true}>
              <Box direction="row">
              {studentResult &&
                <Box>
                  <Box width="100px" margin={{top: "medium", left: "xsmall"}}>
                    <Button label="Choose Columns" secondary color="#0047BA" size="small" onClick={() => setShowCheckboxes(!showCheckboxes)}/>
                  </Box>
                  {showCheckboxes &&
                    <CheckBoxGroup
                      margin={{top: "medium", left: "xsmall"}}
                      options={Object.keys(tableColumns)}
                      value={checkedValues}
                      onChange={({ option, value }) => changeColumns(option, value)}
                    />
                  }
                </Box>
              }
              <Grid
                fill={true}
                rows={[ '2/3', '2/3', 'medium', 'large', 'large']}
                columns={['15%', '79%']}
                gap="small"
                areas={[
                { name: 'table', start: [0, 0], end: [1, 0] },
                { name: 'plots', start: [0, 1], end: [1, 1] },
                { name: 'timeline-filters', start: [0,2], end: [1,2] },
                { name: 'timeline', start: [0,3], end: [1,3] },
                { name: 'path', start: [0, 4], end: [1, 4] }
                ]}
                flex={true}
                responsive={true}
                margin="medium"
                overflowY="scroll"
                >
                {studentResult && allData["student"].length > 0 &&
                <>
                {disable && (!studentResult || !display) &&
                  <Box gridArea="table" background="light-2" >
                    <InfoBox infoText="Loading, please wait" showIcon={true} icon={<Spinner/>} />
                  </Box>
                }
                {studentResult && click && display &&
                  <Box gridArea="table" border={true} overflowY="scroll" responsive={true}>
                  {
                    // <Box direction="row">
                    //   <Box width="250px" height="85px">
                    //     <Select
                    //       options={['No Recent LibreText Activity', 'No Recent Adapt Activity', 'Low Adapt Performance']}
                    //       margin={{right: "medium", left: "medium"}}
                    //       value={activityFilter}
                    //       onChange={({ option }) => changeActivityFilter(option, allData["student"])}
                    //     />
                    //   </Box>
                    //   <Button primary label="Apply" onClick={() => {}}/>
                    // </Box>
                  }
                    <DataTable tab={tab} data={allData["student"]} hasAdapt={hasAdapt} showColumns={tableColumns} activityFilter={activityFilter}/>
                  </Box>
                }
                {studentResult && click && display &&
                  <Box ref={target} gridArea="plots" border={true} responsive={true} fill={true} direction="row" justifyContent="center" justify="center" align="center" overflowY="scroll" responsive={true}>
                    <Grid
                      fill={true}
                      rows={['xsmall', 'full']}
                      columns={['100%']}
                      gap="none"
                      areas={[
                        { name: 'title', start: [0, 0], end: [0, 0]},
                        { name: 'scatter-plot', start: [0, 1], end: [0, 1]}
                      ]}
                      overflowY="scroll"
                      responsive={true}
                      >
                      <Box align="center" direction="column" gridArea='title'>
                        <TitleText title="Student Metrics Bar Chart" text="This graph shows data for all students. Switch the axis values using the filters to the left. Click on a bar to populate a table with the chosen data." topMargin="small"/>
                      </Box>
                      <Box gridArea='scatter-plot' justify="center" direction="row" margin={{bottom: "xlarge"}} responsive={true}>
                        {//<Button alignSelf="start" secondary onClick={() => setShowFilter(true)} icon={<Filter/>} margin={{top: "small"}}/>
                        }
                        <Button secondary size="small" alignSelf="start" label="Filters" onClick={() => setShowFilter(true)} margin={{top: "small"}}/>
                        {showFilter && (
                          <Layer
                            onEsc={() => setShowFilter(false)}
                            onClickOutside={() => setShowFilter(false)}
                            position="left"
                            margin={{left: "large"}}
                          >
                          <Button icon={<Close/>} onClick={() => setShowFilter(false)} />
                          <Box direction="column" alignSelf="center" margin="large">
                            <Text size="medium" weight="bold" textAlign="center">Bar Chart Display Filters</Text>
                            <Text>Data:</Text>
                            <Select
                              options={['Unique Pages Accessed', 'Unique Interaction Days', 'Most Recent Page Load']}
                              margin={{right: "medium", left: "medium"}}
                              value={barXAxisLabel}
                              onChange={({ option }) => changeBarXAxis(option)}
                            />
                            <Button primary label="Apply" onClick={() => getStudentChartData()} margin="large"/>
                          </Box>
                        </Layer>
                      )}
                      {!studentChartData &&
                        <InfoBox infoText="Loading, please wait" showIcon={true} icon={<Spinner/>} />
                      }
                      {studentChartData &&
                        <StudentChart hasAdapt={hasAdapt} showColumns={tableColumns} allData={allData['student'].filter(o => o.isEnrolled === true)} tab={tab} data={studentChartData['documents']} xaxis="_id" xaxisLabel={barXAxisLabel} yaxis={barYAxis} yaxisLabel={barYAxisLabel} width={1000}/>
                      }
                    </Box>
                  </Grid>
                </Box>
              }
              </>
            }
              </Grid>
              </Box>
              </Box>
            </Grommet>
          </Tab>
        }
        {click &&
          <Tab title="By Page" overflowY="scroll">
            {disableCourse && !pageResult &&
              <InfoBox infoText="Loading, please wait" showIcon={true} icon={<Spinner/>} />
            }
            {pageResult && allData["page"].length < 1 &&
              <Notification title="No data to display." onClose={() => {}}/>
            }
              <Grommet theme={theme} full fill="true" overflowY="scroll">
                <Box fill={true}>
              <Box direction="row">
                <Grid
                  fill={true}
                  rows={['2/3', '2/3', '1/3', '2/3']}
                  columns={['15%', '79%']}
                  gap="small"
                  areas={[
                  { name: 'table', start: [0, 0], end: [1, 0] },
                  { name: 'horizontal-chart', start: [0, 1], end: [1, 1] },
                  { name: 'timeline-filters', start: [0,2], end: [1,2] },
                  { name: 'timeline', start: [0,3], end: [1,3] }
                  ]}
                  flex={true}
                  responsive={true}
                  margin="medium"
                  overflowY="scroll"
                  >

                {pageResult && allData["page"].length > 0 &&
                <>
                  {disable && (!pageResult || !display) &&
                    <Box gridArea="table" background="light-2" >
                      <InfoBox infoText="Loading, please wait" showIcon={true} icon={<Spinner/>} />
                    </Box>
                  }
                  {pageResult && click && display &&
                    <Box gridArea="table" border={true} >
                      <DataTable tab={tab} data={allData["page"]} />
                    </Box>
                  }
                {pageResult && click && display &&
                  <Box gridArea="horizontal-chart" border={true} align="center" direction="row" overflowY="scroll">
                    <Grid
                      fill={true}
                      rows={['1/5', '4/5']}
                      columns={['100%']}
                      gap="small"
                      areas={[
                        { name: 'title', start: [0, 0], end: [0, 0]},
                        { name: 'plot', start: [0, 1], end: [0, 1]}
                      ]}
                      >
                      <Box align="center" direction="column" gridArea='title'>
                        <TitleText title="Aggregate Page Views Bar Chart" text={"This graph shows the number of page views for all pages in "+courseName+". Switch the unit of time using the filters to the left."} topMargin="small"/>
                      </Box>
                      <Box gridArea='plot' justify="center" direction="row">
                        <Button alignSelf="start" secondary onClick={() => setShowFilter(true)} icon={<Filter/>} margin={{top: "small", left: "small"}}/>
                          {showFilter && (
                            <Layer
                              onEsc={() => setShowFilter(false)}
                              onClickOutside={() => setShowFilter(false)}
                              position="left"
                              margin={{left: "large"}}
                            >
                            <Button icon={<Close/>} onClick={() => setShowFilter(false)} />
                            <Box direction="column" alignSelf="center"  margin="large">
                              <Text size="medium" weight="bold" textAlign="center">Bar Chart Display Filters</Text>
                              <Text>Unit of Time:</Text>
                              <Select
                                options={['Day', 'Week', '2 Weeks', 'Month']}
                                margin={{right: "medium", left: "medium"}}
                                value={binLabel}
                                onChange={({ option }) => changeBinVal(option)}
                              />
                              <Button primary label="Apply" onClick={() => pageViewCharts()} margin="large"/>
                            </Box>
                          </Layer>
                        )}
                        {totalPageViews &&
                          <PageViews data={totalPageViews} type="aggregate" xaxis="_id" yaxis="count" binLabel={binLabel} width={980}/>
                        }
                      </Box>
                    </Grid>
                  </Box>
                }
                {pageResult && click && display && allPages &&
                  <Box gridArea="timeline-filters" border={true} align="center" pad="small" overflowY="auto">
                    <TitleText title="Individual Page Metrics Bar Chart" text="This graph shows data for an individual page. Switch the unit of time using the filters to the left." topMargin="small"/>
                    <Box direction="row">
                      <Select
                        options={allPages}
                        margin={{vertical: "xsmall", right: "large"}}
                        dropAlign={{top: "bottom", left: "left", right: "right"}}
                        dropHeight="small"
                        value={page}
                        onChange={({ option }) => handleChange("page", option)}
                      />
                    </Box>
                      <Button primary label="Apply" disabled={disablePage} onClick={handleIndividual} margin={{bottom: "small", top: "small", right: "medium"}}/>

                  </Box>
                }
                {disablePage && !individualPageViews &&
                  <Box gridArea="timeline" background="light-2" >
                    <InfoBox infoText="Loading, please wait" showIcon={true} icon={<Spinner/>} />
                  </Box>
                }
                {(individualPageViews != null) &&
                  <Box gridArea="timeline" align="center" pad="small" overflowY="auto">

                    <Box  justify="center" direction="row">
                      <Button alignSelf="start" secondary onClick={() => setShowFilter(true)} icon={<Filter/>} margin={{top: "small", left: "small"}}/>
                        {showFilter && (
                          <Layer
                            onEsc={() => setShowFilter(false)}
                            onClickOutside={() => setShowFilter(false)}
                            position="left"
                            margin={{left: "large"}}
                          >
                          <Button icon={<Close/>} onClick={() => setShowFilter(false)} />
                          <Box direction="column" alignSelf="center"  margin="large">
                            <Text size="medium" weight="bold" textAlign="center">Bar Chart Display Filters</Text>
                            <Text>Unit of Time:</Text>
                            <Select
                              options={['Day', 'Week', '2 Weeks', 'Month']}
                              margin={{right: "medium", left: "medium"}}
                              value={binLabel}
                              onChange={({ option }) => changeBinVal(option)}
                            />
                            <Button primary label="Apply" onClick={() => pageViewCharts()} margin="large"/>
                          </Box>
                        </Layer>
                      )}
                      {individualPageViews &&
                        <Box width="980px" height="100%">
                        <PageViews data={individualPageViews} type="individual" xaxis="_id" yaxis="count" binLabel={binLabel} width={980} height={500}/>
                        </Box>
                      }
                    </Box>
                  </Box>
                }
                </>
              }
              </Grid>
              </Box>
              </Box>
            </Grommet>

        </Tab>
      }
      {hasAdapt &&
        <Tab title="By Assignment">
          <Grommet theme={theme}>
            <Grid
              fill={true}
              rows={[ 'auto', 'auto']}
              columns={['15%', '79%']}
              gap="small"
              areas={[
              { name: 'timeline-filters', start: [0, 0], end: [1, 0] },
              { name: 'timeline', start: [0,1], end: [1,1] }
              ]}
              flex={true}
              responsive={true}
              margin="medium"
              overflowY="scroll"
              >
              {adaptLevels &&
                <Box gridArea="timeline-filters" border={true} align="center" pad="small" overflowY="auto">
                  <TitleText title="Individual Assignment Metrics Bar Chart" text="This graph shows data for an individual page. Switch the unit of time using the filters to the left." topMargin="small"/>
                  <Box direction="row">
                    {adaptLevels &&
                      <>
                    <Select
                      options={Object.keys(adaptLevels)}
                      margin={{right: "small", vertical: "xsmall"}}
                      value={levelGroup}
                      onChange={({ option }) => handleChange("pageLevelGroup", option)}
                    />
                    {levelGroup &&
                      <Select
                        options={adaptLevels[levelGroup]}
                        margin={{right: "medium", left: "medium", vertical: "xsmall"}}
                        value={levelName}
                        onChange={({ option }) => handleChange("pageLevelName", option)}
                      />
                    }
                    </>
                  }
                  </Box>
                    <Button primary label="Apply" disabled={disableAssignment} onClick={handleIndividual} margin={{bottom: "small", top: "small", left: "small"}}/>

                </Box>
              }
                {(individualAssignmentViews != null) &&
                  <Box gridArea="timeline" align="center" pad="small" overflowY="auto">

                    <Box  justify="center" direction="row">
                      <Button alignSelf="start" secondary onClick={() => setShowFilter(true)} icon={<Filter/>} margin={{top: "small", left: "small"}}/>
                        {showFilter && (
                          <Layer
                            onEsc={() => setShowFilter(false)}
                            onClickOutside={() => setShowFilter(false)}
                            position="left"
                            margin={{left: "large"}}
                          >
                          <Button icon={<Close/>} onClick={() => setShowFilter(false)} />
                          <Box direction="column" alignSelf="center"  margin="large">
                            <Text size="medium" weight="bold" textAlign="center">Bar Chart Display Filters</Text>
                            <Text>Unit of Time:</Text>
                            <Select
                              options={['Day', 'Week', '2 Weeks', 'Month']}
                              margin={{right: "medium", left: "medium"}}
                              value={binLabel}
                              onChange={({ option }) => changeBinVal(option)}
                            />
                            <Button primary label="Apply" onClick={() => pageViewCharts()} margin="large"/>
                          </Box>
                        </Layer>
                      )}
                      {individualAssignmentViews &&
                        <Box width="980px" height="100%">
                        <PageViews data={individualAssignmentViews} type="individual" xaxis="_id" yaxis="count" binLabel={binLabel} width={980} height={500}/>
                        </Box>
                      }
                    </Box>
                  </Box>
                }
                {disableAssignment && !individualAssignmentViews &&
                  <Box gridArea="timeline" background="light-2" >
                    <InfoBox infoText="Loading, please wait" showIcon={true} icon={<Spinner/>} />
                  </Box>
                }
            </Grid>
          </Grommet>
        </Tab>
      }
      {realCourses &&
        <Box fill>
        <Box width="100%" responsive={true} margin={{bottom: "small"}}>
        {showInfoBox &&
          <InfoBox show={showInfoBox} infoText="Please choose a course." color="#b0e0e6" main={true}/>
        }
        </Box>
        <Box direction="row">
          <Box gridArea="courses" alignContent="center" align="center" alignSelf="center" fill>
            <Box >
              <Box direction="row">
              <Box width="500px" margin={{right: "medium", left: "large", bottom: "small"}}>
                <Select
                  options={Object.keys(realCourses)}
                  margin={{right: "large", left: "large", bottom: "small"}}
                  value={courseName}
                  dropHeight="medium"
                  onChange={({ option }) => handleChange("courseId", option)}
                />
              </Box>
              <Button label="Apply" style={{height: 45}} primary color="#0047BA" disabled={disableCourse} onClick={handleClick}/>
              </Box>
                {disableCourse && !allData['student'] && !allData['page'] &&
                  <InfoBox infoText="Loading, please wait" showIcon={true} icon={<Spinner/>} />
                }
            </Box>
          </Box>
          {allData['student'] &&
          <Box direction="column" alignSelf="start" border={true} width="300px" height="100px">
            <Box direction="row">
              <Box margin={{left: "small", bottom: "small", top: "small"}} border={true} height="30px" width="40px" background='rgb(255, 255, 158, .5)'/>
              <Text margin={{left: "small", bottom: "small", top: "small"}}>LibreText Data</Text>
            </Box>
            <Box direction="row">
              <Box margin={{left: "small", bottom: "small"}} border={true} height="30px" width="40px" background='rgb(171, 247, 177, .5)'/>
              <Text margin={{left: "small", bottom: "small"}}>Adapt Data</Text>
            </Box>
          </Box>
          }
          </Box>
        </Box>
      }

      <Box gridArea="header" background="#022851" fill={true} contentAlign="center" margin={{top: "small"}}>
        <Heading level='3' alignSelf="start" responsive={true} gridArea="header" margin="small">LibreTexts Activity Dashboard</Heading>
      </Box>

      {allData['student'] && allData['page'] &&
        <Box>
          <Button margin="medium" color="#022851" label="Data Filters" onClick={() => setShowTableFilters(!showTableFilters)} />
        </Box>
      }
      {!showTableFilters && allData['student'] && allData['page'] && count === 0 &&
        <InfoBox count={count} setCount={setCount} infoText="Click on the button to the left to filter the data by date and course unit." color='#b0e0e6'/>
      }
      {showTableFilters &&
        <>
        <Box direction="row">
        <Box gridArea="filters" border={true} direction="row" height="125px" margin={{bottom: "medium"}}>
          <Box margin={{bottom: "medium", top: 'xsmall'}} direction="row" height="100px">
          <Box>
            <Text size="large" weight="bold" textAlign="center" margin={{left: "small"}}> Data Filters </Text>
                </Box>
            <Box direction="column" pad="small" direction="row" margin={{top: "medium"}}>
              <Text margin={{vertical: "small", right: "xsmall"}}>Start:</Text>
              <DateInput
                format="mm/dd/yyyy"
                value={start}
                onChange={({ value }) => {handleChange("start", value)}}
              />
              <Text margin={{vertical: "small", right: "xsmall", left: "xsmall"}}>End:</Text>
              <DateInput
                format="mm/dd/yyyy"
                value={end}
                onChange={({ value }) => {handleChange("end", value)}}
              />
            </Box>
            <Box direction="row" alignSelf="center" pad="small">
            <Button size="small" margin={{bottom: "small", top: "medium", horizontal: "medium"}} label="Clear Dates" onClick={clearDates} color='#022851'/>
              <Button label="Apply" margin={{top: "small"}} style={{height: 45}} primary color="#0047BA" disabled={disable} onClick={handleFilterClick}/>
            </Box>
          </Box>
        </Box>
            {allChapters && courseLevel &&
              <Box margin={{bottom: "medium"}} >
                <Button alignSelf="start" margin={{horizontal: "xlarge"}} label="Course Structure Menu" onClick={menuCollapsible} color='#022851'/>
                <Collapsible open={openFilter}>
                    <Box width="350px" border={resetPath} margin="large">
                    {!resetPath &&
                      <TitleText title="Course Structure Dropdown" text="Choose a unit from the course to focus on."/>
                    }
                    {resetPath &&
                      <Text margin="medium">Please hit apply for the changes to take effect.</Text>
                    }
                    <MultiSelect resetPath={resetPath} pathLength={pathLength} data={allChapters} levels={courseLevel} handleChange={handleChange} filterClick={handleFilterClick} init={dataPath} clearPath={clearPath}/>
                  </Box>
                </Collapsible>
              </Box>
            }
          </Box>
              </>
      }
      {(chosenPath || start || end || reset) && !showTableFilters &&
        <Box direction="column" border={true} margin={{top: "small", right: "medium"}} width={{min: "500px"}}>
        {chosenPath &&
          <Text margin="small">Current chosen path: {chosenPath.split("/").map(a => <li>{a.replaceAll("_", " ")}</li>)}</Text>
        }
        {start &&
          <Text margin="small">Start Date: {(new Date(start.split("T")[0])).toString()}</Text>
        }
        {end &&
          <Text margin="small">End Date: {(new Date(end.split("T")[0])).toString()}</Text>
        }
          {!reset &&
            <Button secondary size="small" label="Clear All Filters" alignSelf="center" color="#022851" margin={{vertical: "small"}} onClick={filterReset} type="reset"/>
          }
          {reset &&
            <Box direction="column">
              <Text margin="medium">Please hit apply for the changes to take effect.</Text>
              <Button primary label="Apply" onClick={applyReset} color="#022851" margin={{bottom: "small", top: "small", horizontal: "large"}}/>
            </Box>
          }
        </Box>

  }
    </Tabs>
    </>
  );
}

export default App;
