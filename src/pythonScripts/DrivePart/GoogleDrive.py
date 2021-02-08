import pickle,os,socket,sys
from google.auth import credentials
from google.auth.environment_vars import CREDENTIALS
import googleapiclient
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.http import MediaFileUpload
import orjson
from utils import output
import webbrowser
import wsgiref.simple_server
import wsgiref.util
import main
import pathlib
import google_auth_httplib2
import httplib2

CREDENTIALS = None
service = None

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

def build_request(http, *args, **kwargs):
  new_http = google_auth_httplib2.AuthorizedHttp(credentials=CREDENTIALS, http=httplib2.Http())
  return googleapiclient.http.HttpRequest(new_http, *args, **kwargs)

def getService(CCODES,creds = None):
    global CREDENTIALS
    global service

    # if CREDENTIALS: return build('drive', 'v3', credentials=CREDENTIALS, requestBuilder=build_request)
    if service: return service
    else:
      TOKEN_FILE_PATH = str(os.path.join(os.environ["APP_HOME_PATH"],"token.pickle"))
      try:
        # The file token.pickle stores the user's access and refresh tokens, and is
        # created automatically when the authorization flow completes for the first
        # time.
        if os.path.exists(TOKEN_FILE_PATH) and not creds:
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

        # output({"code":CCODES["GOOGLE_ID_FOUND"],'msg':"Found an Google Account"})
        # return Google Drive API service
        CREDENTIALS = creds
        service = build('drive', 'v3', credentials=creds, requestBuilder=build_request)
        return service
      except OSError as e:
        output({"code": CCODES["INTERNET_CONNECTION_ERROR"],"msg":str(e)})
      except NoGoogleIDFound as e:
        output({"code": CCODES["GOOGLE_ID_NOT_FOUND"],"msg":str(e)})

def startLogin(CCODES):
  output({"code": CCODES["GOOGLE_LOGIN_STARTED"],"msg":"Google Login Started"})

  try:
    SCOPES = ["https://www.googleapis.com/auth/drive","https://www.googleapis.com/auth/drive.appdata"]
    CREDS_FILE_PATH = str(os.path.join(os.environ["APP_HOME_PATH"],"credentials.json"))
    TOKEN_FILE_PATH = str(os.path.join(os.environ["APP_HOME_PATH"],"token.pickle"))

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
    # output({"code":CCODES["OPEN_BROWSER"],"msg":"Open your Browser, For Google Login"})

    # output({"code":CCODES["LOCAL_SERVER_STARTED"],"msg":f"Local Server Started at http://{host}:{port}","data":{"host":host,"port":port}})
    local_server.handle_request()

    # output({"code":CCODES["LOCAL_SERVER_CLOSED"],"msg":"Local Server Closed"})
    local_server.server_close()

    # Note: using https here because oauthlib is very picky that
    # OAuth 2.0 should only occur over https.
    authorization_response = wsgi_app.last_request_uri.replace('http','https')
    # output({"code":CCODES["GOOGLE_LOGIN_URL"],"msg":"Google Login URL","data":{"url":authorization_response}})

    flow.fetch_token(authorization_response=authorization_response)

    creds = flow.credentials

    return getService(CCODES, creds)
  except OSError as e:
    output({"code": CCODES["INTERNET_CONNECTION_ERROR"],"msg":str(e)})
    output({"code": CCODES["GOOGLE_LOGIN_FAILED"],"msg":str(e)})
  except Exception as e:
    output({"code": CCODES["GOOGLE_LOGIN_FAILED"],"msg":str(e)})

def getUSERInfo(CCODES):
  service = getService(CCODES)
  userInfo = service.about().get(fields="user,storageQuota").execute()
  return userInfo

def generateIDs(CCODES, count=1):
  service = getService(CCODES)
  ids = []
  if(count <= 1000):
    ids.extend(service.files().generateIds(count=count).execute().get("ids"))
  else:
    def addIds(req_id, resp, exception):
      ids.extend(resp["ids"])

    batch = service.new_batch_http_request()
    while(count > 0):
      if(count >= 1000):
        batch.add(service.files().generateIds(count=1000),callback=addIds)
      else:
        batch.add(service.files().generateIds(count=count),callback=addIds)

      count = count - 1000

    batch.execute()
  return ids

def allocateGFID(CCODES, DIR_PATH, service = None):
  if(not service): service = get_gdrive_service(CCODES)

  MD_FILE_INFO = main.Get_latest_commit_info(DIR_PATH)

  GFID_FILE_PATH = os.path.join(MD_FILE_INFO["RepositoryPath"],os.environ["DEFAULT_REPO_CLOUD_STORAGE_FOLDER_PATH"],MD_FILE_INFO["fileName"])
  file_ = open(GFID_FILE_PATH,'r+')

  GFID_DATA = orjson.loads(file_.read())

  generate_count = 0
  UNALLOCATED = set()

  for ParentFolder, VALUE in GFID_DATA.items():
    if not VALUE["id"]:
      generate_count+=1
      UNALLOCATED.add(ParentFolder)

    for index, _ in enumerate(VALUE["files"]):
      if not VALUE["files"][index]["id"]:
        generate_count+=1
        UNALLOCATED.add(ParentFolder)
  if(generate_count>0):
    GDRIVE_IDs = iter(generateIDs(CCODES,count=generate_count,service=service))

    for ParentFolder in UNALLOCATED:
      # ALLOCATE ID TO FOLDERS
      if not GFID_DATA[ParentFolder]["id"]:
        GFID_DATA[ParentFolder]["id"] = next(GDRIVE_IDs)

      # ALLOCATE ID TO FILES
      for index, _ in enumerate(GFID_DATA[ParentFolder]["files"]):
        if not GFID_DATA[ParentFolder]["files"][index]["id"]:
          GFID_DATA[ParentFolder]["files"][index]["id"] = next(GDRIVE_IDs)

    # RE-SAVE THE DATA
    file_.seek(0,0)
    file_.write(orjson.dumps(GFID_DATA).decode('utf-8'))

  file_.close()
  return (GFID_DATA, MD_FILE_INFO)

