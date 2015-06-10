import ftplib
import os

server = 'www.steltix.com'
username = 'u51658502-mccabe'
password = 'MyDropzone'
myFTP = ftplib.FTP(server, username, password)
myPath = r'\Users\christianmccabe\development\itemUpdate'
def uploadThis(path):
    files = os.listdir(path)
    os.chdir(path)
    for f in files:
        if os.path.isfile(path + r'\{}'.format(f)):
            fh = open(f, 'rb')
            myFTP.storbinary('STOR %s' % f, fh)
            fh.close()
        elif os.path.isdir(path + r'\{}'.format(f)):
            myFTP.mkd(f)
            myFTP.cwd(f)
            uploadThis(path + r'\{}'.format(f))
    myFTP.cwd('..')
    os.chdir('..')
uploadThis(myPath) 