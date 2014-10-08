$(function() {
    Chart.defaults.global.responsive = true;
    $.ajaxSetup ({
        // Disable caching of AJAX responses
        cache: false
    });

    $.extend({
        getUrl: function (name) {
            return decodeURI(
                (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
            )
        }
    });



    var client = new AdexClient("ws://127.0.0.1:8080/ws")
    client.on_error = function(data) {
        errorBlock(data)
    }

    var populationQuery = undefined;
    var caseQuery = undefined;
    var dispId = undefined;

    $(document).on("click", "#build-decision-tree", function() {
        loadingBlock();
        var criterion = $("#decision-tree-criterion").val();
        var depth = $("#decision-tree-depth").val();
        if(depth != undefined && depth != "") {
            depth = parseInt(depth)
        } else {
            depth = undefined;
        }
        $("#decision-tree-canvas").html("")
        client.build_dt()
    });

    $(document).on("click", "#build-random-forest", function() {
            loadingBlock();

            console.log("calling build random forest")
            var criterion = $("#random-forest-criterion").val();
            var depth = $("#random-forest-no-trees").val();
            if(depth != undefined && depth != "") {
                depth = parseInt(depth)
            } else {
                depth = undefined;
            }
            $("#random-forest-canvas").html("")
            client.build_rf()
        });

    $(document).on("click", ".open-disproportionality", function () {
        dispId = $(this).data('id');
        $("#id-heading").text(dispId)
        $("#disp-modal .table-responsive tbody").html("empty")
    });

    $(document).on("click", ".open-drug-disproportionality", function () {
        dispId = $(this).data('id');
        $("#drug-id-heading").text(dispId)
        $("#drug-disp-modal .table-responsive tbody").html("empty")
    });

    $("#drug-disp-filter").keyup(function (evt) {
         var tr = $("#drug-disp-modal .table-responsive tbody tr").hide()
         var q = this.value.trim();
         if(q == "") {
             tr.show();
             return;
         }

         tr.filter(function(i, v) {
             var t = $(this);
             if (t.is(":contains('" + q + "')")) {
                 return true;
             } else {
                 return false;
             }
         }).show();
     });

     $("#diag-disp-filter").keyup(function (evt) {
              var tr = $("#disp-modal .table-responsive tbody tr").hide()
              var q = this.value.trim();
              if(q == "") {
                  tr.show();
                  return;
              }

              tr.filter(function(i, v) {
                  var t = $(this);
                  if (t.is(":contains('" + q + "')")) {
                      return true;
                  } else {
                      return false;
                  }
              }).show();
          });

    $(document).on("keyup", "#drug-filter", function (evt) {
        var tr = $("#drug-table tr").hide()
        var q = this.value.trim();
        if(q == "") {
            tr.show();
            return;
        }

        tr.filter(function(i, v) {
            var t = $(this);
            if (t.is(":contains('" + q + "')")) {
                return true;
            } else {
                return false;
            }
        }).show();
    });

    $(document).on("keyup", "#diagnosis-filter", function (evt) {
        var tr = $("#diagnosis-table tr").hide()
        var q = this.value.trim();
        if(q == "") {
            tr.show();
            return;
        }

        tr.filter(function(i, v) {
            var t = $(this);
            if (t.is(":contains('" + q + "')")) {
                return true;
            } else {
                return false;
            }
        }).show();
    });

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

    $("#calculate-disp").click(function(evt){
        console.log(dispId)
        loadingBlockComponent("#disp-modal");
        client.population_disp(dispId);
    });

    $("#calculate-drug-disp").click(function(evt){
        console.log(dispId)
        loadingBlockComponent("#drug-disp-modal");
        client.population_drug_disp(dispId);
    });

    client.on_build_rf = function(data) {
        console.log(data)
        var viData = JSON.parse(data.rf);
        render_variable_importance("#random-forest-canvas", viData)
        $.unblockUI();

    }

    client.on_build_dt = function(data) {
        console.log(data)
        var treeData = JSON.parse(data.dt);
        render_tree("#decision-tree-canvas", treeData);
        $.unblockUI();
    }

    client.on_population_disp = function(data) {
        loadingUnblockComponent("#disp-modal");
        render_disp("#disp-modal .table-responsive tbody", data)
        loadingUnblockComponent("#disp-modal")
    }

    client.on_population_drug_disp = function(data) {
        loadingUnblockComponent("#drug-disp-modal");
        render_disp("#drug-disp-modal .table-responsive tbody", data)
        loadingUnblockComponent("#drug-disp-modal")
    }

    client.on_open = function(data) {
        loadingBlock()
        var id = $.getUrl("id");
        console.log(id)
        $.getJSON("/api/" + id).success(function(data){
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


            render_table("#drug-table", data.drug_distribution, data.total_no_patients, "#drug-disp-modal", "open-drug-disproportionality")
            render_table("#diagnosis-table", data.diagnos_distribution, data.total_no_patients, "#disp-modal", "open-disproportionality")
            $.unblockUI()
        })
    };
});