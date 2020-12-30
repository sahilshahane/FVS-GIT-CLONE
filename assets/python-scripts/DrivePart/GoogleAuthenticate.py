import pickle,os,socket
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

import webbrowser
import wsgiref.simple_server
import wsgiref.util
# WHENEVER THE SCOPE CHANGES THE YOU HAVE TO RECREATE THE tocken.pickle FILE SO MAKE SURE YOU DELETE THE FILE AND THEN RUN THE
# CODE AGAIN WITH THE NEW SCOPE
#
# https://www.googleapis.com/auth/drive.metadata.readonly - Allows read-only access to file metadata
#                                                           (excluding downloadUrl and contentHints.thumbnail), but does not allow
#                                                           any access to read or download file content.
# https://www.googleapis.com/auth/drive - Full, permissive scope to access all of a user's files, excluding the Application Data
#                                         folder.
#
# https://www.googleapis.com/auth/drive.file - Per-file access to files created or opened by the app. File authorization is granted
#                                              on a per-user basis and is revoked when the user deauthorizes the app.
#
#   So create the tocken.pickle file with the proper Scope which gives you the proper access
#   And you can chain the tockens like a listp["", ""]
#   Different scope means different privileges, you need to delete token.pickle file in your working directory and run again the code to authenticate with the new scope.
# class Server(BaseHTTPRequestHandler):

class _WSGIRequestHandler(wsgiref.simple_server.WSGIRequestHandler):
    def log_message(self, format, *args):
        # pylint: disable=redefined-builtin
        # (format is the argument name defined in the superclass.)
        pass


class _RedirectWSGIApp(object):
    def __init__(self, success_message):

        self.last_request_uri = None
        self._success_message = success_message

    def __call__(self, environ, start_response):

        start_response("200 OK", [("Content-type", "text/plain")])
        self.last_request_uri = wsgiref.util.request_uri(environ)
        return [self._success_message.encode("utf-8")]

class NoGoogleIDFound(Exception):
  def __init__(self,msg="No Google Login / ID Found, Please Log In") -> None:
      super().__init__(msg)

def get_gdrive_service(CCODES):
    creds = None
    TOKEN_FILE_PATH = str(os.path.join(os.environ["APP_FOLDER_PATH"],"token.pickle"))

    try:
      socket.create_connection(("Google.com", 80))

      # The file token.pickle stores the user's access and refresh tokens, and is
      # created automatically when the authorization flow completes for the first
      # time.
      if os.path.exists(TOKEN_FILE_PATH):
          with open(TOKEN_FILE_PATH, 'rb') as token:
              creds = pickle.load(token)

      # If there are no (valid) credentials available, let the user log in.
      if not creds or not creds.valid:
          if creds and creds.expired and creds.refresh_token:
              creds.refresh(Request())
          else:
            raise NoGoogleIDFound

          # Save the credentials for the next run
          with open(TOKEN_FILE_PATH, 'wb') as token:
              pickle.dump(creds, token)
      # return Google Drive API service
      service_obj = build('drive', 'v3', credentials=creds)  #This the drive service object which will be used to carry out all the tasks
      yield {"code":CCODES["GOOGLE_SERVICE_OBJECT"],"data": service_obj}

    except OSError as e:
      yield {"code":CCODES["INTERNET_CONNECTION_ERROR"],"msg":str(e)}
    except NoGoogleIDFound as e:
      yield {"code":CCODES["GOOGLE_ID_NOT_FOUND"],"msg":str(e)}


def startLogin(CCODES):
  yield {"code":CCODES["GOOGLE_LOGIN_STARTED"],"msg":"Google Login Started"}

  try:
    SCOPES = ["https://www.googleapis.com/auth/drive","https://www.googleapis.com/auth/drive.appdata"]
    CREDS_FILE_PATH = str(os.path.join(os.environ["APP_FOLDER_PATH"],"credentials.json"))
    TOKEN_FILE_PATH = str(os.path.join(os.environ["APP_FOLDER_PATH"],"token.pickle"))

    host = "localhost"
    port = 8000

    flow = InstalledAppFlow.from_client_secrets_file(CREDS_FILE_PATH, SCOPES)
    flow.redirect_uri =  f"http://{host}:{port}"
    auth_url,_ = flow.authorization_url(prompt='consent')

    wsgi_app = _RedirectWSGIApp("Authorization Complete, You may now close this window.")

    wsgiref.simple_server.WSGIServer.allow_reuse_address = False

    local_server = wsgiref.simple_server.make_server(
        host, port, wsgi_app, handler_class=_WSGIRequestHandler
    )

    webbrowser.open(auth_url, new=1, autoraise=True)
    yield {"code":CCODES["OPEN_BROWSER"],"msg":"Open your Browser, For Google Login"}

    yield {"code":CCODES["LOCAL_SERVER_STARTED"],"msg":f"Local Server Started at http://{host}:{port}","data":{"host":host,"port":port}}
    local_server.handle_request()

    yield {"code":CCODES["LOCAL_SERVER_CLOSED"],"msg":"Local Server Closed"}
    local_server.server_close()

    # Note: using https here because oauthlib is very picky that
    # OAuth 2.0 should only occur over https.
    authorization_response = wsgi_app.last_request_uri.replace('http','https')
    yield {"code":CCODES["GOOGLE_LOGIN_URL"],"msg":"Google Login URL","data":{"url":authorization_response}}

    flow.fetch_token(authorization_response=authorization_response)

    creds = flow.credentials

    with open(TOKEN_FILE_PATH, 'wb') as token:
      pickle.dump(creds, token)
    yield {"code":CCODES["GOOGLE_LOGIN_SUCCESS"],"msg":"Google Login Was Successfull!"}

  except OSError as e:
    yield {"code":CCODES["INTERNET_CONNECTION_ERROR"],"msg":str(e)}
  except Exception as e:
    yield {"code":CCODES["GOOGLE_LOGIN_FAILED"],"msg":str(e)}
