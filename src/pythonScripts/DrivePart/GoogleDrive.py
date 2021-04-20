import pickle
import os
import socket
import sys
from google.auth import credentials
from google.auth.environment_vars import CREDENTIALS
import googleapiclient
from googleapiclient.discovery import Resource, build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.http import BatchHttpRequest, MediaFileUpload, MediaIoBaseDownload
import orjson
from utils import output, saveJSON, printJSON
import webbrowser
import wsgiref.simple_server
import wsgiref.util
import main
import pathlib
import google_auth_httplib2
from urllib.error import HTTPError
import httplib2
import mimetypes
import io
import pyrfc3339
from datetime import datetime

CREDENTIALS = None
service: Resource = None
ActivityService = None


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
    def __init__(self, msg="No Google Login / ID Found, Please Log In") -> None:
        super().__init__(msg)

def build_request(http, *args, **kwargs):
    new_http = google_auth_httplib2.AuthorizedHttp(
        credentials=CREDENTIALS, http=httplib2.Http())
    return googleapiclient.http.HttpRequest(new_http, *args, **kwargs)

def getService(CCODES, creds=None, api=None):
    global CREDENTIALS
    global service

    # if CREDENTIALS: return build('drive', 'v3', credentials=CREDENTIALS, requestBuilder=build_request)

    if service and not api:
        return service
    else:
        TOKEN_FILE_PATH = str(os.path.join(
            os.environ["APP_HOME_PATH"], "token.pickle"))
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

            if not api:
                api = {"name": "drive", "version": "v3"}

            API_SERVICE = build(api["name"], api["version"],
                                credentials=creds, requestBuilder=build_request)

            if api["name"] == "drive":
                service = API_SERVICE

            return API_SERVICE
        except OSError as e:
            output(
                {"code": CCODES["INTERNET_CONNECTION_ERROR"], "msg": str(e)})
        except NoGoogleIDFound as e:
            output({"code": CCODES["GOOGLE_ID_NOT_FOUND"], "msg": str(e)})

def getActivityService(CCODES):
    global ActivityService

    if ActivityService:
        return ActivityService

    ActivityService = getService(
        CCODES, api={"name": "driveactivity", "version": "v2"})

    return ActivityService

def startLogin(CCODES):
    output({"code": CCODES["GOOGLE_LOGIN_STARTED"],
           "msg": "Google Login Started"})

    try:
        SCOPES = ["https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/drive.appdata",
                  "https://www.googleapis.com/auth/drive.activity.readonly"]
        CREDS_FILE_PATH = str(os.path.join(
            os.environ["APP_HOME_PATH"], "credentials.json"))
        TOKEN_FILE_PATH = str(os.path.join(
            os.environ["APP_HOME_PATH"], "token.pickle"))

        host = "localhost"
        port = 8000

        flow = InstalledAppFlow.from_client_secrets_file(
            CREDS_FILE_PATH, SCOPES)
        flow.redirect_uri = f"http://{host}:{port}"
        auth_url, _ = flow.authorization_url(prompt='consent')

        wsgi_app = _RedirectWSGIApp(
            "Authorization Complete, You may now close this window.")

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
        authorization_response = wsgi_app.last_request_uri.replace(
            'http', 'https')
        # output({"code":CCODES["GOOGLE_LOGIN_URL"],"msg":"Google Login URL","data":{"url":authorization_response}})

        flow.fetch_token(authorization_response=authorization_response)

        creds = flow.credentials

        return getService(CCODES, creds=creds)
    except OSError as e:
        output({"code": CCODES["INTERNET_CONNECTION_ERROR"], "msg": str(e)})
        output({"code": CCODES["GOOGLE_LOGIN_FAILED"], "msg": str(e)})
    except Exception as e:
        output({"code": CCODES["GOOGLE_LOGIN_FAILED"], "msg": str(e)})

def getUSERInfo(CCODES):
    service = getService(CCODES)
    userInfo = {}

    def assignData(req_id, res, err):
      nonlocal userInfo

      if(err): raise err
      if(req_id == '1'): userInfo.update(res)
      elif(req_id == '2'): userInfo["rootFolderDriveID"] = res["id"]

    batch = service.new_batch_http_request(callback=assignData)
    batch.add(service.about().get(fields="user,storageQuota"))
    batch.add(service.files().get(fileId="root",fields="id"))
    batch.execute()

    return userInfo

