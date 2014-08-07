function populateAgeCriteria(dom, age, op, separator) {
    separator = separator || "";
    dom.append([
           "<span class='label label-warning'>Age</span>",
           op,
           "<span class='label label-default'>" + age + "</span>",
           separator
    ].join("\n"))
}

function createSexCriteria(dom, sex, separator) {
    separator = separator || "";
    dom.append([
        "<span class='label label-warning'>Sex</span> =",
        "<span class='label label-default'>" + sex + "</span>",
        separator
    ].join("\n"))
}

function populateListCriteria(dom, list, label, op) {
    list.forEach(function (element) {
        console.log(list)
        dom.append([
                "<span class='label label-warning'>" + label + "</span>",
                op,
                "<span class='label label-default'>" + element + "</span>",
                '<span class="label label-info conj">AND</span> '
            ].join("\n"))
    });
}

function render_query(selector, queries) {
    for(index in queries) {
        var query = queries[index]
        var item = $([
            "<div class='list-group-item criterion'>",
                '<div class="row">',
                    '<div class="col-md-10">',
                    '</div>',
                    '<div class="col-md-2">',
                        '<span class="label label-info pull-right">OR</span>',
                    '</div>',
                '</div>',
            '</div>'].join("\n")).appendTo(selector + " .list-group").find(".col-md-10");

        if(query.min_age > 0)
            populateAgeCriteria(item, query.min_age, '<i class="fa fa-angle-right"></i>', '<span class="label label-info conj">AND</span> ');
        if(query.max_age < 120)
            populateAgeCriteria(item, query.max_age, '<i class="fa fa-angle-left"></i>', '<span class="label label-info conj">AND</span> ');

        if(query.include_drugs.length > 0) {
            populateListCriteria(item, query.include_drugs, "ATC", "=");
        }

        if(query.exclude_drugs.length > 0) {
            populateListCriteria(item, query.exclude_drugs, "ATC", "≠")
        }

        if(query.include_diags.length > 0) {
            populateListCriteria(item, query.include_diags, "ATC", "=");
        }

        if(query.exclude_diags.length > 0) {
            populateListCriteria(item, query.exclude_diags, "ATC", "≠")
        }

        if(query.gender) {
            createSexCriteria(item, query.gender)
        } else {
            console.log(item.find(".conj").last())
            item.find(".conj").last().remove();
        }
    }
}

function render_distribution(dom, data) {
    var ctx = $(dom).get(0).getContext("2d");
    var labels = [], values = [];
    for(i = 0; i < 10 && i < data.length; i++) {
        value = data[i];
        labels.push(value.Code)
        values.push(value.Patient)
    }
    var data = {
        labels: labels,
        datasets: [
            {
                label: "Male",
                fillColor: "rgba(220,220,220,0.5)",
                strokeColor: "rgba(220,220,220,0.8)",
                highlightFill: "rgba(220,220,220,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: values
            }
        ]
    }
    var myBarChart = new Chart(ctx).Bar(data, {
     });
}

function render_age_distribution(dom, data) {
    console.log(data)
    var ctx = $(dom).get(0).getContext("2d");
    var labels = [], male = [], female = [], other = [];

    for(var i in data) {
        value = data[i];
        labels.push(value.Age);

        if(value.M !== undefined) {
            male.push(value.M)
        }

        if(value.K !== undefined) {
            female.push(value.K)
        }
    }
    console.log(male, female, labels)
    var data = {
        labels: labels,
        datasets: [
            {
                label: "Male",
                fillColor: "rgba(220,220,220,0.5)",
                strokeColor: "rgba(220,220,220,0.8)",
                highlightFill: "rgba(220,220,220,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: male
            },
            {
                label: "Female",
                fillColor: "rgba(151,187,205,0.5)",
                strokeColor: "rgba(151,187,205,0.8)",
                highlightFill: "rgba(151,187,205,0.75)",
                highlightStroke: "rgba(151,187,205,1)",
                data: female
            }
        ]
    }
    var myBarChart = new Chart(ctx).Bar(data, {
        multiTooltipTemplate: "<%= obj.datasetLabel %>: <%= value %>"
     });
}


function render_gender_distribution(dom, data){
    var ctx = $(dom).get(0).getContext("2d");
    var data = [
        {
            value: data.Gender.M,
            label: "Male",
            color:"#F7464A",
            highlight: "#FF5A5E"
        },
        {
            color: "#46BFBD",
            highlight: "#5AD3D1",
            value: data.Gender.K,
            label: "Female"
        }
    ]
    var gender = new Chart(ctx).Doughnut(data, {
        animateScale: false
    });
}