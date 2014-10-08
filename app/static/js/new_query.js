
$(function() {

    var icdCodes = [
        "A000",
        "A001",
        "A009",
        "A0100",
        "A0101",
        "A0102",
        "A0103",
        "A0104",
        "A0105",
        "A0109",
        "A011",
        "A012",
        "A013",
        "A014",
        "A020",
        "A021",
        "A0220",
        "A0221",
        "A0222",
        "A0223",
        "A0224",
        "A0225",
        "A0229",
        "A028",
        "A029",
        "A030",
        "A031",
        "A032",
        "A033",
        "A038",
        "A039",
        "A040",
        "A041",
        "A042",
        "A043",
        "A044",
        "A045",
        "A046",
        "A047",
        "A048",
        "A049",
        "A050",
        "A051",
        "A052",
        "A053",
        "A054",
        "A055",
        "A058",
        "A059",
        "A060",
        "A061",
        "A062",
        "A063",
        "A064",
        "A065",
        "A066",
        "A067",
        "A0681",
        "A0682",
        "A0689",
        "A069",
        "A070",
        "A071",
        "A072",
        "A073",
        "A074",
        "A078",
        "A079",
        "A080",
        "A0811",
        "A0819",
        "A082",
        "A0831",
        "A0832",
        "A0839",
        "A084",
        "A088",
        "A09",
        "A150",
        "A154",
        "A155",
        "A156",
        "A157",
        "A158",
        "A159",
        "A170",
        "A171",
        "A1781",
        "A1782",
        "A1783",
        "A1789",
        "A179",
        "A1801",
        "A1802",
        "A1803",
        "A1809",
        "A1810",
        "A1811",
        "A1812"
    ];

    var atcCodes = [
        "A01AA01",
        "A01AA02",
        "A01AA03",
        "A01AA04",
        "A01AA30",
        "A01AA51",
        "A01AB02",
        "A01AB03",
        "A01AB04",
        "A01AB05",
        "A01AB06",
        "A01AB07",
        "A01AB08",
        "A01AB09",
        "A01AB10",
        "A01AB11",
        "A01AB12",
        "A01AB13",
        "A01AB14",
        "A01AB15",
        "A01AB16",
        "A01AB17",
        "A01AB18",
        "A01AB19",
        "A01AB21",
        "A01AB22",
        "A01AB23",
        "A01AC01",
        "A01AC02",
        "A01AC03",
        "A01AC54",
        "A01AD01",
        "A01AD02",
        "A01AD05",
        "A01AD06",
        "A01AD07",
        "A01AD11",
        "A02AA01",
        "A02AA02",
        "A02AA03",
        "A02AA04",
        "A02AA05",
        "A02AA10"
    ];


    $.getJSON("/all/1").success(function(data){
        gen_querylist(JSON.parse(data))
    }).fail(function(e) {
        console.log("Fail", e)
    });

//
//var table = []
//    for(index in data) {
//        value = data[index]
//        table.push([
//            "<tr>",
//                "<td>" + value.Code + "</td>",
//                "<td>Not implemented yet.</td>",
//                "<td>" + (value.Patient / total).toFixed(4) + " (" + value.Patient +")</td>",
//                '<td style="text-align: center"><a href="#" data-toggle="modal" data-id="' + value.Code + '" data-target="' + modal + '" class="' + cls + '"><i class="fa fa-cogs"></i></a></td>',
//            "</tr>"
//        ].join("\n"))
//    }

//    $(table.join("\n")).appendTo(dom)
    function gen_querylist(data) {
        console.log(data)
        data.sort(function(a, b) {
            return parseInt(b.id) - parseInt(a.id)
        })
        var table = []
        for(key in data) {
            item = data[key];
            table.push([
                "<tr>",
                    '<td class="text-center" id="' + item.id + 'population-criteria"></td>',
                    '<td class="text-center" style="border-left: 1px solid #dddddd;" id="' + item.id + 'case-criteria"></div></td>',
                    '<td class="text-center">' +
                        '<a href="#" style="padding: 3px" data-toggle="tooltip" data-placement="top" title="Edit queries"><i class="fa fa-pencil-square-o default"></i></a>' +
                        '<a href="#" style="padding: 3px" data-toggle="tooltip" data-placement="top" title="Remove query"><i class="fa fa-times red"></i></a>' +
                        '<a href="/analytics?id=' + item.id + '" style="padding: 3px"  data-toggle="tooltip" data-placement="top" title="Analyze query"><i class="fa fa-arrow-right"></i></a>' +
                    '</td>',
                "</tr>"
            ].join("\n"))
            console.log(item.id)
        }
        $(table.join("\n")).prependTo("#my-queries")

//        ordered.sort()
//
//        console.log(ordered)
//        for(key in ordered) {
//            key = ordered[key]+""
//            item = data[key];
//            table.push([
//                "<tr>",
//                    '<td class="text-center" id="' + item.id + 'population-criteria"></td>',
//                    '<td class="text-center" style="border-left: 1px solid #dddddd;" id="' + item.id + 'case-criteria"></div></td>',
//                    '<td class="text-center">' +
//                        '<a href="#" style="padding: 3px" data-toggle="tooltip" data-placement="top" title="Edit queries"><i class="fa fa-pencil-square-o default"></i></a>' +
//                        '<a href="#" style="padding: 3px" data-toggle="tooltip" data-placement="top" title="Remove query"><i class="fa fa-times red"></i></a>' +
//                        '<a href="/analytics?id=' + item.id + '" style="padding: 3px"  data-toggle="tooltip" data-placement="top" title="Analyze query"><i class="fa fa-arrow-right"></i></a>' +
//                    '</td>',
//                "</tr>"
//            ].join("\n"))
//            console.log(key)
//        }

        for(key in data) {
            item = data[key]
            render_query("#" + item.id + 'population-criteria', item.query.population)
            if(item.query.case !== undefined) {
                render_query("#" + item.id + 'case-criteria', item.query.case)
            }
        }

    }

    function render_query(selector, queries) {
        for(index in queries) {
            var query = queries[index]
            var item = $([
                    '<div class="row">',
                        '<div class="col-md-10">',
                        '</div>',
                        '<div class="col-md-2">',
                            '<span class="label label-info">OR</span>',
                        '</div>',
                    '</div>'].join("\n")).appendTo(selector).find(".col-md-10");

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
                populateListCriteria(item, query.include_diags, "ICD", "=");
            }

            if(query.exclude_diags.length > 0) {
                populateListCriteria(item, query.exclude_diags, "ICD", "≠")
            }

            if(query.gender) {
                createSexCriteria(item, query.gender)
            } else {
                console.log(item.find(".conj").last())
                item.find(".conj").last().remove();
            }
        }
    }

    $('[data-toggle="tooltip"]').tooltip({'placement': 'top'});
    $("#population-add-sub-criteria").toggleClass("disabled")
    $("#population-clear-sub-criterion").toggleClass("disabled")

    function Query() {
        this.include_drugs = [];
        this.exclude_drugs = [];
        this.include_diags = [];
        this.exclude_diags = [];
        this.min_age = undefined;
        this.max_age = undefined;
        this.gender = undefined;

        this.clone = function() {
            var query = new Query();
            query.include_drugs = this.include_drugs.slice()
            query.exclude_drugs = this.exclude_drugs.slice()
            query.include_diags = this.include_diags.slice()
            query.exclude_diags = this.exclude_diags.slice()
            query.min_age = this.min_age;
            query.max_age = this.max_age;
            query.gender = this.gender;
            return query;
        }

        this.reset = function() {
            this.include_drugs = [];
            this.exclude_drugs = [];
            this.include_diags = [];
            this.exclude_diags = [];
            this.min_age = undefined;
            this.max_age = undefined;
            this.gender = undefined;
        }

    }

    var queries = [];
    var query = new Query();

    var caseQueries = [];

    function populationSubQueryReset() {
        $("#sub-criterion .list-group")
            .children()
            .remove();
        $("#population-sex-group button").removeClass("disabled")


        $("#add-sub-criteria").toggleClass("disabled")
        $("#clear-sub-criterion").toggleClass("disabled")
        query.reset();
    }

    function populationEnableSubQueryAddReset() {
        var add = $("#add-sub-criteria");
        var clear = $("#clear-sub-criterion");

        if(add.hasClass("disabled")) {
            add.removeClass("disabled")
        }

        if(clear.hasClass("disabled")) {
            clear.removeClass("disabled")
        }

    }

    $("#population-sex-group button").click(function(evt) {
        changePopulationSex($(evt.target).text().toLowerCase())
        $("#population-sex-group button").addClass("disabled")
        populationEnableSubQueryAddReset();
    });

    $("#clear-sub-criterion").click(function(evt) {
        populationSubQueryReset()
    });

    $(document).on("click", ".remove-population-sex-criterion", function(evt) {
        $(evt.target).parent().parent().remove();
        query.gender = undefined;
        $("#population-sex-group button").removeClass("disabled")
    });

    $(document).on("click", ".remove-population-age-criterion", function(evt) {
        $(evt.target).parent().parent().remove();
        query.min_age = undefined;
        query.max_age = undefined;
    });

    $(document).on("click", ".remove-population-icd-criterion", function(evt) {
        $(evt.target).parent().parent().remove();
        query.include_diags.clear();
        query.exclude_diags.clear();
    });

    $(document).on("click", ".remove-population-atc-criterion", function(evt) {
        $(evt.target).parent().parent().remove();
        query.include_drugs.clear();
        query.exclude_drugs.clear();
    });

    $(document).on("click", "#population-criteria .remove-criterion", function(evt) {
        var target = $(evt.target).parent().parent().parent().parent();
        removeCriteria(target, queries);
    });

    $(document).on("click", "#case-criteria .remove-criterion", function(evt) {
        var target = $(evt.target).parent().parent().parent().parent();
        removeCriteria(target, caseQueries);
    });

    function removeCriteria(dom, queries) {
        var parent = dom.parent();
        var index = parseInt(dom.attr("queryIndex"));
        queries.splice(index, 1);
        dom.remove();

        console.log(queries);
        if(queries.length < 1) {
            $(["<div class='list-group-item all-criterion'>",
                   '<span class="label label-success all">All</span>',
               "</div>"].join("\n")).appendTo(parent);
        }
    }

//    $(window).bind('beforeunload', function(e){
//        if(queries.length > 0 || caseQueries.length > 0) {
//            return "You have unsaved changes."
//        }
//        e=null;
//    });

    $("#population-include-diagnosis").click(function(evt) {
        populationEnableSubQueryAddReset();
        includePopulationICD();
    });

    $("#population-exclude-diagnosis").click(function(evt) {
        populationEnableSubQueryAddReset();
        excludePopulationICD();
    });

    $("#population-include-drug").click(function(evt) {
        populationEnableSubQueryAddReset();
        includePopulationATC();
    });

    $("#population-exclude-drug").click(function(evt) {
        populationEnableSubQueryAddReset();
        excludePopulationATC();
    });

    $("#case-add-sub-criteria").click(function(evt) {
        addSubCriteria("#case-criteria", caseQueries);
        populationSubQueryReset();
    });

    $("#population-add-sub-criteria").click(function(evt) {
        addSubCriteria("#population-criteria", queries);
        populationSubQueryReset();
    });

    function addSubCriteria(selector, queries) {
        var subCriteria = query.clone();
        $(selector + " .all-criterion").remove();

        var currentIndex = queries.length;

        var item = $([
            "<div class='list-group-item criterion' queryIndex='" + currentIndex + "'>",
                '<div class="row">',
                    '<div class="col-md-10">',
                    '</div>',
                    '<div class="col-md-2">',
                        '<a href="#"><span class="fa fa-trash-o fa-fw pull-right remove-criterion"></span></a>',
                        '<span class="label label-info pull-right">OR</span>',
                    '</div>',
                '</div>',
            '</div>'].join("\n")).appendTo(selector + " .list-group").find(".col-md-10");

        if(subCriteria.min_age > 0)
            populateAgeCriteria(item, subCriteria.min_age, '<i class="fa fa-angle-right"></i>', '<span class="label label-info conj">AND</span> ');
        if(subCriteria.max_age < 120)
            populateAgeCriteria(item, subCriteria.max_age, '<i class="fa fa-angle-left"></i>', '<span class="label label-info conj">AND</span> ');

        if(subCriteria.include_drugs.length > 0) {
            populateListCriteria(item, subCriteria.include_drugs, "ATC", "=");
        }

        if(subCriteria.exclude_drugs.length > 0) {
            populateListCriteria(item, subCriteria.exclude_drugs, "ATC", "≠")
        }

        if(subCriteria.include_diags.length > 0) {
            populateListCriteria(item, subCriteria.include_diags, "ICD", "=");
        }

        if(subCriteria.exclude_diags.length > 0) {
            populateListCriteria(item, subCriteria.exclude_diags, "ICD", "≠")
        }

        if(subCriteria.gender) {
            createSexCriteria(item, subCriteria.gender)
        } else {
            console.log(item.find(".conj").last())
            item.find(".conj").last().remove();
        }
        queries.push(subCriteria)
    }

    $("#store-query").click(function(evt) {
//        $("#pop-result").html("").append(JSON.stringify(queries, undefined, 2));
//        $("#case-result").html("").append(JSON.stringify(caseQueries, undefined, 2));
//
//        $("#result").show();

        $.ajax({
            url: "/api/1",
            type: 'post',
            data: JSON.stringify({"population": queries, "case": caseQueries}),
//            dataType: "json",
            contentType: "application/json"
//            contentType: 'application/json',
        }).done(function(e) {
            location.reload();
        }).fail(function(e) {
            alert("failed")
        });

    });

    $(".btn").tooltip();

    $( "#tabs" ).tabs();

    $( "#include-population-icd-button" ).button({disabled:true});
    $( "#exclude-population-icd-button" ).button({disabled:true});

    $( "#include-population-atc-button" ).button({disabled:true});
    $( "#exclude-population-atc-button" ).button({disabled:true});

    $( "#add-population-criterion-button" ).button({disabled:false});

    $( "#reset-current-population-criterion-button" ).button({disabled:true});

    $( "#reset-population-criterion-button" ).button({disabled:true});

    $( "#submit-population-criterion-button" ).button({disabled:true});

    $( "#population-sex" ).buttonset();

    $( "#population-sex-both" ).prop('checked',true).button('refresh');

    $( "#population-age-slider" ).slider({
        from: 0,
        to: 120,
        scale: [0, '|', 20, '|', 40, '|', 60, '|', 80, '|', 100, '|', 120],
        limits: false,
        step: 1,
        dimension: '',
        skin: "round_plastic",
        callback: function(value) {
            populationEnableSubQueryAddReset();
            changePopulationAge(value)
        }
    });

    $( "#population-statistics" ).hide();

    $( "#autocomplete-population-icd" ).autocomplete({
	    source: icdCodes
    });
    
    $( "#autocomplete-population-icd" ).keyup(function() {
        if($(this).val() != '') {
            $("#include-population-icd-button").prop('disabled',false).button('refresh');
            $("#exclude-population-icd-button").prop('disabled',false).button('refresh');
        }
    });

    $( "#autocomplete-population-atc" ).autocomplete({
	    source: atcCodes
    });

    $( "#autocomplete-population-atc" ).keyup(function() {
        if($(this).val() != '') {
            $("#include-population-atc-button").prop('disabled',false).button('refresh');
            $("#exclude-population-atc-button").prop('disabled',false).button('refresh');
        }
    });

    $( "#submit-population-criterion" ).hide();

    $( "#include-case-icd-button" ).button({disabled:true});
    $( "#exclude-case-icd-button" ).button({disabled:true});

    $( "#include-case-atc-button" ).button({disabled:true});
    $( "#exclude-case-atc-button" ).button({disabled:true});

    $( "#add-case-criterion-button" ).button({disabled:false});

    $( "#reset-current-case-criterion-button" ).button({disabled:true});

    $( "#reset-case-criterion-button" ).button({disabled:true});

    $( "#submit-case-criterion-button" ).button({disabled:true});

    $( "#case-sex" ).buttonset();

    $( "#case-sex-both" ).prop('checked',true).button('refresh');

    $( "#case-age-slider" ).slider({ from: 0, to: 120, scale: [0, '|', 20, '|', 40, '|', 60, '|', 80, '|', 100, '|', 120], limits: false, step: 1, dimension: '', skin: "plastic", callback: function( value ){changeCaseAge(value)}});

    $( "#case-statistics" ).hide();

    $( "#autocomplete-case-icd" ).autocomplete({
	    source: icdCodes
    });
    
    $( "#autocomplete-case-icd" ).keyup(function() {
        if($(this).val() != '') {
	    $("#include-case-icd-button").prop('disabled',false).button('refresh');
	    $("#exclude-case-icd-button").prop('disabled',false).button('refresh');
        }
    });

    $( "#autocomplete-case-atc" ).autocomplete({
	    source: atcCodes
    });

    $( "#autocomplete-case-atc" ).keyup(function() {
        if($(this).val() != '') {
	    $("#include-case-atc-button").prop('disabled',false).button('refresh');
	    $("#exclude-case-atc-button").prop('disabled',false).button('refresh');
        }
    });

    $( "#submit-case-criterion" ).hide();

    $( "#analysis_accordion" ).accordion({ collapsible: true, active: false });


//    $.getJSON("js/test.json", function(data) {
//	console.log("hejsan");
//    });


    var MinAge = 0;
    var MaxAge = 120;

    function criterion(){
        this.LowerAge = MinAge;
        this.UpperAge = MaxAge;
        this.Sex = "both";
        this.ICDs = [];
        this.ATCs = [];
    };

    function presentDisjunctiveCriterion(CriterionArray){
        var Result = "";
        for (var i = 0; i < CriterionArray.length; i++) {
        if (i > 0) {
            Result += "<BR>        <EM>OR</EM>" + "<BR>" + presentConjunctiveCriterion(CriterionArray[i]);
        } else {
            Result = presentConjunctiveCriterion(CriterionArray[i]);
        }
        };
        Result += "<BR>";
        return Result};

    function getCodeCondition(CodeType,String){
        if (String[0] == "-") {
        Result = CodeType + " &ne; " + String.substring(1,String.length);}
        else {
        Result = CodeType + " = " + String}
        return Result};

    function presentConjunctiveCriterion(Criterion){
        var Result = "";
        if (Criterion.Sex !== "both") {
        Result += "Sex = " + Criterion.Sex;
        }
        if (Criterion.LowerAge > MinAge) {
        if (Result == "") {
            Result = "Age &geq; " + Criterion.LowerAge;}
        else {
            Result += " <EM>AND</EM> Age &geq; " + Criterion.LowerAge;
        }
        }
        if (Criterion.UpperAge < MaxAge) {
        if (Result == "") {
            Result = "Age &leq; " + Criterion.UpperAge;}
        else {
            Result += " <EM>AND</EM> Age &leq; " + Criterion.UpperAge;
        }
        }
        for (var i = 0; i < Criterion.ICDs.length; i++) {
        if (i > 0) {
            Result += " <EM>AND</EM> " + getCodeCondition("ICD",Criterion.ICDs[i])}
        else {
            if (Result == "") {
            Result = getCodeCondition("ICD",Criterion.ICDs[i]);
            }
            else {
            Result += " <EM>AND</EM> " + getCodeCondition("ICD",Criterion.ICDs[i]);
            }
        }
        };
        for (var i = 0; i < Criterion.ATCs.length; i++) {
        if (i > 0) {
            Result += " <EM>AND</EM> " + getCodeCondition("ATC",Criterion.ATCs[i])}
        else {
            if (Result == "") {
            Result = getCodeCondition("ATC",Criterion.ATCs[i]);
            }
            else {
            Result += " <EM>AND</EM> " + getCodeCondition("ATC",Criterion.ATCs[i]);
            }
        }
        };
        return Result;
    };

    var PopulationCriterion = new Array();

    var CurrentPopulationCriterion = new criterion;
    var CurrentPopulationICD = "";
    var CurrentPopulationATC = "";

    function changePopulationSex(Sex){
        query.gender = Sex;
        CurrentPopulationCriterion.Sex = Sex;
        var item = $([
            "<div class='list-group-item'>",
               '<a href="#"><span class="fa fa-trash-o fa-fw pull-right remove-population-sex-criterion"></span></a>',
               '<span class="label label-info pull-right">AND</span>',
            "</div>"].join("\n")).appendTo("#sub-criterion .list-group")
        createSexCriteria(item, Sex)
    }

    function changePopulationAge(Value){
        var Values = Value.split(";");
        var min_age = parseInt(Values[0]), max_age = parseInt(Values[1]);
        $("#sub-criterion .population-age-criterion").remove();
        CurrentPopulationCriterion.LowerAge = min_age;
        CurrentPopulationCriterion.UpperAge = max_age;

        query.min_age = min_age;
        query.max_age = max_age;
        if(min_age > 0) {
            populateAgeCriteria($(["<div class='list-group-item population-age-criterion'>",
                                        '<a href="#"><span class="fa fa-trash-o fa-fw pull-right remove-population-age-criterion"></span></a>',
                                        '<span class="label label-info pull-right">AND</span>',
                                   "</div>"].join("\n")).appendTo("#sub-criterion .list-group"),
                                    min_age,
                                    '<i class="fa fa-angle-right"></i>');
        }

        if(max_age < 120) {
            populateAgeCriteria($(["<div class='list-group-item population-age-criterion'>",
                                        '<a href="#"><span class="fa fa-trash-o fa-fw pull-right remove-population-age-criterion"></span></a>',
                                        '<span class="label label-info pull-right">AND</span>',
                                    "</div>"].join("\n")).appendTo("#sub-criterion .list-group"),
                                    max_age,
                                    '<i class="fa fa-angle-left"></i>');
        }


    //    $("#reset-current-population-criterion-button").prop('disabled',false).button('refresh');
    //    $("#add-population-criterion-button").prop('disabled',false).button('refresh');
    //    showCurrentPopulationCriterion();
    }

    function includePopulationICD(){
        CurrentPopulationICD = $("#autocomplete-population-icd").val();
        console.log(CurrentPopulationICD)
        if(CurrentPopulationICD == "")
            return

        CurrentPopulationCriterion.ICDs.push(CurrentPopulationICD);
        query.include_diags.push(CurrentPopulationICD)

        $( "#autocomplete-population-icd" ).val("");
        $("#sub-criterion .list-group").append([
            "<div class='list-group-item population-icd-criterion'>",
               "<span class='label label-warning'>ICD</span> = ",
               "<span class='label label-default'>" + CurrentPopulationICD + "</span>",
               '<a href="#"><span class="fa fa-trash-o fa-fw pull-right remove-population-icd-criterion"></span></a>',
               '<span class="label label-info pull-right">AND</span>',
            "</div>"].join("\n"))
        CurrentPopulationICD = "";


    //    $("#include-population-icd-button").prop('disabled',true).button('refresh');
    //    $("#exclude-population-icd-button").prop('disabled',true).button('refresh');
    //    $("#reset-current-population-criterion-button").prop('disabled',false).button('refresh');
    //    $("#add-population-criterion-button").prop('disabled',false).button('refresh');
    //    showCurrentPopulationCriterion();
    }

    function excludePopulationICD(){
        CurrentPopulationICD = $("#autocomplete-population-icd").val();
        if(CurrentPopulationICD == "")
            return
        CurrentPopulationCriterion.ICDs.push("-" + CurrentPopulationICD);
        query.exclude_diags.push(CurrentPopulationICD)

        $( "#autocomplete-population-icd" ).val("");
        $("#sub-criterion .list-group").append([
                "<div class='list-group-item population-icd-criterion'>",
                   "<span class='label label-warning'>ICD</span> ≠ ",
                   "<span class='label label-default'>" + CurrentPopulationICD + "</span>",
                   '<a href="#"><span class="fa fa-trash-o fa-fw pull-right remove-population-icd-criterion"></span></a>',
                   '<span class="label label-info pull-right">AND</span>',
                "</div>"].join("\n"))
        CurrentPopulationICD = "";

    //    $("#include-population-icd-button").prop('disabled',true).button('refresh');
    //    $("#exclude-population-icd-button").prop('disabled',true).button('refresh');
    //    $("#reset-current-population-criterion-button").prop('disabled',false).button('refresh');
    //    $("#add-population-criterion-button").prop('disabled',false).button('refresh');
    //    showCurrentPopulationCriterion();
    }

    function includePopulationATC(){
        CurrentPopulationATC = $("#autocomplete-population-atc").val();
        if(CurrentPopulationATC == "")
            return
        CurrentPopulationCriterion.ATCs.push(CurrentPopulationATC);
        query.include_drugs.push(CurrentPopulationATC)
        $( "#autocomplete-population-atc" ).val("");
        $("#sub-criterion .list-group").append([
                    "<div class='list-group-item population-atc-criterion'>",
                       "<span class='label label-warning'>ATC</span> = ",
                       "<span class='label label-default'>" + CurrentPopulationATC + "</span>",
                       '<a href="#"><span class="fa fa-trash-o fa-fw pull-right remove-population-atc-criterion"></span></a>',
                       '<span class="label label-info pull-right">AND</span>',
                    "</div>"].join("\n"))

        CurrentPopulationATC = "";
    //    $("#include-population-atc-button").prop('disabled',true).button('refresh');
    //    $("#exclude-population-atc-button").prop('disabled',true).button('refresh');
    //    $("#reset-current-population-criterion-button").prop('disabled',false).button('refresh');
    //    $("#add-population-criterion-button").prop('disabled',false).button('refresh');
    //    showCurrentPopulationCriterion();
    }

    function excludePopulationATC(){
        CurrentPopulationATC = $("#autocomplete-population-atc").val();
        if(CurrentPopulationATC == "")
            return
        CurrentPopulationCriterion.ATCs.push("-" + CurrentPopulationATC);
        query.exclude_drugs.push(CurrentPopulationATC)

        $( "#autocomplete-population-atc" ).val("");
        $("#sub-criterion .list-group").append([
                        "<div class='list-group-item population-atc-criterion'>",
                           "<span class='label label-warning'>ATC</span> ≠ ",
                           "<span class='label label-default'>" + CurrentPopulationATC + "</span>",
                           '<a href="#"><span class="fa fa-trash-o fa-fw pull-right remove-population-atc-criterion"></span></a>',
                           '<span class="label label-info pull-right">AND</span>',
                        "</div>"].join("\n"))
        CurrentPopulationATC = "";
    //    $("#include-population-atc-button").prop('disabled',true).button('refresh');
    //    $("#exclude-population-atc-button").prop('disabled',true).button('refresh');
    //    $("#reset-current-population-criterion-button").prop('disabled',false).button('refresh');
    //    $("#add-population-criterion-button").prop('disabled',false).button('refresh');
    //    showCurrentPopulationCriterion();
    }

    function resetCurrentPopulationCriterion(){
        CurrentPopulationCriterion.ICDs = [];
        CurrentPopulationCriterion.ATCs = [];
        CurrentPopulationCriterion.Sex = "both";
        CurrentPopulationCriterion.LowerAge = MinAge;
        CurrentPopulationCriterion.UpperAge = MaxAge;
        $( "#autocomplete-population-atc" ).val("");
        $( "#autocomplete-population-icd" ).val("");
        $("#reset-current-population-criterion-button").prop('disabled',true).button('refresh');
        if (PopulationCriterion.length > 0) {
        $("#add-population-criterion-button").prop('disabled',true).button('refresh');}
        else {
        $("#add-population-criterion-button").prop('disabled',false).button('refresh');}
        $( "#population-age-slider" ).slider("value",0,120);
        $( "#population-sex-both" ).prop('checked',true).button('refresh');
        showCurrentPopulationCriterion();
    }

    function resetPopulationCriterion(){
        $( "#submit-population-criterion" ).hide();
        $( "#population-statistics" ).hide();
        $( "#enter-population-criterion" ).fadeIn();
        $( "#population-criterion" ).html("Population population-criterion:<br><br><em>none</em><br><br>");
        $( "#reset-population-criterion-button" ).button({disabled:true}).button('refresh');
        $( "#submit-population-criterion-button" ).button({disabled:true}).button('refresh');
        $( "#submit-population-criterion-button" ).show();
        $( "#add-population-criterion-button" ).button("option","label","Make criterion").button('refresh');
        PopulationCriterion = new Array();
        resetCurrentPopulationCriterion();
    };

    function addPopulationCriterion(){
        if (CurrentPopulationCriterion.LowerAge == MinAge && CurrentPopulationCriterion.UpperAge == MaxAge && CurrentPopulationCriterion.Sex == "both" && CurrentPopulationCriterion.ICDs.length === 0 && CurrentPopulationCriterion.ATCs.length === 0) {
        PopulationCriterion.push(CurrentPopulationCriterion);
        $( "#population-criterion" ).html("<b>Population criterion:</b><br><br><em>include all</em>");
        resetCurrentPopulationCriterion();
        $( "#population-age-slider" ).slider("value",0,120);
        $( "#population-sex-both" ).prop('checked',true).button('refresh');
        $( "#add-population-criterion-button" ).prop('disabled',true).button('refresh');
        $( "#reset-population-criterion-button" ).prop('disabled',false).button('refresh');
        $( "#submit-population-criterion-button" ).prop('disabled',false).button('refresh');
            $( "#enter-population-criterion" ).hide();
            $( "#submit-population-criterion" ).fadeIn();}
        else {
        $( "#submit-population-criterion" ).fadeIn();
        var c = new criterion;
        c.LowerAge = CurrentPopulationCriterion.LowerAge;
        c.UpperAge = CurrentPopulationCriterion.UpperAge;
        c.Sex = CurrentPopulationCriterion.Sex;
        c.ICDs = CurrentPopulationCriterion.ICDs;
        c.ATCs = CurrentPopulationCriterion.ATCs;
        PopulationCriterion.push(c);
        $( "#population-criterion" ).html("<b>Population criterion:</b><br><br>" + presentDisjunctiveCriterion(PopulationCriterion));
        resetCurrentPopulationCriterion();
        $( "#add-population-criterion-button" ).button("option","label","Add criterion");
        $( "#add-population-criterion-button" ).prop('disabled',true).button('refresh');
        $( "#reset-population-criterion-button" ).prop('disabled',false).button('refresh');
        $( "#submit-population-criterion-button" ).prop('disabled',false).button('refresh');}
    }

    function showCurrentPopulationCriterion() {
        var Result = presentConjunctiveCriterion(CurrentPopulationCriterion);
        if (Result == "") {
        $("#reset-current-population-criterion-button").prop('disabled',true).button('refresh');
        if (PopulationCriterion.length > 0) {
                $( "#current-population-criterion" ).html("<b>Additional criterion:</b> <br><br><em>none</em><br>");
            $( "#add-population-criterion-button" ).prop('disabled',true).button('refresh');}
        else {
                $( "#current-population-criterion" ).html("<b>New criterion:</b> <br><br><em>include all</em><br>");
            $( "#add-population-criterion-button" ).prop('disabled',false).button('refresh');}
        }
        else {
        if (PopulationCriterion.length > 0) {
                $( "#current-population-criterion" ).html("<b>Additional criterion:</b> <br><br>" + Result + "<br>");}
        else {
            $( "#current-population-criterion" ).html("<b>New criterion:</b> <br><br>" + Result + "<br>");}
        }
    };

    function submitPopulationCriterion(){
        $( "#enter-population-criterion" ).hide();
        $( "#submit-population-criterion-button" ).hide();
        $( "#population-statistics" ).fadeIn(1000);
    };

    var CaseCriterion = new Array();

    var CurrentCaseCriterion = new criterion;
    var CurrentCaseICD = "";
    var CurrentCaseATC = "";

    function changeCaseSex(Sex){
        CurrentCaseCriterion.Sex = Sex;
        $("#reset-current-case-criterion-button").prop('disabled',false).button('refresh');
        $("#add-case-criterion-button").prop('disabled',false).button('refresh');
        showCurrentCaseCriterion();
    }

    function changeCaseAge(Value){
        var Values = Value.split(";");
        CurrentCaseCriterion.LowerAge = Number(Values[0]);
        CurrentCaseCriterion.UpperAge = Number(Values[1]);
        $("#reset-current-case-criterion-button").prop('disabled',false).button('refresh');
        $("#add-case-criterion-button").prop('disabled',false).button('refresh');
        showCurrentCaseCriterion();
    }

    function includeCaseICD(){
        CurrentCaseICD = $("#autocomplete-case-icd").val();
        CurrentCaseCriterion.ICDs.push(CurrentCaseICD);
        $( "#autocomplete-case-icd" ).val("");
        CurrentCaseICD = "";
        $("#include-case-icd-button").prop('disabled',true).button('refresh');
        $("#exclude-case-icd-button").prop('disabled',true).button('refresh');
        $("#reset-current-case-criterion-button").prop('disabled',false).button('refresh');
        $("#add-case-criterion-button").prop('disabled',false).button('refresh');
        showCurrentCaseCriterion();
    }

    function excludeCaseICD(){
        CurrentCaseICD = $("#autocomplete-case-icd").val();
        CurrentCaseCriterion.ICDs.push("-" + CurrentCaseICD);
        $( "#autocomplete-case-icd" ).val("");
        CurrentCaseICD = "";
        $("#include-case-icd-button").prop('disabled',true).button('refresh');
        $("#exclude-case-icd-button").prop('disabled',true).button('refresh');
        $("#reset-current-case-criterion-button").prop('disabled',false).button('refresh');
        $("#add-case-criterion-button").prop('disabled',false).button('refresh');
        showCurrentCaseCriterion();
    }

    function includeCaseATC(){
        CurrentCaseATC = $("#autocomplete-case-atc").val();
        CurrentCaseCriterion.ATCs.push(CurrentCaseATC);
        $( "#autocomplete-case-atc" ).val("");
        CurrentCaseATC = "";
        $("#include-case-atc-button").prop('disabled',true).button('refresh');
        $("#exclude-case-atc-button").prop('disabled',true).button('refresh');
        $("#reset-current-case-criterion-button").prop('disabled',false).button('refresh');
        $("#add-case-criterion-button").prop('disabled',false).button('refresh');
        showCurrentCaseCriterion();
    }

    function excludeCaseATC(){
        CurrentCaseATC = $("#autocomplete-case-atc").val();
        CurrentCaseCriterion.ATCs.push("-" + CurrentCaseATC);
        $( "#autocomplete-case-atc" ).val("");
        CurrentCaseATC = "";
        $("#include-case-atc-button").prop('disabled',true).button('refresh');
        $("#exclude-case-atc-button").prop('disabled',true).button('refresh');
        $("#reset-current-case-criterion-button").prop('disabled',false).button('refresh');
        $("#add-case-criterion-button").prop('disabled',false).button('refresh');
        showCurrentCaseCriterion();
    }

    function resetCurrentCaseCriterion(){
        CurrentCaseCriterion.ICDs = [];
        CurrentCaseCriterion.ATCs = [];
        CurrentCaseCriterion.Sex = "both";
        CurrentCaseCriterion.LowerAge = MinAge;
        CurrentCaseCriterion.UpperAge = MaxAge;
        $( "#autocomplete-case-atc" ).val("");
        $( "#autocomplete-case-icd" ).val("");
        $("#reset-current-case-criterion-button").prop('disabled',true).button('refresh');
        if (CaseCriterion.length > 0) {
        $("#add-case-criterion-button").prop('disabled',true).button('refresh');}
        else {
        $("#add-case-criterion-button").prop('disabled',false).button('refresh');}
        $( "#case-age-slider" ).slider("value",0,120);
        $( "#case-sex-both" ).prop('checked',true).button('refresh');
        showCurrentCaseCriterion();
    }

    function resetCaseCriterion(){
        $( "#submit-case-criterion" ).hide();
        $( "#case-statistics" ).hide();
        $( "#enter-case-criterion" ).fadeIn();
        $( "#case-criterion" ).html("<b>Case criterion:</b><br><br><em>none</em><br><br>");
        $( "#reset-case-criterion-button" ).button({disabled:true}).button('refresh');
        $( "#submit-case-criterion-button" ).button({disabled:true}).button('refresh');
        $( "#submit-case-criterion-button" ).show();
        $( "#add-case-criterion-button" ).button("option","label","Make criterion").button('refresh');
        CaseCriterion = new Array();
        resetCurrentCaseCriterion();
    };

    function addCaseCriterion(){
        if (CurrentCaseCriterion.LowerAge == MinAge && CurrentCaseCriterion.UpperAge == MaxAge && CurrentCaseCriterion.Sex == "both" && CurrentCaseCriterion.ICDs.length === 0 && CurrentCaseCriterion.ATCs.length === 0) {
        CaseCriterion.push(CurrentCaseCriterion);
        $( "#case-criterion" ).html("<b>Case criterion:</b><br><br><em>include all</em>");
        resetCurrentCaseCriterion();
        $( "#case-age-slider" ).slider("value",0,120);
        $( "#case-sex-both" ).prop('checked',true).button('refresh');
        $( "#add-case-criterion-button" ).prop('disabled',true).button('refresh');
        $( "#reset-case-criterion-button" ).prop('disabled',false).button('refresh');
        $( "#submit-case-criterion-button" ).prop('disabled',false).button('refresh');
            $( "#enter-case-criterion" ).hide();
            $( "#submit-case-criterion" ).fadeIn();}
        else {
        $( "#submit-case-criterion" ).fadeIn();
        var c = new criterion;
        c.LowerAge = CurrentCaseCriterion.LowerAge;
        c.UpperAge = CurrentCaseCriterion.UpperAge;
        c.Sex = CurrentCaseCriterion.Sex;
        c.ICDs = CurrentCaseCriterion.ICDs;
        c.ATCs = CurrentCaseCriterion.ATCs;
        CaseCriterion.push(c);
        $( "#case-criterion" ).html("<b>Case criterion:</b><br><br>" + presentDisjunctiveCriterion(CaseCriterion));
        resetCurrentCaseCriterion();
        $( "#add-case-criterion-button" ).button("option","label","Add criterion");
        $( "#add-case-criterion-button" ).prop('disabled',true).button('refresh');
        $( "#reset-case-criterion-button" ).prop('disabled',false).button('refresh');
        $( "#submit-case-criterion-button" ).prop('disabled',false).button('refresh');}
    }

    function showCurrentCaseCriterion() {
        var Result = presentConjunctiveCriterion(CurrentCaseCriterion);
        if (Result == "") {
        $("#reset-current-case-criterion-button").prop('disabled',true).button('refresh');
        if (CaseCriterion.length > 0) {
                $( "#current-case-criterion" ).html("<b>Additional criterion:</b> <br><br><em>none</em><br>");
            $( "#add-case-criterion-button" ).prop('disabled',true).button('refresh');}
        else {
                $( "#current-case-criterion" ).html("<b>New criterion:</b> <br><br><em>include all</em><br>");
            $( "#add-case-criterion-button" ).prop('disabled',false).button('refresh');}
        }
        else {
        if (CaseCriterion.length > 0) {
                $( "#current-case-criterion" ).html("<b>Additional criterion:</b> <br><br>" + Result + "<br>");}
        else {
            $( "#current-case-criterion" ).html("<b>New criterion:</b> <br><br>" + Result + "<br>");}
        }
    };

    function submitCaseCriterion(){
        $( "#enter-case-criterion" ).hide();
        $( "#submit-case-criterion-button" ).hide();
        $( "#case-statistics" ).fadeIn(1000);
    };
});

