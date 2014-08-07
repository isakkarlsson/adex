$(function() {

    Chart.defaults.global.responsive = true;
    var client = new AdexClient("ws://127.0.0.1:8080/ws")
    client.on_error = function(data) {
        console.log(data)
    }
    client.on_open = function(data) {
        $.getJSON("/api/1").success(function(data){
            console.log(data)
            render_query("#population-criteria", data.population)
            render_query("#case-criteria", data.case)

            client.population_query(data.population)
        }).fail(function(e) {
            console.log("Fail", e)
        });
    }

    client.on_population_query = function(data) {
        console.log(data)
        render_gender_distribution("#population-sex-distribution", data.gender_distribution)
        render_age_distribution("#population-age-distribution", data.age_distribution)
        render_distribution("#population-drug-distribution", data.drug_distribution);
        render_distribution("#population-diagnosis-distribution", data.diagnos_distribution);

    };
});