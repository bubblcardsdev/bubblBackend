
function getDateOffset(offsetInDays) {
    const currentDate = new Date();
    const targetDate = new Date(currentDate);
    targetDate.setDate(currentDate.getDate() + offsetInDays);
    return targetDate;
  }
  
  function getOneWeekFromToday() {
    return getDateOffset(-7);
  }
  
  function getOneMonthFromToday() {
    const currentDate = new Date();
    const targetDate = new Date(currentDate);
    targetDate.setMonth(currentDate.getMonth() - 1);
    return targetDate;
  }
  
  function getOneYearFromToday() {
    const currentDate = new Date();
    const targetDate = new Date(currentDate);
    targetDate.setFullYear(currentDate.getFullYear() - 1);
    return targetDate;
  }

  function getTodate(timeRange) {
    switch(timeRange){
        case "Weekly":
            {
                return getOneWeekFromToday();
            }
        case "Monthly":
            {
                return getOneMonthFromToday();
            }
        case "Yearly":
            {
                return getOneYearFromToday();
            }
    }



  }

  export default getTodate;