def downloadGoogleWorkspaceFile(CCODES, driveID, filePath, repoID, newMime, service):
    fileExtension = {
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".pptx",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".xlsx"
    }
    request = service.files().export_media(fileId=driveID, mimeType=newMime)
    fileBytes = io.BytesIO()
    downloader = MediaIoBaseDownload(fileBytes, request)
    done = False
    while not done:
        status, done = downloader.next_chunk()
        # print(status.progress())

    fileBytes.seek(0)
    if os.path.exists(filePath):
        os.remove(filePath)

    _, extName = os.path.splitext(filePath)
    filePath = filePath[:-len(extName)]+fileExtension[newMime]

    return [fileBytes, filePath]

def downloadFile(CCODES, driveID, fileName, filePath, repoID):
    service = getService(CCODES)
    fileBytes = io.BytesIO()
    driveID = driveID
    googleWorkspace = {
        "application/vnd.google-apps.document": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.google-apps.spreadsheet": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.google-apps.presentation": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    }

    fileMimeType = ""
    fileMimeType = service.files().get(
        fileId=driveID, fields="mimeType").execute()["mimeType"]

    if fileMimeType in googleWorkspace:
        fileBytes, filePath = downloadGoogleWorkspaceFile(
            CCODES, driveID, filePath, repoID, googleWorkspace[fileMimeType], service)
    else:
      request = None

      try:
        request = service.files().get_media(fileId=driveID)
      except HTTPError:
        request = service.files().get_media(fileId=driveID, acknowledgeAbuse=True)

      downloader = MediaIoBaseDownload(fileBytes, request)
      done = False
      while not done:
          status, done = downloader.next_chunk()
          # print(status.progress())

    fileBytes.seek(0)
    if os.path.exists(filePath):
        os.remove(filePath)
    with open(filePath, "wb") as dest:
        dest.write(fileBytes.read())

def createFolder(CCODES, folderName, GdriveID=None, parentID=None, fields="id", service=None):
    folder_metadata = {
        "id": GdriveID,
        "name": folderName,
        # If the user wants to upload gsuit files(docs, spreadsheet etc) then there is another mimeType for that https://developers.google.com/drive/api/v3/manage-uploads#multipart
        "mimeType": "application/vnd.google-apps.folder",
    }                                                         # In the first case the parent can be empty in order to add the main folder in "MyDrive"

    if parentID:
        folder_metadata["parents"] = [parentID]

    return service.files().create(body=folder_metadata, fields=fields)

def uploadFile(CCODES, RepoID, fileName, filePath, driveID, parentDriveID):
    service = getService(CCODES)

    metaData = {
        "name": fileName,
        "parents": [parentDriveID]
    }

    if(driveID):
        metaData["id"] = driveID

    media = MediaFileUpload(filePath)
    response = service.files().create(
        body=metaData, media_body=media, fields='id').execute()

    driveID = response['id']

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

def getStartPageToken(service):
    return service.changes().getStartPageToken(fields="startPageToken")

def createRepoFolders(CCODES, task):
    service = getService(CCODES)

    repoFolderData = task["data"]["repoFolderData"]
    folderData = task["data"]["folderData"]

    RepoID = task["data"]["RepoID"]

    repoFolderName = repoFolderData["RepoName"]
    repoFolderPath = repoFolderData["folderPath"]
    repoFolderID = repoFolderData["driveID"]
    db_repo_folder_id = repoFolderData["folder_id"]

    CREATED_FOLDERS = dict()

    # CHECK IF repo FOLDER IS PRESENT
    if not repoFolderID:
        repoCreatedTime = None
        pageToken = None

        def assignResponse(req_id, response, err):
            nonlocal repoFolderID
            nonlocal repoCreatedTime
            nonlocal pageToken

            if(err):
                raise err
            repoFolderID = response["id"]
            repoCreatedTime = response["createdTime"]

        batch = service.new_batch_http_request(callback=assignResponse)
        batch.add(createFolder(CCODES, repoFolderName,
                  fields="id, createdTime", service=service))
        batch.execute()

        trackingInfo = {"lastChecked": repoCreatedTime, "driveID": repoFolderID}

        # NOTIFY GUI
        output({"code": CCODES["REPO_FOLDER_CREATED_DRIVE"], "data": {
               "RepoID": RepoID, "trackingInfo": trackingInfo, "folder_id": db_repo_folder_id}})

    CREATED_FOLDERS[repoFolderPath] = repoFolderID

    for folder in folderData:
        folderPath = folder["folderPath"]
        db_folder_id = folder["folder_id"]

        parentPath = os.path.dirname(folderPath)
        folderName = os.path.basename(folderPath)
        parentID = CREATED_FOLDERS.get(parentPath)

        if parentID:
            driveID = createFolder(
                CCODES, folderName, parentID=parentID, service=service).execute()['id']
            CREATED_FOLDERS[folderPath] = driveID

            # NOTIFY GUI
            output({"code": CCODES["FOLDER_CREATED_DRIVE"], "data": {
                   "RepoID": RepoID, "folder_id": db_folder_id, "driveID": driveID}})

