# !python
import uuid, sys
# frame = adef.ADEFrame(*adef.load_dataset("/Volumes/SECURE USB/data/drugs.csv", "/Volumes/SECURE USB/data/diagnoses.csv",
#                                          "/Volumes/SECURE USB/data/patients.csv"))
# "/Volumes/SECURE USB/data/drugs.csv","/Volumes/SECURE USB/data/diagnoses.csv","/Volumes/SECURE USB/data/patients.csv"
from app.adex.dataframe import ADEFrame, load_dataset

# frame = ADEFrame(*load_dataset("/Volumes/SECURE USB/data-small/drugs.csv",
#                                "/Volumes/SECURE USB/data-small/diagnoses.csv",
#                                "/Volumes/SECURE USB/data-small/patients.csv"))
frame = None
if __name__ == "__main__":
    from app import app

    from flask_restful import Api

    from twisted.python import log
    from twisted.internet import reactor
    from twisted.web.server import Site
    from twisted.web.wsgi import WSGIResource

    from autobahn.twisted.websocket import WebSocketServerFactory
    from autobahn.twisted.resource import WebSocketResource, WSGIRootResource, HTTPChannelHixie76Aware

    from app.views import RestfulQueryStore
    from app.adex.websocket import server_protocol

    app.secret_key = str(uuid.uuid4())

    api = Api(app)
    api.add_resource(RestfulQueryStore, '/api/<string:query_id>')

    ws_factory = WebSocketServerFactory("ws://localhost:8080", debug=True)
    ws_factory.protocol = server_protocol(frame)

    ws_factory.setProtocolOptions(allowHixie76=True)

    ws_resource = WebSocketResource(ws_factory)

    wsgi_resource = WSGIResource(reactor, reactor.getThreadPool(), app)
    root_resource = WSGIRootResource(wsgi_resource, {'ws': ws_resource})

    site = Site(root_resource)
    site.protocol = HTTPChannelHixie76Aware

    log.startLogging(sys.stdout)
    reactor.listenTCP(8080, site)
    reactor.run()

