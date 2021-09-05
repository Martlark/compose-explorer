import base64
from hashlib import sha256
from rjsmin import jsmin
import os

from jinja2 import nodes, Markup
from jinja2.ext import Extension

from config import BASE_DIR

# custom tags
# see: http://jinja.pocoo.org/docs/dev/extensions/


class ImportJs(Extension):
    """
    Provides a {% import_js 'file-name' %} tag that minifies and adds integrity (non debug)
    example:
    {% import_js 'hello.js' %}
    results in:
    <script src="static/js/file-name.js" defer=defer integrity="sh256-integrity"></script>
    imports js from app/js
    exports to app/static/js
    in production minifies the source using jsmin


    """

    tags = {"import_js"}

    def __init__(self, environment):
        super(ImportJs, self).__init__(environment)
        self.imports = {}
        self.static_folder = os.getenv("STATIC_JS", "static/js")
        self.source_dir = os.path.join(BASE_DIR, "app", "js")
        self.exclude_starts_with = ["export default ", "export "]
        self.debug = (
            os.getenv("DEPLOY_ENV") == "Debug"
            or os.getenv("FLASK_DEBUG") == "1"
            or os.getenv("DEBUG") == "1"
            or os.getenv("DEBUG") == "True"
        )
        self.static_target_dir = os.path.join(BASE_DIR, "app", self.static_folder)
        if not os.path.isdir(self.static_target_dir):
            os.makedirs(self.static_target_dir, exist_ok=True)

    @staticmethod
    def safe_delete(filename):
        if os.path.isfile(filename):
            try:
                os.unlink(filename)
            except:
                pass

    @staticmethod
    def minimize_js(source_in, file_out):
        minified = jsmin(source_in)
        with open(file_out, "w") as f:
            f.write(minified)

    def generate_256_sri(self, file):
        if self.debug:
            return ""
        with open(file, "rb") as f:
            body = f.read()
            hash256 = sha256(body).digest()
            sha = base64.b64encode(hash256).decode()

        return 'integrity="sha256-{}"'.format(sha)

    @staticmethod
    def get_file_age_in_seconds(filename):
        """
        return the file age in whole seconds

        :param filename: the path of the file to valid_password
        :return: number of whole seconds
        """
        return int(os.path.getmtime(filename))

    def import_file(self, source_file):
        """
        import all of a source file and any imports within

        * MUST be on a single line starting with "import "
        * module to be imported must be surrounded with double quotes
        * example: import {ModelBase} from "modelBase.js"
        * duplicate imports are excluded
        * .js is appended if not found on the module name

        :param source_file:
        :return: concatenated source code
        """
        source_code = ""
        source_file_directory = self.source_dir + os.path.dirname(source_file)[len(self.source_dir) :]
        with open(source_file) as sf:
            for line in sf.readlines():
                if line.lstrip().startswith("import "):
                    parts = line.split('"')
                    if len(parts) < 2:
                        raise Exception("import statement malformed: file: {}, line: {}".format(source_file, line))
                    import_file_name = os.path.normpath(os.path.join(source_file_directory, parts[1]))

                    if not import_file_name.endswith(".js"):
                        import_file_name += ".js"

                    if os.path.isfile(import_file_name):
                        if import_file_name not in self.imports:
                            self.imports[import_file_name] = True

                            source_code += "/* import_js: importing from {import_file_name} */\n".format(
                                import_file_name=parts[1]
                            )
                            source_code += self.import_file(import_file_name)
                            source_code += "\n/* import_js: import complete from {} */\n".format(parts[1])
                    else:
                        source_code += "/* import_js: excluding missing file {import_file_name}: {line} */".format(
                            line=line, import_file_name=import_file_name
                        )
                    line = ""
                else:
                    for exclude_token in self.exclude_starts_with:
                        if line.startswith(exclude_token):
                            line = line[len(exclude_token) :]
                            break
                source_code += line
        return source_code

    def _render_tag(self, import_file, caller):
        # debug = False
        self.imports = {}
        source_file = os.path.join(self.source_dir, import_file)
        base_import_file = import_file.split(".")[0]
        target_source_directory = os.path.join(self.static_target_dir, os.path.dirname(import_file))
        if not os.path.isdir(target_source_directory):
            os.makedirs(target_source_directory, exist_ok=True)

        cache_buster = ""
        if self.debug:
            age = "debug"
            # cache_buster = f'?cache_buster={self.get_file_age_in_seconds(source_file)}'
        else:
            age = self.get_file_age_in_seconds(source_file)
        target_source = "{base}-{age}.js".format(age=age, base=base_import_file)
        min_target_source = "{base}-{age}.min.js".format(age=age, base=base_import_file)

        target_source_file = os.path.join(self.static_target_dir, target_source)
        min_target_source_file = os.path.join(self.static_target_dir, min_target_source)

        # remove file if debug
        if self.debug:
            if os.path.isfile(target_source_file):
                self.safe_delete(target_source_file)

        if not (
            self.debug
            and os.path.isfile(target_source_file)
            or (not self.debug and os.path.isfile(min_target_source_file))
        ):
            # built file does not exist
            source_code = "/* import_js: original source: {}, generated target: {} */\n".format(
                import_file, target_source
            )
            source_code += self.import_file(source_file)

            with open(target_source_file, "w") as f:
                f.write(source_code)

            if not self.debug:
                # minimize source
                try:
                    self.minimize_js(source_code, min_target_source_file)
                    self.safe_delete(target_source_file)
                    target_source_file = min_target_source_file
                except Exception as e:
                    print("minimize failed", e)
                    min_target_source = target_source

        if not self.debug:
            target_source = min_target_source
            target_source_file = min_target_source_file

        sri_256 = self.generate_256_sri(target_source_file)
        template = u"""<script src="/{static_folder}/{target_source}{cache_buster}" defer=defer {sri}></script>"""

        return Markup(
            template.format(
                target_source=target_source,
                static_folder=self.static_folder,
                sri=sri_256,
                cache_buster=cache_buster,
            )
        )

    def parse(self, parser):
        lineno = next(parser.stream).lineno
        args = [parser.parse_expression()]
        node = self.call_method("_render_tag", args)
        return nodes.CallBlock(node, [], [], [], lineno=lineno)
