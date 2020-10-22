import pickle
import os
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from tabulate import tabulate #Is just used to print the data in a tabular manner
from colorama import Fore,Style
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

def get_gdrive_service():
    # print(f"{Fore.YELLOW}Requesting Google Drive Service{Style.RESET_ALL}")
    creds = None
    # If modifying these scopes, delete the file token.pickle.
    SCOPES = ["https://www.googleapis.com/auth/drive","https://www.googleapis.com/auth/drive.appdata"]

    # The file token.pickle stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)

    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # credFile = 
            flow = InstalledAppFlow.from_client_secrets_file('/home/sahil/Desktop/FVS-GIT-CLONE/DrivePart/credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)

        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    # return Google Drive API service
    return build('drive', 'v3', credentials=creds)  #This the drive service object which will be used to carry out all the tasks