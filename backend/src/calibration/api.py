from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from calibration.fixture import engineering_cycle
from calibration.view import department_view_json


class Handler(BaseHTTPRequestHandler):
    def do_POST(self) -> None:
        self.send_error(405)

    def do_PUT(self) -> None:
        self.send_error(405)

    def do_DELETE(self) -> None:
        self.send_error(405)

    def do_GET(self) -> None:
        if self.path.split("?", 1)[0] != "/api/department":
            self.send_error(404)
            return
        body = json.dumps(department_view_json(engineering_cycle())).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args: object) -> None:
        del format, args


def serve(host: str = "127.0.0.1", port: int = 8000) -> ThreadingHTTPServer:
    return ThreadingHTTPServer((host, port), Handler)


def main() -> None:
    server = serve()
    server.serve_forever()


if __name__ == "__main__":
    main()