def createFolder(CCODES, folderName, GdriveID = None, parentID = None, service = None):
  folder_metadata = {
    "id": GdriveID,
    "name": folderName,
    "mimeType": "application/vnd.google-apps.folder",       #If the user wants to upload gsuit files(docs, spreadsheet etc) then there is another mimeType for that https://developers.google.com/drive/api/v3/manage-uploads#multipart
  }                                                         # In the first case the parent can be empty in order to add the main folder in "MyDrive"

  if parentID: folder_metadata["parents"] = [parentID]

  return service.files().create(body=folder_metadata, fields='id').execute()['id']

def uploadFile(CCODES, RepoID, fileName, filePath, driveID, parentDriveID):
  service = getService(CCODES)

  metaData = {
            "name": fileName,
            "parents":[parentDriveID]
            }
  if(driveID): metaData["id"] = driveID

  media = MediaFileUpload(filePath)
  driveID = service.files().create(body=metaData, media_body=media,fields = 'id').execute()['id']

  # if(os.path.getsize(filePath)/(10**6) < 6):
  #   media = MediaFileUpload(filePath)
  #   driveID = service.files().create(body=metaData, media_body=media,fields = 'id').execute()['id']
  # else :
  #   media = MediaFileUpload(filePath,resumable=True,chunksize=1024*1024)
  #   file = service.files().create(body=metaData, media_body=media, fields = 'id')
  #   response = None

  #   while response is None:
  #     status, response = file.next_chunk()
  #     if status: output({"code":CCODES["UPLOAD_PROGRESS"], "data" : {  "percent" : int(status.progress() * 100)}, "RepoID": RepoID, "filePath": filePath})

  #   driveID = file['id']

  return driveID

def uploadRepository(CCODES,DIR_PATH, service = None):
  if(not service): service = get_gdrive_service(CCODES)

  # CHECK AND ALLOCATE FILE IDs
  GFID_DATA, MD_FILE_INFO = allocateGFID(CCODES, DIR_PATH, service)

  # CHECK IF ROOT FOLDER CREATED OR NOT, btw MD_FILE_INFO["RepositoryPath"] === Root Path of Drive Space
  RootFolderPresent = GFID_DATA[DIR_PATH]["isCreated"]
  # totalFiles = MD_FILE_INFO["totalFiles"]
  # totalFolders = MD_FILE_INFO["totalFolders"]

  try:
    if not RootFolderPresent:
        RepositoryFolderName = os.path.basename(DIR_PATH)
        createFolder(CCODES, RepositoryFolderName, GFID_DATA[DIR_PATH]["id"], service=service)
        GFID_DATA[DIR_PATH]["isCreated"] = True
  except Exception as e:
    pass

  for ParentDir, _ in GFID_DATA.items():

    # THIS IS CREATING EMPTY FOLDERS
    for folderName in GFID_DATA[ParentDir]["folders"]:
      folderPath = os.path.join(ParentDir,folderName)

      if GFID_DATA[folderPath]["isCreated"]: continue
      folderID = GFID_DATA[folderPath]["id"]

      isCreated = createFolder(CCODES, folderName, folderID,parentID=GFID_DATA[ParentDir]["id"], service=service)
      if isCreated : GFID_DATA[ParentDir]["isCreated"] = True


    # THIS IS UPLOADING FILES
    for index, fileData in enumerate(GFID_DATA[ParentDir]["files"]):
      if not GFID_DATA[ParentDir]["isCreated"]: continue
      if GFID_DATA[ParentDir]["files"][index]["isUpdated"]: continue

      filePath = os.path.join(ParentDir,fileData["name"])

      isUploaded = uploadFile(CCODES, fileData["name"], filePath, fileData["id"], GFID_DATA[ParentDir]["id"],service=service)
      if(isUploaded): GFID_DATA[ParentDir]["files"][index]["isUpdated"] = True


  GFID_FILE_PATH = os.path.join(DIR_PATH,os.environ["DEFAULT_REPO_CLOUD_STORAGE_FOLDER_PATH"],MD_FILE_INFO["fileName"])

  with open(GFID_FILE_PATH,"w") as file_:
    file_.write(orjson.dumps(GFID_DATA).decode('utf-8'))

def createRepoFolders(CCODES, RepoID, rootFolderName, rootFolderPath, folderData):
  service = getService(CCODES)

  # CHECK IF ROOT FOLDER IS PRESENT
  if not folderData[rootFolderPath]:
    folderData[rootFolderPath] = createFolder(CCODES,rootFolderName,service=service)

  for folderPath in folderData:
    if not folderData[folderPath]:
      parentPath = os.path.dirname(folderPath)
      folderName = os.path.basename(folderPath)
      try:
        parentID = folderData[parentPath]
        if parentID:
          folderData[folderPath] = createFolder(CCODES,folderName,parentID=parentID,service=service)
      except KeyError: pass

  return folderData
