
function ewsDataStandardizedSubQuery() {
  var pipeline = [
    {
      '$group': {
        '_id': '',
        'lt_unique_days_stddev': {
          '$stdDevPop': '$lt_unique_days'
        },
        'lt_unique_days_avg': {
          '$avg': '$lt_unique_days'
        },
        'lt_total_pgs_stddev': {
          '$stdDevPop': '$lt_total_pgs'
        },
        'lt_total_pgs_avg':{
          '$avg': '$lt_total_pgs'
        },
        'lt_unique_pgs_stddev': {
          '$stdDevPop': '$lt_unique_pgs'
        },
        'lt_unique_pgs_avg': {
          '$avg': '$lt_unique_pgs'
        },
        'lt_unique_pgs_prop_stddev': {
          '$stdDevPop': '$lt_unique_pgs_prop'
        },
        'lt_unique_pgs_prop_avg': {
          '$avg': '$lt_unique_pgs_prop'
        },
        'lt_hours_stddev': {
          '$stdDevPop': '$lt_hours'
        },
        'lt_hours_avg': {
          '$avg': '$lt_hours'
        },
        'lt_hours_since_recent_stddev': {
          '$stdDevPop': '$lt_hours_since_recent'
        },
        'lt_hours_since_recent_avg': {
          '$avg': '$lt_hours_since_recent'
        },
        'adapt_unique_days_stddev': {
          '$stdDevPop': '$adapt_unique_days'
        },
        'adapt_unique_days_avg': {
          '$avg': '$adapt_unique_days'
        },
        'adapt_unique_assns_stddev': {
          '$stdDevPop': '$adapt_unique_assns'
        },
        'adapt_unique_assns_avg': {
          '$avg': '$adapt_unique_assns'
        },
        'adapt_hours_before_due_stddev': {
          '$stdDevPop': '$adapt_hours_before_due'
        },
        'adapt_hours_before_due_avg': {
          '$avg': '$adapt_hours_before_due'
        },
        'adapt_avg_score_stddev': {
          '$stdDevPop': '$adapt_avg_score'
        },
        'adapt_avg_score_avg': {
          '$avg': '$adapt_avg_score'
        },
        'adapt_prop_avail_assn_stddev': {
          '$stdDevPop': '$adapt_prop_avail_assn'
        },
        'adapt_prop_avail_assn_avg': {
          '$avg': '$adapt_prop_avail_assn'
        },
        'adapt_hours_since_recent_stddev': {
          '$stdDevPop': '$adapt_hours_since_recent'
        },
        'adapt_hours_since_recent_avg': {
          '$avg': '$adapt_hours_since_recent'
        },
        'roots': {
          '$push': '$$ROOT'
        }
      }
    },
    {
      '$unwind': {
        path: '$roots',
        includeArrayIndex: 'allData',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      '$project': {
        _id: '$roots._id',
        lt_unique_days: { $cond: [ '$roots.lt_unique_days', '$roots.lt_unique_days', null ] },
        lt_unique_days_z: calculateStandardizedVariable('$roots.lt_unique_days', '$lt_unique_days_avg', '$lt_unique_days_stddev'),
        lt_total_pgs: { $cond: [ '$roots.lt_total_pgs', '$roots.lt_total_pgs', null ] },
        lt_total_pgs_z: calculateStandardizedVariable('$roots.lt_total_pgs', '$lt_total_pgs_avg', '$lt_total_pgs_stddev'),
        lt_unique_pgs: { $cond: [ '$roots.lt_unique_pgs', '$roots.lt_unique_pgs', null ] },
        lt_unique_pgs_z: calculateStandardizedVariable('$roots.lt_unique_pgs', '$lt_unique_pgs_avg', '$lt_unique_pgs_stddev'),
        lt_unique_pgs_prop: { $cond: [ '$roots.lt_unique_pgs_prop', '$roots.lt_unique_pgs_prop', null ] },
        lt_unique_pgs_prop_z: calculateStandardizedVariable('$roots.lt_unique_pgs_prop', '$lt_unique_pgs_prop_avg', '$lt_unique_pgs_prop_stddev'),
        lt_hours: { $cond: [ '$roots.lt_hours', '$roots.lt_hours', null ] },
        lt_hours_z: calculateStandardizedVariable('$roots.lt_hours', '$lt_hours_avg', '$lt_hours_stddev'),
        lt_hours_since_recent: '$roots.lt_hours_since_recent',
        lt_hours_since_recent_z: calculateStandardizedVariable('$roots.lt_hours_since_recent', '$lt_hours_since_recent_avg', '$lt_hours_since_recent_stddev'),
        adapt_unique_days: { $cond: [ '$roots.adapt_unique_days', '$roots.adapt_unique_days', null ] },
        adapt_unique_days_z: calculateStandardizedVariable('$roots.adapt_unique_days', '$adapt_unique_days_avg', '$adapt_unique_days_stddev'),
        adapt_unique_assns: { $cond: [ '$roots.adapt_unique_assns', '$roots.adapt_unique_days', null ] },
        adapt_unique_assns_z: calculateStandardizedVariable('$roots.adapt_unique_assns', '$adapt_unique_assns_avg', '$adapt_unique_assns_stddev'),
        adapt_hours_before_due: { $cond: [ '$roots.adapt_hours_before_due', '$roots.adapt_hours_before_due', null ] },
        adapt_hours_before_due_z: calculateStandardizedVariable('$roots.adapt_hours_before_due', '$adapt_hours_before_due_avg', '$adapt_hours_before_due_stddev'),
        adapt_avg_score: { $cond: [ '$roots.adapt_avg_score', '$roots.adapt_avg_score', null ] },
        adapt_avg_score_z: calculateStandardizedVariable('$roots.adapt_avg_score', '$adapt_avg_score_avg', '$adapt_avg_score_stddev'),
        adapt_prop_avail_assn: { $cond: [ '$roots.adapt_prop_avail_assn', '$roots.adapt_prop_avail_assn', null ] },
        adapt_prop_avail_assn_z: calculateStandardizedVariable('$roots.adapt_prop_avail_assn', '$adapt_prop_avail_assn_avg', '$adapt_prop_avail_assn_stddev'),
        adapt_hours_since_recent: { $cond: [ '$roots.adapt_hours_since_recent', '$roots.adapt_hours_since_recent', null ] },
        adapt_hours_since_recent_z: calculateStandardizedVariable('$roots.adapt_hours_since_recent', '$adapt_hours_since_recent_avg', '$adapt_hours_since_recent_stddev')
      }
    }
  ]
  return pipeline;
}

function calculateStandardizedVariable(individual, avg, stddev) {
  return {'$divide': [{'$subtract': [individual, avg]}, stddev]};
}

module.exports = ewsDataStandardizedSubQuery;
