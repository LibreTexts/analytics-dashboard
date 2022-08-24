function checkInvalid(s, regEx){
    if (s && regEx.test(s)) {
        console.error(`${s} contains invalid chars`);
        return true;
    }
    return false;
}

function validateInput(endpoint, params) {
    // Brackets indicate code injection?
    var invalidChars= /^[{}]/;

    if (params.courseId &&
        checkInvalid(params.courseId, invalidChars)
    ) {
        params.courseId = null
    }
    
    if (params.groupBy &&
        (checkInvalid(params.groupBy, invalidChars) ||
        (params.groupBy).replace(/[^a]/g, "").length > 1)   
    ) {
        console.error(`${(params.groupBy).replace(/[^a]/g, "").length } '$' instances in groupby`);
        params.groupBy = null
    }

    if (endpoint === "timelineData" ||
        endpoint === "data"
    ) {
        if (params.groupBy != "$actor.id" &&
            params.groupBy != "$object.id"
        ){
            console.error(`${endpoint} can only group by actor(student) or object(page)`);
            params.groupBy = null
        }
    }

    if (params.path) {
        console.log(params.path) //do sumthing?
    }
    // const alphanum =  /^[0-9a-zA-Z():.,/Δ-]+$/;
    
    if (params.adaptLevelGroup && 
        typeof params.adaptLevelGroup != 'string' &&
        invalidChars.test(params.adaptLevelGroup)
    ) {
        console.error(`${params.adaptLevelGroup} is not a string`);
        params.adaptLevelGroup = null
    }
    if (params.adaptLevelName && 
        typeof params.adaptLevelName != 'string' &&
        invalidChars.test(params.adaptLevelName)
    ) {
        console.error(`${params.adaptLevelName} is not a string`);
        params.adaptLevelName = null
    }
    // Date should not include letters?
    invalidChars= /^[{}a-zA-Z]/;
    if (checkInvalid(params.startDate, invalidChars)) params.startDate = null;
    if (checkInvalid(params.endDate, invalidChars)) params.endDate = null;

    invalidChars= /^[{}]/;
    // Tag should not include brackets?
    if (checkInvalid(params.tagType, invalidChars)) params.tagType = null;;
    if (checkInvalid(params.tagTitle, invalidChars)) params.tagTitle = null;

    if (params.path) {
        console.log(params.path);
    }

    if (params.unit && 
        params.unit != "day" &&
        params.unit != "week" &&
        params.unit != "month"
    ) {
        console.error(`${params.unit} is not by day, week, or month`);
        params.unit = null
    }

    if (params.bin &&
        isNaN(params.bin)
    ) {
        console.error(`${params.bin} is not a number`);
        params.bin = null
    }

    return params
}

module.exports = { validateInput }