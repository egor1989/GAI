function TimeLine(id, dates, issues) {
    this.$id = $(id);
    this.$dates = $(dates);
    this.$issues = $(issues);
    this.dateTempl = Handlebars.compile($("#timeLineDate").html());
    this.issueTempl = Handlebars.compile($("#timeLineIssue").html());
    this.update();
    /*this.$id.timelinr({
        arrowKeys: 'true',
        datesDiv: dates,
        issuesDiv: issues
    });*/
}

TimeLine.prototype.addDate = function(date, issue) {
    var self = this;
    self.$dates.append(self.dateTempl({date: date}));
    self.$issues.append(self.issueTempl({date: date, issue: issue}));
}

TimeLine.prototype.update = function() {
    var self = this;
    this.$id.timelinr({
        arrowKeys: 'true',
        datesDiv: '#' + self.$dates.attr('id'),
        issuesDiv: '#' + self.$issues.attr('id'),
        nextButton: '#next',
        prevButton: '#prev'
    });
}


TimeLine.prototype.activate = function(date) {
    var self = this;
    self.$dates.find('li>a[href="#' + date + '"]').click();
}

TimeLine.prototype.getActive = function() {
    var self = this;
    return self.$dates.find('a.selected').text();
}
