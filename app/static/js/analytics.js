$(function() {
    Chart.defaults.global.responsive = true;
    $.ajaxSetup ({
        // Disable caching of AJAX responses
        cache: false
    });

    $(document).on("click", ".open-disproportionality", function () {
         var id = $(this).data('id');
         console.log(id)
    });

    var client = new AdexClient("ws://127.0.0.1:8080/ws")
    client.on_error = function(data) {
        errorBlock(data)
    }

    var populationQuery = undefined;
    var caseQuery = undefined;

    $("#population-overview").click(function(evt) {
        $(evt.target).parent().toggleClass("active")
        $("#split-case-control").parent().toggleClass("active")
        loadingBlock()
        client.population_query(populationQuery)
    });

    $("#split-case-control").click(function(evt) {
        $(evt.target).parent().addClass("active")
        $("#population-overview").parent().removeClass("active")
        loadingBlock();
        client.population_split(caseQuery)
    });

    client.on_open = function(data) {
        loadingBlock()
        $.getJSON("/api/1").success(function(data){
            render_query("#population-criteria", data.population)
            populationQuery = data.population

            if(data.case !== undefined) {
                caseQuery = data.case
                render_query("#case-criteria", data.case)
            }
            client.population_query(data.population)
        }).fail(function(e) {
            console.log("Fail", e)
        });
    }

    client.on_population_split = function(data) {
        console.log(data);
        $("#analysis-main").html("").load("/static/html/case_control_analysis.html", function() {
            render_gender_distribution("#case .sex-distribution", data.case.gender_distribution);
            render_age_distribution("#case .age-distribution", data.case.age_distribution);
            render_distribution("#case .drug-distribution", data.case.drug_distribution);
            render_distribution("#case .diagnosis-distribution", data.case.diagnos_distribution);

            render_gender_distribution("#control .sex-distribution", data.control.gender_distribution);
            render_age_distribution("#control .age-distribution", data.control.age_distribution);
            render_distribution("#control .drug-distribution", data.control.drug_distribution);
            render_distribution("#control .diagnosis-distribution", data.control.diagnos_distribution);

            $.unblockUI()
        });
    }

    client.on_population_query = function(data) {
        $("#analysis-main").html("").load("/static/html/population_analysis.html", function() {
            render_gender_distribution("#population-sex-distribution", data.gender_distribution)
            render_age_distribution("#population-age-distribution", data.age_distribution)
            render_distribution("#population-drug-distribution", data.drug_distribution);
            render_distribution("#population-diagnosis-distribution", data.diagnos_distribution);


            render_table("#drug-table", data.drug_distribution, data.total_no_patients, "#disp-modal", "open-disproportionality")
            render_table("#diagnosis-table", data.diagnos_distribution, data.total_no_patients, "#disp-modal", "open-disproportionality")
            $.unblockUI()
        })
    };
});