def getActivities_API(activityService, repoDriveId, trackingTime):
    activities = []

    pageToken = None

    while True:
        response = activityService.activity().query(
            body={
                "ancestorName": f"items/{repoDriveId}",
                "filter": f'time >= "{trackingTime}"',
                "pageToken": pageToken
            },
            fields="activities(primaryActionDetail,actions,targets(driveItem(name,title,mimeType)),timestamp)"
        ).execute()

        activities.extend(response.get('activities', []))
        pageToken = response.get('nextPageToken', None)

        if pageToken is None:
            break

    def createAction(driveID, activity):
        for action in activity["actions"]:

          if(action["detail"].get('move')):
            parentID = action["detail"]["move"]["addedParents"][0]["driveItem"]["name"][6:]
            CHANGES[driveID]["parents"] = parentID
            # print("Got Parent of Activity",driveID)

            break

        return True

    def deleteAction(driveID, activity):
        doesRestoreActionExists = CHANGES[id]["actions"].get("restore")
        # IF THE RESTORE ACTION EXISTS, THEN DO NOT UPDATE
        if(doesRestoreActionExists):
            return False

        # IF THE RESTORE ACTION DOES NOT EXISTS, THEN UPDATE IT
        return True

    def moveAction(driveID, activity):
        parentID = activity["primaryActionDetail"]["move"]["addedParents"][0]["driveItem"]["name"][6:]
        CHANGES[id]["parents"] = parentID

        return True

    ActionFunctions = {
        "delete": deleteAction,
        "create": createAction,
        "move": moveAction
    }

    CHANGES = {}

    for activity in activities:
        driveItems = activity["targets"][0]["driveItem"]
        # this might be confusing name~title
        id = driveItems["name"][6:]

        primaryAction = next(iter(activity["primaryActionDetail"]))

        if CHANGES.get(id):
            doesActionExists = CHANGES[id]["actions"].get(primaryAction)

            if(doesActionExists):
                continue

        else:
            CHANGES[id] = {
                "name": driveItems["title"],
                "mimeType": driveItems["mimeType"],
                "actions": {},
                "timestamp": activity["timestamp"]
            }


        actionFunction = ActionFunctions.get(primaryAction, lambda *args: True)

        shouldUpdateActions = actionFunction(id, activity)

        if (shouldUpdateActions):
            CHANGES[id]["actions"].update(activity["primaryActionDetail"])

    return CHANGES

def checkChanges(CCODES, repoDriveId, lastCheckedTime):
    service = getService(CCODES)
    activityService = getActivityService(CCODES)

    ACTIVITIES_API_RESPONSE = getActivities_API(
        activityService, repoDriveId, lastCheckedTime)

    updatedLastChecked = pyrfc3339.generate(
        datetime.utcnow(), accept_naive=True, utc=True)

    responseIDs = {}

    def assignData(res_id, res, err):
        nonlocal ACTIVITIES_API_RESPONSE

        driveID = responseIDs[int(res_id)]

        if(err):
            raise err
            # fileDetails = ACTIVITIES_API_RESPONSE[driveID]
            # printJSON({"ERROR" : str(err),"code" : "FAILED", "data": fileDetails})
        else:
            res["parents"] = res["parents"][0]
            ACTIVITIES_API_RESPONSE[driveID].update(res)

    # BATCH SERVICE
    batch = service.new_batch_http_request(callback=assignData)

    # SET INITIAL DATA
    request_count = 1
    MAX_BATCH_REQUETS_LIMIT = 99
    AAR_ITERATOR = iter(ACTIVITIES_API_RESPONSE)

    while(True):

        try:
            id = next(AAR_ITERATOR)
        except StopIteration:
            break

        isPermanentDelete = ACTIVITIES_API_RESPONSE[id]["actions"].get(
            "delete", {}).get("type") == "PERMANENT_DELETE"

        isParentIDAssigned = ACTIVITIES_API_RESPONSE[id].get("parents")

        # MAX BATCH REQUESTS ARE LIMITED TO 1000
        if(request_count == MAX_BATCH_REQUETS_LIMIT):
            batch.execute()

            request_count = 1
            responseIDs = {}
            batch = service.new_batch_http_request(callback=assignData)

        if (not isPermanentDelete) and (not isParentIDAssigned):
            responseIDs[request_count] = id

            batch.add(service.files().get(
                fileId=id, fields="parents"))

            # INCREASE THE RESPONSE_ID
            request_count += 1

    batch.execute()

    return {
        "changes": ACTIVITIES_API_RESPONSE,
        "trackingInfo": {
            "lastChecked": updatedLastChecked
        }
    }
