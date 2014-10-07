function AdexClient (endpoint) {
	this.socket = new WebSocket(endpoint);
	var self = this;


	this.socket.onmessage = function(data) {
		try {
			data = JSON.parse(data.data);
			method = data.method || "error";
			args = data.args || "unkown data"

			switch (method) {
				case "build_dt":
					if(self.on_build_dt) 
						self.on_build_dt(args)
					break;
				case "population_query":
					if(self.on_population_query)
						self.on_population_query(args)
					break;
				case "population_update":
					if(self.on_population_update)
						self.on_population_update(args)
					break;
				case "population_remove":
					if(self.on_population_remove)
						self.on_population_remove();
					break;
				case "population_split":
					if(self.on_population_split)
						self.on_population_split(args)
                    break;
                case "build_rf":
                   if(self.on_build_rf){
                        self.on_build_rf(args);
                   }
                   break;
                case "population_disp":
                    if(self.on_population_disp)
                        self.on_population_disp(args)
                    break;
				case "error":
					if(self.on_error)
						self.on_error(args)
					break;
			}
		} catch (e) {
			if(self.on_error)
				self.on_error(e)
		}	
	}

	this.socket.onopen = function(data) {
	    if(self.on_open) {
	        self.on_open(data)
	    }
	}

	this.socket.onerror = function(data) {
		if(self.on_error)
			self.on_error(data)
	}
	this.socket.onclose = function(data) {
		if(self.on_close)
			self.on_close(data)
	}

	this.build_dt = function() {
		this.remote_call("build_dt")
	}

	this.build_rf = function() {
        this.remote_call("build_rf")
    }

	this.population_query = function(query) {
		this.remote_call("population_query", [query]);
	}

	this.population_update = function(query) {
		this.remote_call("population_update", [query]);
	}

	this.population_remove = function() {
		this.remote_call("population_remove")
	}

	this.population_split = function(query) {
		this.remote_call("population_split", [query]);
	}

	this.population_disp = function(code) {
	    this.remote_call("population_disp", [code])
	}
 

	this.remote_call = function(func, args) {
		if(args !== undefined)
			self.socket.send(JSON.stringify({"method": func, args: args}));
		else
			self.socket.send(JSON.stringify({"method": func}));
	}



};