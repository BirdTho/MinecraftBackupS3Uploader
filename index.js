import 'dotenv/config';
import chokidar from 'chokidar';
import slugify from 'slugify';
import fetch from 'node-fetch';
import util from 'util';
import child_process from 'child_process';

/**
 * For the fully-qualified URL
 * @param {string} fileName 
 * @returns {string}
 */
function getS3Url(fileName) {
    return `https://${process.env.BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(fileName)}`;
}

const exec = util.promisify(child_process.exec);

async function uploadToS3(fromPath, fileName) {
    const { stdout, stderr } = await exec(`aws s3 cp ${fromPath} s3://${process.env.BUCKET}/${fileName} --output json --acl public-read --no-progress`);
    // console.log('stdout:', stdout);
    // console.log('stderr:', stderr);
    return [JSON.parse(stdout), JSON.parse(stderr)];
}

async function sendDiscordMessage(message) {
    if (process.env.DISCORD_WEBHOOK) {
        await fetch(process.env.DISCORD_WEBHOOK, {
            method: 'post',
            body: JSON.stringify({
                content: message,
            }),
            headers: {'Content-Type': 'application/json'}
        });
    }
}

/**
 * 
 * @param {string} path
 */
async function addFile(path) {
    const fileName = slugify(path.split('\\').pop());
    await sendDiscordMessage(`Backup upload started for ${path} as ${fileName}`);
    console.log(`File added: ${path}. Uploading to S3 as ${fileName}`);
    const runResult = await uploadToS3(path, fileName);
    console.log(runResult);
    console.info(`${fileName} written to S3`);
    
    const publicUrl = getS3Url(fileName);
    console.log(publicUrl);
    await sendDiscordMessage(`A backup is now available for download at ${publicUrl}`)
};

/**
 * 
 * @param {string} path
 */
function removeFile(path) {
    console.log(`Removed ${path}`);
};

var watcher = chokidar.watch(process.env.BACKUP_DIRECTORY, {
    ignored: /^\./,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
        pollInterval: 5000,
        stabilityThreshold: 10000,
    }
});

watcher
  .on('change', function(path) {console.log('File', path, 'has been changed');})
  .on('error', function(error) {console.error('Error happened', error);})
  .on('add', addFile)
  .on('unlink', removeFile);

  console.log(`Listening for file changes in ${process.env.BACKUP_DIRECTORY}`);