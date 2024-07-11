# Minecraft Public S3 Backup Script


## Prerequisites
1. AWS CLI installed
2. An S3 bucket with ACL on
3. Permission to access the bucket from AWS CLI

## Installing
1. Check out the repo.
2. Run `npm install` from within the project folder.

## Configuring
So as not to interfere with the server running Minecraft, if they share the same bandwidth, you may wish to use:
```
aws configure set default.s3.max_bandwidth 50MB/s
```
Replace 50MB/s with a reasonable speed to run things at.

Find the `.env` file. This file contains key-value pairs like KEY=value

The values are:
* `AWS_REGION` - Required (AWS region of bucket, such as `us-east-1`)
* `BUCKET` - Required (bucket to send backups to)
* `BACKUP_DIRECTORY` - Required, the directory to watch for new files
* `DISCORD_WEBHOOK` - Optional, a webhook to push the public URLs to and messages about backups.


## Running
Run `npm start`,

Alternatively, make a `run.bat` file with the following:
```
cd <Project directory>
npm start
pause
```
