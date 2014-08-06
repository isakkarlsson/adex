$(function() {
    var client = new AdexClient("ws://127.0.0.1:8080/ws")
    client.on_error = function(data) {
        console.log(data)
    }
    client.on_population_query = function(data) {
        console.log(data)
    };

    $.getJSON("/api/1").success(function(data){
        console.log(data)
        setTimeout(function() {
            client.population_query(data)
        }, 100)
//
    }).fail(function(e) {
        console.log("Fail", e)
    });
});