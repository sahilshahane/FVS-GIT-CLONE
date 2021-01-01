import pickle,os,socket,pathlib
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

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
SCOPES = ["https://www.googleapis.com/auth/drive","https://www.googleapis.com/auth/drive.appdata"]
def get_gdrive_service():
    creds = None
    
    # CONFIGURATIONS
    USER_HOME_PATH = pathlib.Path.home()
    CREDS_FILE_PATH = str(os.path.join(USER_HOME_PATH,".usp/credentials.json"))
    TOKEN_FILE_PATH = str(os.path.join(USER_HOME_PATH,".usp/token.pickle"))
    
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
                flow = InstalledAppFlow.from_client_secrets_file(CREDS_FILE_PATH, SCOPES)
                creds = flow.run_local_server(port=0)
            # Save the credentials for the next run
            with open(TOKEN_FILE_PATH, 'wb') as token:
                pickle.dump(creds, token)

        # return Google Drive API service
        return build('drive', 'v3', credentials=creds)  #This the drive service object which will be used to carry out all the tasks
    except OSError as e:
        print("CHECK YOUR INTERNET CONNECTION",e)
        return "stop"